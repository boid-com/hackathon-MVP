import React, { useState } from 'react';
import { ExperienceLevel } from '../types';

interface LandingScreenProps {
  onStart: (userId: string, email: string, idea: string, level: ExperienceLevel) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [idea, setIdea] = useState('');
  const [level, setLevel] = useState<ExperienceLevel>('intermediate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim() && idea.trim() && email.trim()) {
      onStart(userId, email, idea, level);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-solarpunk overflow-hidden min-h-[600px]">
        {/* Left Branding Panel */}
        <div className="md:w-2/5 bg-synk-forest text-white p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-synk-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-synk-primary">Synk.build</h1>
            <p className="text-synk-fog opacity-90 text-lg leading-relaxed">
              Talk to a virtual product manager and leave with a clear spec, in under 3 minutes.
            </p>
          </div>
          <div className="space-y-6 relative z-10 mt-10">
            <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
              <h3 className="font-semibold text-synk-primary mb-3">How it works</h3>
              <ol className="list-decimal list-inside text-sm text-synk-fog/80 space-y-2">
                <li>Enter your idea</li>
                <li>Chat with AI PM for 3 mins</li>
                <li>Download your Spec Doc</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-10 md:p-14 flex items-center justify-center bg-white">
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
            <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="userId" className="block text-sm font-semibold text-synk-graphite mb-2 pl-1">
                    User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-synk-fog text-synk-graphite placeholder-synk-graphite/30 focus:outline-none focus:ring-2 focus:ring-synk-primary/50 transition-all"
                    placeholder="dev_sarah"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-synk-graphite mb-2 pl-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-synk-fog text-synk-graphite placeholder-synk-graphite/30 focus:outline-none focus:ring-2 focus:ring-synk-primary/50 transition-all"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
            </div>

            <div>
              <label htmlFor="idea" className="block text-sm font-semibold text-synk-graphite mb-2 pl-1">
                What are you building?
              </label>
              <textarea
                id="idea"
                required
                rows={4}
                className="w-full px-5 py-4 rounded-xl bg-synk-fog text-synk-graphite placeholder-synk-graphite/30 focus:outline-none focus:ring-2 focus:ring-synk-primary/50 transition-all resize-none"
                placeholder="A mobile app for tracking plant watering schedules with photo recognition..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-synk-graphite mb-3 pl-1">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'expert'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`px-3 py-3 text-sm font-medium rounded-xl capitalize transition-all ${
                      level === lvl
                        ? 'bg-synk-primary text-synk-forest shadow-md'
                        : 'bg-synk-fog text-synk-graphite/60 hover:bg-gray-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-synk-primary text-synk-forest font-bold py-4 px-6 rounded-xl hover:bg-[#58D68A] hover:shadow-solarpunk-hover transition-all transform active:scale-[0.99]"
            >
              Start PM Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};