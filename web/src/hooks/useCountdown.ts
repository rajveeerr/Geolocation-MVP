// src/hooks/useCountdown.ts
import { useEffect, useState } from 'react';

export const useCountdown = (targetDate: string) => {
  // Validate the target date
  const countDownDate = new Date(targetDate).getTime();
  
  // If invalid date, return zeros
  if (isNaN(countDownDate)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const [countDown, setCountDown] = useState(
    Math.max(0, countDownDate - new Date().getTime())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountDown = Math.max(0, countDownDate - new Date().getTime());
      setCountDown(newCountDown);
      
      // Clear interval if countdown reaches zero
      if (newCountDown <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  // Ensure countDown is not negative
  const safeCountDown = Math.max(0, countDown);
  
  const days = Math.floor(safeCountDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (safeCountDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((safeCountDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((safeCountDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};
