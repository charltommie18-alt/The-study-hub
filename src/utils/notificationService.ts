import { PushNotificationSettings } from '../types';

/**
 * Play a pleasant audio chime using Web Audio API
 */
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const now = ctx.currentTime;
    
    // Create dual oscillator chord (G5 and C6)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
};

/**
 * Request Browser Push Notification Permission
 */
export const requestPushPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop push notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if Browser Push Permission is granted
 */
export const isPushPermissionGranted = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
};

/**
 * Send Browser Native Push Notification
 */
export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): boolean => {
  // Play chime
  playNotificationChime();

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notificationOptions: any = {
      icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      tag: 'pomodoro-peak-hour-reminder',
      renotify: true,
      ...options,
    };
    const notification = new Notification(title, notificationOptions);

    notification.onclick = () => {
      window.focus();
      if (onClick) onClick();
      notification.close();
    };

    return true;
  } catch (e) {
    console.warn('Failed to send browser native notification:', e);
    return false;
  }
};

/**
 * Default initial notification settings
 */
export const DEFAULT_NOTIFICATION_SETTINGS: PushNotificationSettings = {
  enabled: true,
  permissionGranted: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
  peakHourReminderEnabled: true,
  peakStartHour: 15, // 3:00 PM (15:00)
  peakEndHour: 18,   // 6:00 PM (18:00)
  reminderOffsetMinutes: 0, // Remind exactly at peak start
  soundEnabled: true,
  customMessage: '⚡ Your peak focus window (3 PM - 6 PM) is here! Ready for a 25-minute Pomodoro sprint?',
};
