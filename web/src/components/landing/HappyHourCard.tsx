import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export const HappyHourCard = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-accent-urgent flex h-full flex-col justify-between p-6 text-white">
      <div>
        <Flame className="h-6 w-6" />
        <h3 className="mt-2 text-lg font-semibold">Happy Hour Ending!</h3>
      </div>
      <div className="text-4xl font-bold tracking-tighter">
        {`${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
      </div>
    </div>
  );
};
