import { useState, useEffect } from 'react';

interface UseOrderTimerProps {
  startTime: string;
  endTime?: string;
}

/**
 * Custom hook to track order completion time
 * @param startTime - Order start time in ISO string format
 * @param endTime - Optional end time in ISO string format
 * @returns Object with elapsed time, formatted time, and isCompleted status
 */
export const useOrderTimer = ({ startTime, endTime }: UseOrderTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    
    // Calculate initial elapsed time
    const initialElapsed = Math.max(0, Math.floor((end - start) / 1000));
    setElapsedTime(initialElapsed);

    // If no end time, update elapsed time every second
    if (!endTime) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.max(0, Math.floor((currentTime - start) / 1000));
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  // Format elapsed time to MM:SS or HH:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    }
  };

  // Calculate total time taken for completed orders in minutes
  const calculateTotalTimeInMinutes = (): number => {
    return Math.ceil(elapsedTime / 60);
  };

  return {
    elapsedTime,
    formattedTime: formatElapsedTime(elapsedTime),
    isCompleted: !!endTime,
    totalTimeInMinutes: calculateTotalTimeInMinutes(),
  };
};