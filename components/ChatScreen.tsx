import React, { useEffect, useRef, useState } from 'react';
import { ConversationMessage, PHASES, PMPhase } from '../types';

interface ChatScreenProps {
  userId: string;
  messages: ConversationMessage[];
  currentPhase: PMPhase;
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onSkip: () => void;
  onFinish: () => void;
}

const TOTAL_TIME = 180; // 3 minutes in seconds

export const ChatScreen: React.FC<ChatScreenProps> = ({
  userId,
  messages,
  currentPhase,
  isTyping,
  onSendMessage,
  onSkip,
  onFinish,
}) => {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if we should show the primary CTA to generate spec
  // Show if phase is 'flows' (last phase) or time is up
  const showGenerateCTA = currentPhase === 'flows' || timeLeft <= 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Auto-focus input on new messages if not finished
    if (!showGenerateCTA && !isTyping) {
        inputRef.current?.focus();
    }
  }, [messages, isTyping, showGenerateCTA]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header - Floating Card style */}
      <div className="p-4 md:p-6 pb-0">
        <header className="bg-white rounded-2xl shadow-solarpunk px-6 py-4 flex items-center justify-between z-10 relative">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-synk-fog rounded-full flex items-center justify-center text-synk-forest font-bold text-xs">
              PM
            </div>
            <div>
              <h2 className="font-semibold text-synk-graphite">Session with {userId}</h2>
              <div className="flex items-center space-x-2 text-xs text-synk-graphite/60">
                 <span className={`${timeLeft < 30 ? 'text-red-500 font-bold' : ''}`}>
                   ⏱ {formatTime(timeLeft)} remaining
                 </span>
              </div>
            </div>
          </div>
          
          {/* Phase Indicators inside header for desktop, or below */}
          <div className="hidden md:flex space-x-1">
             {PHASES.map((phase, idx) => {
              const isActive = phase.id === currentPhase;
              const isPast = currentPhaseIndex > idx;
              return (
                <div key={phase.id} className={`h-1.5 w-8 rounded-full transition-colors ${
                  isActive ? 'bg-synk-primary' : isPast ? 'bg-synk-primary/40' : 'bg-synk-fog'
                }`} title={phase.label} />
              )
             })}
          </div>

          <button
            onClick={onFinish}
            className="text-xs font-medium text-synk-forest bg-synk-fog px-4 py-2 rounded-lg hover:bg-synk-primary/20 transition-colors"
          >
            Finish Early
          </button>
        </header>
      </div>

      {/* Mobile Phase Indicator */}
      <div className="md:hidden px-6 py-2 shrink-0">
        <div className="flex justify-between space-x-1">
          {PHASES.map((phase, idx) => {
            const isActive = phase.id === currentPhase;
            const isPast = currentPhaseIndex > idx;
            return (
              <div key={phase.id} className={`h-1 flex-1 rounded-full ${
                 isActive ? 'bg-synk-primary' : isPast ? 'bg-synk-primary/40' : 'bg-white/50'
              }`} />
            );
          })}
        </div>
        <div className="text-center mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-synk-forest/60">
                {PHASES.find(p => p.id === currentPhase)?.label}
            </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[65%] px-6 py-4 text-sm md:text-base leading-relaxed shadow-solarpunk ${
                msg.role === 'user'
                  ? 'bg-synk-primary text-synk-forest rounded-2xl rounded-tr-sm'
                  : 'bg-white text-synk-graphite rounded-2xl rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-solarpunk flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-synk-graphite/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-synk-graphite/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-synk-graphite/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area - Floating Surface */}
      <div className="p-4 md:p-6 pt-2 shrink-0 flex flex-col items-center">
        {showGenerateCTA && (
            <div className="w-full max-w-4xl mb-4 animate-fade-in-up">
                <button 
                    onClick={onFinish}
                    className="w-full bg-synk-forest text-white font-bold py-4 rounded-xl shadow-solarpunk hover:shadow-solarpunk-hover hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 border-2 border-synk-primary/50"
                >
                    <span className="text-lg">✨ Generate Product Spec</span>
                    <span className="opacity-80 font-normal text-sm ml-2">(Interview Complete)</span>
                </button>
            </div>
        )}

        <div className="bg-white p-2 rounded-2xl shadow-solarpunk max-w-4xl mx-auto flex items-center gap-2 w-full">
           <input
            ref={inputRef}
            type="text"
            className="flex-1 px-4 py-3 bg-transparent text-synk-graphite placeholder-synk-graphite/40 focus:outline-none"
            placeholder={showGenerateCTA ? "Add any final details or click Generate..." : "Type your reply..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            autoFocus
          />
          <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-synk-graphite/50 font-medium hover:text-synk-graphite hover:bg-synk-fog rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-synk-primary text-synk-forest font-bold rounded-xl hover:bg-[#58D68A] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};