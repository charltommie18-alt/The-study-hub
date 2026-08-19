import React from 'react';
import { Subject } from '../types';
import { BookOpen, Layers, HelpCircle, Plus } from 'lucide-react';

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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        
        {/* Subject Pills */}
        <div className="flex items-center gap-2.5 min-w-max">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mr-1">
            Workspace:
          </span>
          {subjects.map((s, idx) => {
            const isSelected = s.id === selectedSubjectId;
            const colorGradients = [
              'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
              'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
              'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
              'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
              'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
              'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
            ];
            const activeColor = colorGradients[idx % colorGradients.length];

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-400/30 scale-[1.02]'
                    : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-xs'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${s.color || 'from-indigo-500 to-teal-600'} shadow-xs`} />
                <span className="font-bold">{s.name}</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-black border ${activeColor}`}>
                  {s.progress}%
                </span>
              </button>
            );
          })}

          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-semibold transition-all cursor-pointer"
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
            <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{current.notesCount} Notes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>{current.flashcardsCount} Flashcards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{current.quizScore}% Quiz Avg</span>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
