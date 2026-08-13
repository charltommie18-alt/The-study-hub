import React, { useState } from 'react';
import { Subject, StudyPlan } from '../../types';
import { generateOfflineStudyPlan } from '../../utils/offlineAI';
import { Sparkles, X, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface GeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  selectedSubjectId: string;
}

export const GeneratePlanModal: React.FC<GeneratePlanModalProps> = ({
  isOpen,
  onClose,
  subjects,
  selectedSubjectId,
}) => {
  const [days, setDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [topicsInput, setTopicsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode - building roadmap with Offline AI Engine');
      }

      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'General Exam',
          days,
          hoursPerDay,
          topics: topicsInput ? topicsInput.split(',').map((t) => t.trim()) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');

      setGeneratedPlan(data);
    } catch (err: any) {
      console.warn('API error or offline mode, fallback to Offline AI Engine:', err);
      const offlinePlan = generateOfflineStudyPlan(
        currentSubject?.name || 'General Exam',
        days,
        hoursPerDay,
        topicsInput
      );
      setGeneratedPlan(offlinePlan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#D9D1C7] rounded-[24px] p-6 max-w-xl w-full space-y-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
          <div className="flex items-center gap-2 text-[#2D362E] font-serif font-bold text-base">
            <Sparkles className="w-5 h-5 text-[#5A6D5B]" />
            <span>AI Exam & Study Roadmap Generator</span>
          </div>
          <button onClick={onClose} className="text-[#7A746B] hover:text-[#2D362E] p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedPlan ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
                Active Subject Target
              </label>
              <input
                type="text"
                disabled
                value={currentSubject?.name || 'General Studies'}
                className="w-full bg-[#F2EFE9] border border-[#D9D1C7] rounded-xl px-3.5 py-2 text-sm text-[#7A746B] font-semibold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
                  Days Until Exam
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3 py-2 text-sm text-[#2D362E]"
                >
                  <option value={3}>3 Days (Crash Course)</option>
                  <option value={7}>7 Days (Standard Week)</option>
                  <option value={14}>14 Days (Two Weeks)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
                  Daily Study Hours
                </label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3 py-2 text-sm text-[#2D362E]"
                >
                  <option value={1}>1 Hour / Day</option>
                  <option value={2}>2 Hours / Day</option>
                  <option value={4}>4 Hours / Day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
                Topics / Chapters to Cover (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Mitochondria, Glycolysis, Krebs Cycle, ATP Synthase"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3.5 py-2 text-sm text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
              />
            </div>

            {error && (
              <p className="text-xs text-[#B87D4B] p-2.5 bg-[#F9F7F2] rounded-xl border border-[#D9D1C7]">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#7A746B] hover:text-[#2D362E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Building Roadmap with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E2EFE3]" />
                    <span>Generate AI Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#2D362E]">{generatedPlan.planTitle}</h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {generatedPlan.dailySchedule.map((day) => (
                <div key={day.dayNumber} className="p-3 bg-[#F9F7F2] border border-[#EBE7DF] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5A6D5B]">
                    <span>Day {day.dayNumber}: {day.topicName}</span>
                    <span className="text-[10px] text-[#7A746B]">{day.estimatedMinutes} Mins</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#3C3C3B]">
                    {day.goals.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EBE7DF]">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-[#7A746B] hover:text-[#2D362E] mr-2 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
