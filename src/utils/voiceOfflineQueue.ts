// Utility for managing offline voice-to-text transcripts queue and auto-sync

export interface QueuedVoiceTranscript {
  id: string;
  transcript: string;
  subjectName?: string;
  timestamp: string;
  createdAt: number;
}

const LOCAL_STORAGE_KEY = 'studyhub_voice_offline_queue';

// Retrieve all queued voice transcripts
export function getVoiceOfflineQueue(): QueuedVoiceTranscript[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load voice offline queue:', e);
    return [];
  }
}

// Add a new voice transcript to local queue when offline
export function enqueueVoiceTranscript(transcript: string, subjectName?: string): QueuedVoiceTranscript {
  const queue = getVoiceOfflineQueue();
  const newItem: QueuedVoiceTranscript = {
    id: `voice_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    transcript: transcript.trim(),
    subjectName: subjectName || 'General Studies',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
  };

  const updatedQueue = [...queue, newItem];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (e) {
    console.warn('Failed to save voice transcript to queue:', e);
  }

  // Dispatch custom event so reactive components update instantly
  window.dispatchEvent(new CustomEvent('studyhub_voice_queue_updated'));

  return newItem;
}

// Remove single item from queue
export function removeQueuedVoiceTranscript(id: string): void {
  const queue = getVoiceOfflineQueue();
  const updated = queue.filter((item) => item.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update voice queue:', e);
  }
  window.dispatchEvent(new CustomEvent('studyhub_voice_queue_updated'));
}

// Clear entire queue
export function clearVoiceOfflineQueue(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear voice queue:', e);
  }
  window.dispatchEvent(new CustomEvent('studyhub_voice_queue_updated'));
}

// Setup browser online auto-sync listener
export function setupVoiceAutoSync(onSync: (queuedItems: QueuedVoiceTranscript[]) => void): () => void {
  const handleOnline = () => {
    const queue = getVoiceOfflineQueue();
    if (queue.length > 0) {
      onSync(queue);
    }
  };

  window.addEventListener('online', handleOnline);

  // Check immediately on setup if online and queue has items
  if (navigator.onLine) {
    const queue = getVoiceOfflineQueue();
    if (queue.length > 0) {
      setTimeout(() => onSync(queue), 500);
    }
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
