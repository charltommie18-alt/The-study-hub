import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Timer, 
  Zap, 
  FileUp, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Star, 
  Target, 
  BarChart2, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { AchievementBadge, GamificationProfile } from '../../types';

interface AchievementsTabProps {
  achievements: AchievementBadge[];
  gamification: GamificationProfile;
  onClaimXp: (badgeId: string, xpAmount: number) => void;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  gamification,
  onClaimXp,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Focus', 'Mastery', 'Consistency', 'Uploads', 'AI Tutor'];

  const filteredBadges = achievements.filter((b) => 
    selectedCategory === 'All' ? true : b.category === selectedCategory
  );

  // Level Title Calculation
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return '🎓 Exam Titan & Master Scholar';
    if (lvl >= 7) return '🏛️ High Honor Academicist';
    if (lvl >= 5) return '⚡ Knowledge Architect';
    if (lvl >= 3) return '📖 Focused Practitioner';
    return '🌱 Scholar Apprentice';
  };

  // Next level threshold
  const currentXp = gamification.xp;
  const currentLevel = Math.floor(currentXp / 300) + 1;
  const xpInCurrentLevel = currentXp % 300;
  const xpForNextLevel = 300;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Hero Header & Level Progress Banner */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3D4C3E] to-[#1E261F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
        
        {/* Subtle Decorative Background Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Student Gamification Hub</span>
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold rounded-full">
                Level {currentLevel}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getLevelTitle(currentLevel)}
            </h1>
            <p className="text-xs sm:text-sm text-[#C8E0C9] max-w-xl">
              Earn XP by completing Pomodoro sessions, mastering flashcards, passing quizzes, and uploading study documents.
            </p>
          </div>

          {/* XP Meter Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#C8E0C9] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>XP Progress</span>
              </span>
              <span className="text-amber-300 font-mono">
                {currentXp} XP
              </span>
            </div>

            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#A6C4A7]">
              <span>Level {currentLevel}</span>
              <span>{xpForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{gamification.streakDays} Days</div>
              <div className="text-[10px] text-[#A6C4A7]">Active Streak</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{Math.floor(gamification.totalFocusMinutes / 60)}h {gamification.totalFocusMinutes % 60}m</div>
              <div className="text-[10px] text-[#A6C4A7]">Focus Time</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{gamification.masteredCardsCount} Cards</div>
              <div className="text-[10px] text-[#A6C4A7]">Mastered</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{totalUnlocked}/{achievements.length} Badges</div>
              <div className="text-[10px] text-[#A6C4A7]">Unlocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#5A6D5B] text-white shadow-xs'
                  : 'bg-white text-[#736B5E] border border-[#D9D1C7] hover:bg-[#F9F7F2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-[#736B5E]">
          Showing <span className="font-bold text-[#2D362E]">{filteredBadges.length}</span> Milestones
        </div>
      </div>

      {/* Badges & Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isComplete = badge.progress >= badge.maxProgress;
          const progressPct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-white via-[#FDFBF7] to-[#F3EFE6] border-emerald-300 shadow-sm'
                  : isComplete
                  ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/80 border-[#E8E2D8] text-gray-500 hover:border-[#C5BCB0]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      badge.isUnlocked
                        ? 'bg-emerald-600 text-white shadow-md'
                        : isComplete
                        ? 'bg-amber-500 text-white shadow-md animate-bounce'
                        : 'bg-[#EFEAE1] text-[#736B5E]'
                    }`}>
                      {badge.category === 'Focus' && <Timer className="w-6 h-6" />}
                      {badge.category === 'Mastery' && <Award className="w-6 h-6" />}
                      {badge.category === 'Consistency' && <Zap className="w-6 h-6" />}
                      {badge.category === 'Uploads' && <FileUp className="w-6 h-6" />}
                      {badge.category === 'AI Tutor' && <MessageSquare className="w-6 h-6" />}
                    </div>

                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        badge.isUnlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#EFEAE1] text-[#736B5E]'
                      }`}>
                        {badge.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#2D362E] mt-1">
                        {badge.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-100/80 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>+{badge.xpReward} XP</span>
                  </div>
                </div>

                <p className="text-xs text-[#575047] mt-3 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar & Action */}
              <div className="mt-4 pt-3 border-t border-[#E8E2D8] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#736B5E] text-[11px]">
                    {badge.isUnlocked ? 'Unlocked' : 'Progress'}
                  </span>
                  <span className="text-[#2D362E]">
                    {badge.progress} / {badge.maxProgress}
                  </span>
                </div>

                <div className="w-full bg-[#EFEAE1] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      badge.isUnlocked
                        ? 'bg-emerald-600'
                        : isComplete
                        ? 'bg-amber-500'
                        : 'bg-[#5A6D5B]'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Status or Claim Button */}
                <div className="pt-1">
                  {badge.isUnlocked ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed on {badge.unlockedAt || 'Recently'}</span>
                    </div>
                  ) : isComplete ? (
                    <button
                      onClick={() => onClaimXp(badge.id, badge.xpReward)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Claim +{badge.xpReward} XP</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-[#8C8275]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Keep studying to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
