import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Flame, 
  Award, 
  Plus, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Trophy, 
  Clock, 
  UserPlus
} from 'lucide-react';
import { StudyRoom, StudyRoomMessage, GradeLevel } from '../../types';

interface StudyRoomTabProps {
  currentGrade: GradeLevel;
  currentSubjectName: string;
}

export const StudyRoomTab: React.FC<StudyRoomTabProps> = ({
  currentGrade,
  currentSubjectName,
}) => {
  const [activeRoomCode, setActiveRoomCode] = useState<string>('MATH-9021');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Mock Active Study Rooms
  const [rooms, setRooms] = useState<StudyRoom[]>([
    {
      id: 'room-1',
      code: 'MATH-9021',
      name: 'Calculus & Physics Peer Sprint',
      subject: 'Mathematics',
      gradeLevel: currentGrade,
      membersCount: 6,
      activeTopic: 'Derivatives, Vectors & Newton Motion',
      hostName: 'David K.',
    },
    {
      id: 'room-2',
      code: 'BIO-1102',
      name: 'Biology & Medicine Prep Group',
      subject: 'Biology',
      gradeLevel: currentGrade,
      membersCount: 9,
      activeTopic: 'Cellular Respiration & DNA Transcription',
      hostName: 'Amara N.',
    },
  ]);

  // Messages State
  const [messages, setMessages] = useState<StudyRoomMessage[]>([
    {
      id: 'msg-1',
      user: 'Amara N.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      text: 'Hey everyone! Working through Unit 3 derivatives. Anyone up for a quick 10-question flashcard quiz challenge?',
      timestamp: '10:14 AM',
      badge: 'Level 5 Scholar',
    },
    {
      id: 'msg-2',
      user: 'David K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      text: 'I uploaded my handwritten physics formula sheet to the shared notes bin!',
      timestamp: '10:18 AM',
      sharedType: 'note',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg: StudyRoomMessage = {
      id: `msg-${Date.now()}`,
      user: 'You (Student)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badge: 'Active Peer',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRoom = () => {
    const code = `${currentSubjectName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRoom: StudyRoom = {
      id: `room-${Date.now()}`,
      code,
      name: `${currentSubjectName} Focus Room`,
      subject: currentSubjectName,
      gradeLevel: currentGrade,
      membersCount: 1,
      activeTopic: 'General Peer Review',
      hostName: 'You',
    };
    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoomCode(code);
  };

  const activeRoom = rooms.find((r) => r.code === activeRoomCode) || rooms[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3D4C3E] to-[#1E261F] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>Peer Collaboration & Study Rooms</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Study Rooms & Classmate Challenges</h1>
          <p className="text-xs text-[#C8E0C9] mt-1">
            Study live with peers, share notes, challenge classmates to flashcard duels, and boost retention together.
          </p>
        </div>

        {/* Room Code & Copy */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-[#A6C4A7] font-bold uppercase">Active Room Code</div>
            <div className="text-base font-mono font-black text-amber-300">{activeRoomCode}</div>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Room Selector & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Rooms Directory & Join Input */}
        <div className="space-y-4">
          
          {/* Join / Create Box */}
          <div className="p-4 bg-white border border-[#D9D1C7] rounded-2xl space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#5A6D5B]" />
              <span>Join or Create Study Room</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter Room Code (e.g. MATH-9021)"
                className="flex-1 px-3 py-2 bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#5A6D5B]"
              />
              <button
                onClick={() => {
                  if (joinCodeInput.trim()) {
                    setActiveRoomCode(joinCodeInput.trim());
                    setJoinCodeInput('');
                  }
                }}
                className="px-3 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Join
              </button>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Room ({currentSubjectName})</span>
            </button>
          </div>

          {/* Active Rooms List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#575047] uppercase tracking-wider px-1">
              Active Peer Groups
            </h4>

            {rooms.map((r) => {
              const isActive = r.code === activeRoomCode;
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRoomCode(r.code)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                      : 'bg-white border-[#D9D1C7] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#5A6D5B] bg-[#E2EFE3] px-2 py-0.5 rounded-md">
                        {r.code}
                      </span>
                      <h4 className="text-xs font-bold text-[#2D362E] mt-1.5">{r.name}</h4>
                      <p className="text-[11px] text-[#736B5E] mt-0.5">{r.activeTopic}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      <Users className="w-3 h-3" />
                      <span>{r.membersCount} online</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Active Room Chat & Challenge Feed */}
        <div className="lg:col-span-2 bg-white border border-[#D9D1C7] rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[500px]">
          
          {/* Active Room Title Bar */}
          <div className="pb-4 border-b border-[#E8E2D8] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2D362E]">{activeRoom.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                  {activeRoom.code}
                </span>
              </div>
              <p className="text-xs text-[#736B5E] mt-0.5">Topic: {activeRoom.activeTopic}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">{activeRoom.membersCount} Classmates Active</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 py-4 space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <img
                  src={m.avatar}
                  alt={m.user}
                  className="w-8 h-8 rounded-full object-cover border border-[#D9D1C7]"
                />
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2D362E]">{m.user}</span>
                    {m.badge && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-bold">
                        {m.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8C8275]">{m.timestamp}</span>
                  </div>

                  <div className="p-3 bg-[#F9F7F2] border border-[#E8E2D8] rounded-2xl text-xs text-[#2D362E] leading-relaxed">
                    {m.text}
                  </div>

                  {m.sharedType === 'note' && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Shared Physics Formula Sheet attached to room workspace!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="pt-3 border-t border-[#E8E2D8] flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type study question or classmate challenge..."
              className="flex-1 px-4 py-2.5 bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
