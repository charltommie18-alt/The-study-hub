import React, { useState } from 'react';
import { Subject } from '../../types';
import { X, Plus, Sparkles, GraduationCap } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: Subject) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorGradient, setColorGradient] = useState('from-indigo-500 to-blue-600');

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Sage Green', value: 'from-[#5A6D5B] to-[#4A5D4B]' },
    { label: 'Warm Terracotta', value: 'from-[#B87D4B] to-[#9C6538]' },
    { label: 'Slate Taupe', value: 'from-[#7A746B] to-[#5C5750]' },
    { label: 'Deep Moss', value: 'from-[#2D362E] to-[#1E241F]' },
    { label: 'Soft Olive', value: 'from-[#8A9A86] to-[#6C7C68]' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      icon: 'BookOpen',
      color: colorGradient,
      description: description.trim() || 'Custom academic course workspace',
      progress: 0,
      notesCount: 0,
      flashcardsCount: 0,
      quizScore: 0,
    };

    onAddSubject(newSubject);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#D9D1C7] rounded-[24px] p-6 max-w-md w-full space-y-5 shadow-lg relative">
        
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
          <div className="flex items-center gap-2 text-[#2D362E] font-serif font-bold text-base">
            <GraduationCap className="w-5 h-5 text-[#5A6D5B]" />
            <span>Create New Subject</span>
          </div>
          <button onClick={onClose} className="text-[#7A746B] hover:text-[#2D362E] p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry, Macroeconomics, AP Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3.5 py-2 text-sm text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
              Description / Topic Focus
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of modules or exam targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl p-3 text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3C3C3B] mb-1">
              Theme Accent Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setColorGradient(c.value)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.value} border-2 transition-all cursor-pointer ${
                    colorGradient === c.value ? 'border-[#2D362E] scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A746B] hover:text-[#2D362E] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
            >
              Add Subject
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
