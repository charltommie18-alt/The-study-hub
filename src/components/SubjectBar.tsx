import React from 'react';
import { Subject } from '../types';
import { BookOpen, Layers, HelpCircle, Plus, CheckCircle2 } from 'lucide-react';

interface SubjectBarProps {
  subjects: Subject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  onOpenAddSubject: () => void;
}

export const SubjectBar: React.FC<SubjectBarProps> = ({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  onOpenAddSubject,
}) => {
  return (
    <div className="bg-[#EBE7DF]/60 border-b border-[#D9D1C7] py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        
        {/* Subject Pills */}
        <div className="flex items-center gap-2.5 min-w-max">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A] mr-1">
            Workspace:
          </span>
          {subjects.map((s, idx) => {
            const isSelected = s.id === selectedSubjectId;
            const colorGradients = [
              'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200',
              'from-blue-500 to-indigo-600 text-indigo-700 bg-indigo-50 border-indigo-200',
              'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200',
              'from-purple-500 to-pink-600 text-purple-700 bg-purple-50 border-purple-200',
              'from-rose-500 to-pink-600 text-rose-700 bg-rose-50 border-rose-200',
              'from-cyan-500 to-blue-600 text-cyan-700 bg-cyan-50 border-cyan-200',
            ];
            const activeColor = colorGradients[idx % colorGradients.length];

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#1C231E] text-blue-900 dark:text-emerald-200 border-blue-500 dark:border-emerald-400 shadow-md ring-2 ring-blue-500/30 dark:ring-emerald-400/30 scale-[1.02]'
                    : 'bg-[#F2EFE9] dark:bg-[#181E19] text-[#7A746B] dark:text-[#A6C4A7] border-[#D9D1C7] dark:border-[#2F3E31] hover:bg-white dark:hover:bg-[#202922] hover:text-[#2D362E] dark:hover:text-white'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${s.color || 'from-blue-500 to-teal-600'} shadow-xs`} />
                <span className="font-bold">{s.name}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-extrabold border ${activeColor}`}>
                  {s.progress}%
                </span>
              </button>
            );
          })}

          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#D9D1C7] text-[#7A746B] hover:text-[#2D362E] hover:border-[#5A6D5B] text-xs font-medium transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>
        </div>

        {/* Selected Subject Quick Stats */}
        {(() => {
          const current = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
          if (!current) return null;
          return (
            <div className="hidden lg:flex items-center gap-4 text-xs text-[#7A746B] shrink-0 font-medium">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5A6D5B]" />
                <span>{current.notesCount} Notes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5A6D5B]" />
                <span>{current.flashcardsCount} Flashcards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#B87D4B]" />
                <span>{current.quizScore}% Quiz Avg</span>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
