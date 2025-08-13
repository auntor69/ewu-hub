import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(datetime: string): string {
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka',
  });
}

export function getCurrentDhakaTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour12: false,
  });
}

export function generateAttendanceCode(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export function isTimeWithinWindow(targetTime: string, windowMinutes: number = 15): boolean {
  const now = new Date();
  const target = new Date(`${now.toDateString()} ${targetTime}:00`);
  const diffMinutes = Math.abs((now.getTime() - target.getTime()) / (1000 * 60));
  return diffMinutes <= windowMinutes;
}