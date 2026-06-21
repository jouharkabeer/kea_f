import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_DURATION_SECONDS = 60;

export function useOtpResendTimer(durationSeconds = DEFAULT_DURATION_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    setSecondsLeft(durationSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [durationSeconds]);

  useEffect(() => () => clearTimer(), []);

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    startTimer,
  };
}
