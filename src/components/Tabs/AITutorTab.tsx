import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage, Subject, Flashcard } from '../../types';
import { generateOfflineTutorResponse } from '../../utils/offlineAI';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Layers, 
  Copy, 
  Check, 
  Lightbulb, 
  MessageSquare, 
  BrainCircuit, 
  ShieldCheck,
  MessageCircle,
  Mic,
  Volume2,
  VolumeX,
  Gauge
} from 'lucide-react';

interface AITutorTabProps {
  messages: TutorMessage[];
  subjects: Subject[];
  selectedSubjectId: string;
  onSendMessage: (msg: TutorMessage) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onOpenWhatsApp?: () => void;
}

export const AITutorTab: React.FC<AITutorTabProps> = ({
  messages,
  subjects,
  selectedSubjectId,
  onSendMessage,
  onAddFlashcard,
  onOpenWhatsApp,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('Socratic Mentor');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Web Speech API Read-Aloud state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);

  // Clean up active speech synthesis and recognition when unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleStartVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition exception:', e);
      setIsListening(false);
    }
  };

  // Web Speech API Text-to-Speech handler
  const handleToggleListen = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // If already speaking this message, cancel/stop it
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Sanitize markdown tokens for clean speech pronunciation
    const cleanText = text
      .replace(/[*#_~`>]/g, ' ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const personas = [
    { name: 'Socratic Mentor', desc: 'Asks guiding questions to help you discover solutions.' },
    { name: 'ELI5 (Explain Like I\'m 5)', desc: 'Uses simple analogies and zero complex jargon.' },
    { name: 'Exam Coach', desc: 'Focuses on high-yield exam patterns and scoring traps.' },
    { name: 'Concept Dissector', desc: 'Breaks complex topics into step-by-step logical bullet points.' },
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendMessage(userMsg);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode - answering with Offline AI Engine');
      }

      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory: messages.map((m) => ({ role: m.role, text: m.text })),
          subject: currentSubject?.name || 'General Studies',
          persona: selectedPersona,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get tutor reply');

      const botMsg: TutorMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I am happy to explain this concept further!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: data.suggestedFollowups || [],
        persona: selectedPersona,
      };

      onSendMessage(botMsg);
    } catch (err: any) {
      console.warn('API error or offline mode, fallback to Offline AI Engine:', err);
      const offlineReply = generateOfflineTutorResponse(
        textToSend.trim(),
        currentSubject?.name || 'General Studies'
      );

      const botMsg: TutorMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: offlineReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: offlineReply.suggestedFollowups,
        persona: `${selectedPersona} (Offline Engine)`,
      };

      onSendMessage(botMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFlashcardFromMessage = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const question = lines[0]?.slice(0, 100) || `Key Insight for ${currentSubject?.name}`;
    const answer = lines.slice(1, 4).join(' ') || text.slice(0, 200);

    const newCard: Flashcard = {
      id: `fc-tutor-${Date.now()}`,
      subjectId: selectedSubjectId,
      question: `[Tutor Note] ${question.replace(/^#+|\*+/g, '')}`,
      answer: answer.replace(/\*+/g, ''),
      category: currentSubject?.name || 'General',
      difficulty: 'medium',
      hint: 'Saved directly from AI Tutor chat',
      status: 'new',
      timesReviewed: 0,
    };

    onAddFlashcard(newCard);
    alert('Key insight saved as a new Flashcard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] border border-[#D9D1C7] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] border border-[#C5DCC6] rounded-full text-[#5A6D5B] text-xs font-semibold mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-[#5A6D5B]" />
              <span>Personal 24/7 AI Academic Mentor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Interactive AI Study Tutor
            </h1>
            <p className="text-[#7A746B] text-sm mt-1 max-w-2xl">
              Ask questions, request step-by-step problem explanations, choose teaching personas, and turn tutor insights into study flashcards.
            </p>
          </div>

          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              className="px-4 py-2 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#5A6D5B] font-semibold text-xs rounded-full border border-[#C5DCC6] flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              title="Share AI Tutor Q&A on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-[#5A6D5B]/20" />
              <span>WhatsApp Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Persona Switcher Bar */}
      <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-sm space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A] block">
          Select AI Tutor Persona:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {personas.map((p) => {
            const isSelected = selectedPersona === p.name;
            return (
              <button
                key={p.name}
                onClick={() => setSelectedPersona(p.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E2EFE3] border-[#5A6D5B] text-[#2D362E] shadow-sm'
                    : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#7A746B] hover:text-[#2D362E]'
                }`}
              >
                <h3 className="font-bold text-xs text-[#5A6D5B]">{p.name}</h3>
                <p className="text-[11px] text-[#7A746B] mt-0.5 line-clamp-1">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-4 sm:p-6 shadow-sm flex flex-col h-[520px]">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                    isUser
                      ? 'bg-[#5A6D5B]'
                      : 'bg-[#B87D4B]'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#5A6D5B] border-[#4A5D4B] text-white shadow-sm'
                      : 'bg-[#F9F7F2] border-[#EBE7DF] text-[#3C3C3B] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-1.5 text-[10px] opacity-80">
                    <span className="font-bold">
                      {isUser ? 'You' : `StudyBot (${msg.persona || selectedPersona})`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                  {/* AI Assistant Toolbar & Suggested Followups */}
                  {!isUser && (
                    <div className="pt-2 border-t border-[#EBE7DF] dark:border-[#2C3B2E] space-y-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[#7A746B] dark:text-[#A6C4A7]">
                        
                        {/* Prominent Listen Button (Web Speech API) */}
                        <button
                          onClick={() => handleToggleListen(msg.id, msg.text)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            speakingMsgId === msg.id
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-md'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          }`}
                          title={speakingMsgId === msg.id ? 'Click to stop listening' : 'Listen to AI tutor response spoken aloud'}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-white" />
                              <span>Stop Listening</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Speech Speed Selector */}
                        <div className="flex items-center gap-1 bg-[#EBE7DF] dark:bg-[#1A231C] px-2 py-1 rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31]">
                          <Gauge className="w-3 h-3 text-[#7A746B] dark:text-[#A6C4A7]" />
                          <select
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="bg-transparent text-[10px] font-bold text-[#3C3C3B] dark:text-[#F4F1EA] focus:outline-none cursor-pointer"
                            title="Adjust Speech Rate Speed"
                          >
                            <option value={0.8} className="bg-white dark:bg-[#1A231C]">0.8x</option>
                            <option value={1.0} className="bg-white dark:bg-[#1A231C]">1.0x</option>
                            <option value={1.25} className="bg-white dark:bg-[#1A231C]">1.25x</option>
                            <option value={1.5} className="bg-white dark:bg-[#1A231C]">1.5x</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleCreateFlashcardFromMessage(msg.text)}
                          className="text-[#5A6D5B] dark:text-emerald-300 hover:underline flex items-center gap-1 font-bold cursor-pointer ml-auto sm:ml-0"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#5A6D5B] dark:text-emerald-300" />
                          <span>Save Flashcard</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-[#8C857A] dark:text-[#B5AEA3] hover:text-[#2D362E] dark:hover:text-white flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Follow-up chips */}
                      {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedFollowups.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="px-2.5 py-1 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#5A6D5B] border border-[#D9D1C7] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              💬 {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-9 h-9 rounded-xl bg-[#B87D4B] flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 bg-[#F9F7F2] border border-[#EBE7DF] rounded-2xl text-xs text-[#7A746B] flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#5A6D5B]/30 border-t-[#5A6D5B] rounded-full animate-spin" />
                <span>StudyBot is reasoning and generating response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Starter Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-[#EBE7DF] mt-2">
          <span className="text-[10px] font-bold uppercase text-[#8C857A] shrink-0">Quick Prompts:</span>
          {[
            `Explain ${currentSubject?.name || 'this topic'} with a real-world analogy`,
            'Give me 3 high-yield exam tips for my test',
            'Break down the core formula step-by-step',
            'Test me with a quick Socratic question',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-[#F9F7F2] border border-[#D9D1C7] hover:border-[#5A6D5B] text-[#2D362E] rounded-full text-[11px] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              ✨ {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-2">
          <textarea
            rows={1}
            placeholder={isListening ? '🎤 Listening to your voice input... speak now' : `Ask StudyBot anything about ${currentSubject?.name || 'your studies'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className={`flex-1 bg-[#F9F7F2] border rounded-2xl px-4 py-3 text-xs text-[#2D362E] placeholder-[#8C857A] focus:outline-none transition-all resize-none leading-relaxed ${
              isListening ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold shadow-sm' : 'border-[#D9D1C7] focus:border-[#5A6D5B]'
            }`}
          />

          {/* Voice Microphone Dictation */}
          <button
            type="button"
            onClick={handleStartVoice}
            className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-[#F2EFE9] text-[#5A6D5B] border-[#D9D1C7] hover:bg-[#EBE7DF]'
            }`}
            title="Speak Question (Voice Dictation)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="px-5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
