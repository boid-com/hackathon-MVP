import React, { useState } from 'react';
import { SpecDoc } from '../types';

interface SpecScreenProps {
  initialSpec: SpecDoc;
  onRestart: () => void;
}

export const SpecScreen: React.FC<SpecScreenProps> = ({ initialSpec, onRestart }) => {
  // Local state for edits
  const [spec, setSpec] = useState<SpecDoc>(initialSpec);

  // Update title or summary inline
  const handleChange = (field: keyof SpecDoc, value: string) => {
    setSpec((prev) => ({ ...prev, [field]: value }));
  };

  const generateMarkdown = () => {
    return `
# ${spec.title}

## Summary
${spec.summary}

## Problem Statement
${spec.problemStatement}

## Target Users
${spec.targetUsers.map((u) => `- ${u}`).join('\n')}

## Value Proposition
${spec.valueProposition}

## Key Features
${spec.keyFeatures.map((f) => `- ${f}`).join('\n')}

## User Stories
${spec.userStories.map((s) => `- ${s}`).join('\n')}

## Constraints & Notes
${spec.constraintsAndNotes.map((c) => `- ${c}`).join('\n')}
    `.trim();
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.title.replace(/\s+/g, '_').toLowerCase()}_spec.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden p-4 md:p-6 gap-6">
      {/* Left: Spec Preview */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-solarpunk rounded-3xl p-8 md:p-12 min-h-full">
          {/* Header Section */}
          <div className="mb-10">
             <label className="block text-xs font-bold text-synk-primary uppercase tracking-widest mb-2">Project Title</label>
            <input
              type="text"
              value={spec.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-4xl md:text-5xl font-extrabold text-synk-forest w-full bg-transparent focus:outline-none placeholder-synk-graphite/20"
              placeholder="Project Name"
            />
            <div className="mt-6">
                 <label className="block text-xs font-bold text-synk-primary uppercase tracking-widest mb-2">Executive Summary</label>
                <textarea
                  value={spec.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="w-full text-lg md:text-xl text-synk-graphite/80 bg-transparent focus:outline-none resize-none leading-relaxed"
                />
            </div>
          </div>

          <hr className="border-none h-px bg-synk-fog mb-10" />

          {/* Body Content */}
          <div className="space-y-12">
            <Section title="Problem Statement" content={spec.problemStatement} />
            
            <ListSection title="Target Users" items={spec.targetUsers} />
            
            <Section title="Value Proposition" content={spec.valueProposition} />
            
            <ListSection title="Key Features" items={spec.keyFeatures} />
            
            <ListSection title="User Stories" items={spec.userStories} />
            
            <ListSection title="Constraints & Notes" items={spec.constraintsAndNotes} />
          </div>
          
          <div className="h-12"></div>
        </div>
      </div>

      {/* Right: Controls - Floating Card */}
      <div className="w-full md:w-80 shrink-0 flex flex-col justify-end md:justify-start">
         <div className="bg-white rounded-3xl shadow-solarpunk p-6 md:p-8 sticky top-6">
            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-synk-forest text-xl">Spec Ready!</h3>
              <p className="text-sm text-synk-graphite/60 leading-relaxed">
                You can edit the title and summary directly on the preview.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center space-x-2 bg-synk-forest text-white px-4 py-4 rounded-xl hover:bg-synk-forest/90 transition-all font-bold shadow-lg shadow-synk-forest/20"
              >
                <svg className="w-5 h-5 text-synk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download .md</span>
              </button>
              
              <button
                onClick={onRestart}
                className="w-full px-4 py-4 rounded-xl bg-synk-fog text-synk-graphite font-bold hover:bg-gray-100 transition-colors"
              >
                Start New Session
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-synk-fog">
               <p className="text-xs text-synk-graphite/40 text-center">
                  Designed for Synk.build
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

// Helper Components
const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div>
    <h3 className="text-sm font-bold text-synk-forest uppercase tracking-widest mb-3">{title}</h3>
    <p className="text-synk-graphite leading-relaxed whitespace-pre-wrap">{content}</p>
  </div>
);

const ListSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div>
    <h3 className="text-sm font-bold text-synk-forest uppercase tracking-widest mb-3">{title}</h3>
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start text-synk-graphite leading-relaxed">
          <span className="mr-3 text-synk-primary font-bold text-lg leading-none mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);