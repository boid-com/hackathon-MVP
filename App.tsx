import React, { useState, useRef } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { ChatScreen } from './components/ChatScreen';
import { SpecScreen } from './components/SpecScreen';
import { SessionState, ExperienceLevel, ConversationMessage, PHASES, PMPhase } from './types';
import { createPMSession, generateSpecFromHistory } from './services/geminiService';
import { Chat } from '@google/genai';

function App() {
  // Application State
  const [view, setView] = useState<'landing' | 'chat' | 'spec' | 'generating'>('landing');
  const [session, setSession] = useState<SessionState>({
    userId: '',
    email: '',
    initialIdea: '',
    experienceLevel: 'intermediate',
    phase: 'idea',
    messages: [],
  });
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref to hold the mutable chat client instance
  const chatClientRef = useRef<Chat | null>(null);

  // Mock function to simulate saving to Google Sheets
  const saveToGoogleSheet = async (data: Partial<SessionState>) => {
      // -----------------------------------------------------------------------
      // TODO: To enable real Google Sheet saving:
      // 1. Create a Google Apps Script Web App that accepts POST requests.
      // 2. Paste the Web App URL below as GOOGLE_SCRIPT_URL.
      // -----------------------------------------------------------------------
      // const GOOGLE_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
      
      console.log('📝 [Google Sheet] Saving row data:', {
        timestamp: new Date().toISOString(),
        ...data
      });

      // Example fetch implementation:
      // if (GOOGLE_SCRIPT_URL) {
      //   try {
      //     await fetch(GOOGLE_SCRIPT_URL, {
      //       method: 'POST',
      //       body: JSON.stringify(data),
      //       mode: 'no-cors' // Google Apps Script requires no-cors for simple requests
      //     });
      //   } catch (e) {
      //     console.error("Failed to save to sheet", e);
      //   }
      // }
  };

  // 1. Start Session
  const handleStartSession = async (userId: string, email: string, idea: string, level: ExperienceLevel) => {
    // Save preliminary data
    saveToGoogleSheet({ userId, email, initialIdea: idea, experienceLevel: level });

    setSession({
      userId,
      email,
      initialIdea: idea,
      experienceLevel: level,
      phase: 'idea',
      messages: [],
    });
    setView('chat');
    setIsTyping(true);

    try {
      // Initialize Gemini Chat
      chatClientRef.current = createPMSession(userId, idea, level);

      // Trigger the first message from AI
      const result = await chatClientRef.current.sendMessage({ message: `The user is ready. Their idea is: "${idea}". Begin the interview.` });
      
      const text = result.text;
      if (text) {
        addMessage('pm', text);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      addMessage('pm', "Sorry, I'm having trouble connecting. Please refresh and try again.");
    } finally {
      setIsTyping(false);
    }
  };

  // 2. Handle User Messages
  const handleSendMessage = async (text: string) => {
    addMessage('user', text);
    setIsTyping(true);

    // Determine context for phase progression (Basic heuristic logic)
    // We append the current phase to the message to keep the AI aligned without showing it to user
    const currentPhaseLabel = PHASES.find(p => p.id === session.phase)?.label || "Unknown";
    const contextPrompt = `${text}\n[SYSTEM_NOTE: Current Phase: ${currentPhaseLabel}. Keep strictly to the 3-minute limit. If you have enough info for this phase, move to next. If phase is validation, wrap up.]`;

    try {
      if (!chatClientRef.current) throw new Error("Chat client not initialized");
      
      const result = await chatClientRef.current.sendMessage({ message: contextPrompt });
      const responseText = result.text || "I didn't catch that.";
      addMessage('pm', responseText);
      
      // Basic Phase progression heuristic:
      const turnCount = session.messages.length / 2; // Rough approximation
      if (session.phase === 'idea' && turnCount > 2) updatePhase('users');
      else if (session.phase === 'users' && turnCount > 5) updatePhase('features');
      else if (session.phase === 'features' && turnCount > 8) updatePhase('flows');

    } catch (error) {
      console.error("Error sending message:", error);
      addMessage('pm', "I encountered an error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSkip = () => {
    handleSendMessage("I'm not sure, let's skip this part and use your best judgment.");
  };

  // 3. Generate Spec
  const handleFinish = async () => {
    setView('generating');
    try {
        // We pass the full message history + original idea
        const spec = await generateSpecFromHistory(session.messages, session.initialIdea);
        setSession(prev => ({ ...prev, generatedSpec: spec }));
        
        // Save the final result too
        saveToGoogleSheet({ 
            userId: session.userId, 
            email: session.email, 
            generatedSpec: spec 
        });

        setView('spec');
    } catch (e) {
        console.error(e);
        // Fallback if generation fails
        setView('chat');
        addMessage('pm', "I couldn't generate the spec just yet. Let's chat a bit more.");
    }
  };

  // Helper: Add Message
  const addMessage = (role: 'user' | 'pm', text: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      role,
      text,
      createdAt: Date.now(),
      phase: session.phase
    };
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  // Helper: Update Phase
  const updatePhase = (phase: PMPhase) => {
      setSession(prev => {
          if (prev.phase === phase) return prev;
          return { ...prev, phase };
      });
  };

  // Helper: Restart
  const handleRestart = () => {
    setView('landing');
    setSession({
      userId: '',
      email: '',
      initialIdea: '',
      experienceLevel: 'intermediate',
      phase: 'idea',
      messages: [],
    });
    chatClientRef.current = null;
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-synk-gradTop via-synk-gradMid to-synk-gradBot flex flex-col font-sans text-synk-graphite">
      {view === 'landing' && <LandingScreen onStart={handleStartSession} />}
      
      {view === 'chat' && (
        <ChatScreen 
          userId={session.userId}
          messages={session.messages}
          currentPhase={session.phase}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onSkip={handleSkip}
          onFinish={handleFinish}
        />
      )}

      {view === 'generating' && (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-synk-gradMid border-t-synk-primary rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-synk-forest">Generating Product Spec...</h2>
            <p className="text-synk-graphite opacity-60">Synthesizing insights from our conversation</p>
        </div>
      )}

      {view === 'spec' && session.generatedSpec && (
        <SpecScreen initialSpec={session.generatedSpec} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;