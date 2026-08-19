import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  FastForward, 
  Sparkles, 
  Download, 
  Share2, 
  Globe, 
  Clock, 
  BookOpen, 
  MessageCircle,
  FileText,
  ListOrdered,
  GraduationCap,
  Zap,
  User
} from 'lucide-react';
import { Subject, GradeLevel, PodcastEpisode } from '../../types';
import { INITIAL_PODCASTS } from '../../data/podcastData';
import { 
  speakTextInLanguage, 
  stopSpeech, 
  pauseSpeech, 
  resumeSpeech, 
  togglePauseSpeech, 
  getSpeechState, 
  subscribeSpeechState, 
  SpeechPlaybackState,
  applyVoicePreset,
  setVoiceGender,
  downloadSpeechAudio,
  loadVoiceSettings
} from '../../utils/multilingualSpeech';

interface AudioPodcastTabProps {
  subjects: Subject[];
  selectedSubjectId: string;
  currentGrade: GradeLevel;
  onOpenWhatsApp?: () => void;
}

export const AudioPodcastTab: React.FC<AudioPodcastTabProps> = ({
  subjects,
  selectedSubjectId,
  currentGrade,
  onOpenWhatsApp,
}) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(INITIAL_PODCASTS);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(INITIAL_PODCASTS[0].id);
  const [speechState, setSpeechState] = useState<SpeechPlaybackState>(getSpeechState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [preferredLang, setPreferredLang] = useState<'af-ZA' | 'en-ZA'>('af-ZA');
  const [isDownloading, setIsDownloading] = useState(false);

  const currentEpisode = episodes.find((e) => e.id === activeEpisodeId) || episodes[0];

  useEffect(() => {
    const unsub = subscribeSpeechState((st) => setSpeechState(st));
    return () => unsub();
  }, []);

  const handlePlayEpisode = (ep: PodcastEpisode) => {
    setActiveEpisodeId(ep.id);
    const textToSpeak = preferredLang === 'af-ZA' && ep.afrikaansTranscript ? ep.afrikaansTranscript : ep.transcript;
    speakTextInLanguage(textToSpeak, preferredLang);
  };

  const handleDownloadEpisode = async (ep: PodcastEpisode) => {
    setIsDownloading(true);
    const text = preferredLang === 'af-ZA' && ep.afrikaansTranscript ? ep.afrikaansTranscript : ep.transcript;
    try {
      await downloadSpeechAudio(text, preferredLang, `podcast_${ep.topic.replace(/\s+/g, '_').toLowerCase()}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!customTopic.trim()) return;
    setIsGenerating(true);

    try {
      const activeSub = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
      const res = await fetch('/api/gemini/podcast-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic,
          subject: activeSub.name,
          grade: currentGrade,
          language: preferredLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.podcast) {
          setEpisodes((prev) => [data.podcast, ...prev]);
          setActiveEpisodeId(data.podcast.id);
          handlePlayEpisode(data.podcast);
          setCustomTopic('');
          return;
        }
      }
    } catch (e) {
      console.warn('Podcast generation error, generating local high-yield audio episode:', e);
    }

    // Fallback high-yield episode creation
    const newEp: PodcastEpisode = {
      id: `pod-${Date.now()}`,
      title: `${customTopic} — 3-Minute Masterclass`,
      subjectId: selectedSubjectId,
      subjectName: subjects.find((s) => s.id === selectedSubjectId)?.name || 'Study Topic',
      topic: customTopic,
      durationSeconds: 180,
      language: preferredLang,
      transcript: preferredLang === 'af-ZA'
        ? `Welkom by die 3-minuut eksamen-oorsig van ${customTopic}! In hierdie les fokus ons op die kernbegrippe wat gereeld in toetse gevra word. Maak seker jy ken die definisies, die sleutelformules en hoe om stap-vir-stap te antwoord om volpunte te behaal.`
        : `Welcome to the 3-minute exam breakdown on ${customTopic}! In this quick audio recap, we cover the core concepts, common exam traps, and essential formulas you need to master this topic for top marks.`,
      afrikaansTranscript: `Welkom by die 3-minuut eksamen-oorsig van ${customTopic}! In hierdie les fokus ons op die kernbegrippe wat gereeld in toetse gevra word. Maak seker jy ken die definisies, die sleutelformules en hoe om stap-vir-stap te antwoord om volpunte te behaal.`,
      keyTakeaways: [
        `Core high-yield concepts in ${customTopic}`,
        'Step-by-step problem-solving strategy',
        'Common examiner traps to avoid in finals',
      ],
      createdAt: '2026-08-14',
    };

    setEpisodes((prev) => [newEp, ...prev]);
    setActiveEpisodeId(newEp.id);
    handlePlayEpisode(newEp);
    setCustomTopic('');
    setIsGenerating(false);
  };

  const isCurrentEpSpeaking = speechState.isPlaying && !speechState.isPaused;
  const isCurrentEpPaused = speechState.isPaused;

  return (
    <div className="space-y-6 animate-fade-in text-[#2D362E] dark:text-[#F4F1EA]">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              3-Minute Audio Study Podcasts
            </span>
            <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full">
              🇿🇦 Authentic Afrikaans Voice
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Klank-opsommings & Audio Recaps
          </h1>
          <p className="text-sm text-white/80 mt-1 max-w-2xl">
            Bite-sized, high-yield audio study summaries you can listen to while commuting, walking, or doing quick revision before exams.
          </p>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs border border-white/10 shrink-0">
          <button
            onClick={() => setPreferredLang('af-ZA')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              preferredLang === 'af-ZA' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            🇿🇦 Afrikaans Klank
          </button>
          <button
            onClick={() => setPreferredLang('en-ZA')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              preferredLang === 'en-ZA' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            🇬🇧 English Audio
          </button>
        </div>
      </div>

      {/* Main Grid: Active Player & Episode Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active Audio Player Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-sm space-y-6">
            
            {/* Episode Meta */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase">
                    {currentEpisode.subjectName}
                  </span>
                  <span className="text-xs text-[#7A746B] dark:text-[#A6C4A7] flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-amber-500" />
                    3 Min Recap
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D362E] dark:text-white">
                  {currentEpisode.title}
                </h2>
                <p className="text-xs text-[#7A746B] dark:text-[#B5AEA3]">
                  Topic: {currentEpisode.topic}
                </p>
              </div>

              <div className="p-3 bg-[#EBE7DF] dark:bg-[#253026] text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Audio Wave Visualizer & Controls */}
            <div className="p-5 bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl space-y-4">
              
              {/* Playback status */}
              <div className="flex items-center justify-between text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCurrentEpSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`}></span>
                  {isCurrentEpSpeaking ? 'Playing Neural Audio...' : isCurrentEpPaused ? 'Audio Paused' : 'Ready to Play'}
                </span>
                <span>Speed: {speechState.playbackRate}x</span>
              </div>

              {/* Large Central Controls Bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                
                {/* Main Play / Pause Button */}
                <button
                  onClick={() => {
                    if (isCurrentEpSpeaking) {
                      pauseSpeech();
                    } else if (isCurrentEpPaused) {
                      resumeSpeech();
                    } else {
                      handlePlayEpisode(currentEpisode);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                    isCurrentEpSpeaking
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isCurrentEpSpeaking ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pouseer Oudio</span>
                    </>
                  ) : isCurrentEpPaused ? (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Gaan Voort</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Luister na Oudio-les</span>
                    </>
                  )}
                </button>

                {/* Stop Button */}
                <button
                  onClick={stopSpeech}
                  className="p-3 bg-[#EBE7DF] dark:bg-[#253026] hover:bg-red-500/20 text-[#5A6D5B] dark:text-[#A2B5A3] hover:text-red-600 rounded-2xl transition-colors cursor-pointer"
                  title="Stop Oudio"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>

                {/* Download Audio MP3 Button */}
                <button
                  onClick={() => handleDownloadEpisode(currentEpisode)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-3 bg-[#EBE7DF] dark:bg-[#253026] hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl font-bold text-xs transition-colors cursor-pointer border border-[#D9D1C7] dark:border-[#2D3B2F]"
                  title="Laai Oudio-les af as MP3 / WAV"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-emerald-600' : ''}`} />
                  <span>{isDownloading ? 'Laai af...' : 'Laai Oudio Af (MP3)'}</span>
                </button>
              </div>

              {/* 1-Tap Voice Speed & Gender Presets Bar */}
              <div className="pt-2 border-t border-[#D9D1C7]/60 dark:border-[#2D3B2F] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#7A746B] dark:text-[#A6C4A7]">Stemprofiel:</span>
                  <button
                    onClick={() => {
                      setVoiceGender('male');
                      handlePlayEpisode(currentEpisode);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      loadVoiceSettings().voiceGender === 'male'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-[#1A231C] text-[#2D362E] dark:text-white border-[#D9D1C7] dark:border-[#2D3B2F]'
                    }`}
                  >
                    👨 Manlik (Jan / Dawid ★ Verstek)
                  </button>
                  <button
                    onClick={() => {
                      setVoiceGender('female');
                      handlePlayEpisode(currentEpisode);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      loadVoiceSettings().voiceGender === 'female'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-[#1A231C] text-[#2D362E] dark:text-white border-[#D9D1C7] dark:border-[#2D3B2F]'
                    }`}
                  >
                    👩 Vroulik (Sanet)
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#7A746B] dark:text-[#A6C4A7]">Tempo:</span>
                  <button
                    onClick={() => applyVoicePreset('slow_tutor')}
                    className="px-2 py-1 bg-white dark:bg-[#1A231C] hover:bg-[#EBE7DF] dark:hover:bg-[#253026] text-[#2D362E] dark:text-[#E2EFE3] text-[11px] font-bold rounded-lg border border-[#D9D1C7] dark:border-[#2D3B2F] transition-colors cursor-pointer flex items-center gap-1"
                    title="Stadige tempo (0.85x)"
                  >
                    <GraduationCap className="w-3 h-3 text-amber-500" />
                    <span>0.85x</span>
                  </button>
                  <button
                    onClick={() => applyVoicePreset('male_default')}
                    className="px-2 py-1 bg-white dark:bg-[#1A231C] hover:bg-[#EBE7DF] dark:hover:bg-[#253026] text-[#2D362E] dark:text-[#E2EFE3] text-[11px] font-bold rounded-lg border border-[#D9D1C7] dark:border-[#2D3B2F] transition-colors cursor-pointer"
                    title="Normale tempo (1.0x)"
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => applyVoicePreset('quick_review')}
                    className="px-2 py-1 bg-white dark:bg-[#1A231C] hover:bg-[#EBE7DF] dark:hover:bg-[#253026] text-[#2D362E] dark:text-[#E2EFE3] text-[11px] font-bold rounded-lg border border-[#D9D1C7] dark:border-[#2D3B2F] transition-colors cursor-pointer flex items-center gap-1"
                    title="Vinnige tempo (1.25x)"
                  >
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span>1.25x</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Key Takeaways Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-600" />
                Key Exam Takeaways in this Episode
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentEpisode.keyTakeaways.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-xl text-xs font-medium text-[#2D362E] dark:text-[#E2EFE3] flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Audio Script & Transcript
              </h3>
              <div className="p-4 bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl text-xs text-[#2D362E] dark:text-[#E2EFE3] leading-relaxed max-h-48 overflow-y-auto italic">
                "{preferredLang === 'af-ZA' && currentEpisode.afrikaansTranscript ? currentEpisode.afrikaansTranscript : currentEpisode.transcript}"
              </div>
            </div>

          </div>
        </div>

        {/* Right: Generator & Episode Playlist */}
        <div className="space-y-6">
          
          {/* AI Generator Box */}
          <div className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              Generate 3-Min Podcast on Any Topic
            </h3>
            <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
              Enter any syllabus topic to generate a custom high-yield audio lesson.
            </p>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Mitosis vs Meiosis, Ohm's Law..."
              className="w-full bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
            />
            <button
              onClick={handleGeneratePodcast}
              disabled={isGenerating || !customTopic.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Podcast...' : 'Generate Episode'}</span>
            </button>
          </div>

          {/* Episode Playlist */}
          <div className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#2D362E] dark:text-white">
              Episode Playlist ({episodes.length})
            </h3>

            <div className="space-y-2">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handlePlayEpisode(ep)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    activeEpisodeId === ep.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                      : 'bg-[#F9F7F2] dark:bg-[#121813] border-[#D9D1C7] dark:border-[#2D3B2F] hover:bg-[#EBE7DF]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {ep.subjectName}
                    </span>
                    <h4 className="text-xs font-bold text-[#2D362E] dark:text-white truncate">
                      {ep.title}
                    </h4>
                  </div>
                  <div className={`p-2 rounded-xl shrink-0 ${activeEpisodeId === ep.id ? 'bg-emerald-600 text-white' : 'bg-[#EBE7DF] dark:bg-[#253026] text-[#5A6D5B]'}`}>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
