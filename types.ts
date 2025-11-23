export type PMPhase = "idea" | "users" | "features" | "flows" | "complete";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";

export interface ConversationMessage {
  id: string;
  role: "pm" | "user";
  text: string;
  createdAt: number;
  phase?: PMPhase;
}

export interface SpecDoc {
  title: string;
  summary: string;
  problemStatement: string;
  targetUsers: string[];
  valueProposition: string;
  keyFeatures: string[];
  userStories: string[];
  constraintsAndNotes: string[];
}

export interface SessionState {
  userId: string;
  email: string;
  initialIdea: string;
  experienceLevel: ExperienceLevel;
  phase: PMPhase;
  messages: ConversationMessage[];
  generatedSpec?: SpecDoc;
}

export const PHASES: { id: PMPhase; label: string; durationHint: string }[] = [
  { id: "idea", label: "Idea & Goals", durationHint: "~45s" },
  { id: "users", label: "Users & Value", durationHint: "~45s" },
  { id: "features", label: "Core Features", durationHint: "~45s" },
  { id: "flows", label: "Happy Path", durationHint: "~45s" },
];