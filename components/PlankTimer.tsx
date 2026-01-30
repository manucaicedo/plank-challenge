'use client';

import { useState, useEffect, useRef } from 'react';

interface PlankTimerProps {
  onComplete: (duration: number) => void;
}

export default function PlankTimer({ onComplete }: PlankTimerProps) {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Format time as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Play beep sound
  function playBeep(frequency: number = 800, duration: number = 200) {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  // Handle countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      playBeep(600, 150);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      playBeep(1000, 300); // Higher pitch for "GO!"
      setCountdown(null);
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [countdown]);

  // Timer logic using requestAnimationFrame for accuracy
  useEffect(() => {
    if (isRunning) {
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  function handleStop() {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    onComplete(elapsedTime);
  }

  function handleReset() {
    setCountdown(3);
    setIsRunning(false);
    setElapsedTime(0);
    startTimeRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Countdown Display */}
      {countdown !== null ? (
        <div className="text-center">
          <div className="text-8xl font-bold text-blue-600 mb-4 animate-pulse">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
          <p className="text-xl text-gray-600">Get ready...</p>
        </div>
      ) : (
        <>
          {/* Timer Display */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-900 tabular-nums">
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-4">
            {isRunning ? (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-lg font-semibold text-xl transition"
              >
                ⏹ Stop & Save
              </button>
            ) : elapsedTime > 0 ? (
              <button
                onClick={handleReset}
                className="bg-gray-400 hover:bg-gray-500 text-white px-12 py-4 rounded-lg font-semibold text-xl transition"
              >
                🔄 Try Again
              </button>
            ) : null}
          </div>

          {/* Minimum time indicator */}
          {isRunning && elapsedTime < 10 && (
            <p className="text-sm text-gray-500 mt-4">
              Minimum 10 seconds required
            </p>
          )}
        </>
      )}
    </div>
  );
}
