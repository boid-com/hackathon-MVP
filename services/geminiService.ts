import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { ConversationMessage, ExperienceLevel, SpecDoc, PMPhase } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// ------------------------------------------------------------------
// Chat Initialization
// ------------------------------------------------------------------

export const createPMSession = (
  userId: string,
  idea: string,
  level: ExperienceLevel
): Chat => {
  const tone =
    level === "expert"
      ? "concise, technical, and direct"
      : level === "beginner"
      ? "encouraging, educational, and guiding"
      : "professional and structured";

  const systemInstruction = `
    You are an expert Senior Product Manager conducting a rapid 3-minute scoping interview with a user (ID: ${userId}).
    Your goal is to clarify their product idea to generate a "Product Spec Doc".

    Tone: ${tone}.

    The interview has 4 strict phases. You must stay in the current phase until you have just enough info, then move on.
    
    Phases:
    1. Idea & Goals: Clarify the core problem.
    2. Users & Value: Define personas and the main outcome/value prop.
    3. Core Features: List 3-5 distinct features.
    4. Validation/Flows: Walk through the "Happy Path" user flow.

    Rules:
    - Ask only ONE focused question at a time.
    - Keep messages short (under 2 sentences usually).
    - If the user is vague, ask a clarifying question.
    - If the user provides enough info for the phase, acknowledge briefly and move to the next phase question.
    - Do NOT output the spec yet. Just conduct the interview.
    
    Current Context: The user wants to build: "${idea}".
    Start by welcoming them and asking the first clarifying question about the core problem.
  `;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
};

// ------------------------------------------------------------------
// Spec Generation
// ------------------------------------------------------------------

const specSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy product name" },
    summary: { type: Type.STRING, description: "2-3 sentence executive summary" },
    problemStatement: { type: Type.STRING, description: "Clear definition of the problem being solved" },
    targetUsers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of user personas"
    },
    valueProposition: { type: Type.STRING, description: "The main value add for the user" },
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-7 core features"
    },
    userStories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "User stories in 'As a... I want to... So that...' format"
    },
    constraintsAndNotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Technical constraints, edge cases, or open questions"
    },
  },
  required: ["title", "summary", "problemStatement", "targetUsers", "valueProposition", "keyFeatures", "userStories"],
};

export const generateSpecFromHistory = async (
  messages: ConversationMessage[],
  initialIdea: string
): Promise<SpecDoc> => {
  // Convert chat history to a single text block for context
  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = `
    Based on the following conversation between a PM and a User, generate a structured Product Spec Doc.
    
    Original Idea: ${initialIdea}

    Conversation History:
    ${conversationText}

    Extract the details accurately. If something wasn't explicitly discussed, infer reasonable defaults based on the context.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: specSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SpecDoc;
    }
    throw new Error("No text returned from model");
  } catch (error) {
    console.error("Failed to generate spec:", error);
    // Fallback or re-throw
    throw error;
  }
};
