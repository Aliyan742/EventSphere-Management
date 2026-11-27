import { useEffect, useState } from "react";

const calculateTimeLeft = (targetDate) => {
  const target = targetDate
    ? new Date(targetDate).getTime()
    : Date.now() + 24 * 86400000;
  const diff = Math.max(0, target - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / 1000 / 60) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
};

const CountdownTimer = ({ targetDate }) => {
  const [countdown, setCountdown] = useState(() =>
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2.5 max-w-sm tabular-nums">
      {[
        { label: "Days", val: countdown.days },
        { label: "Hours", val: countdown.hours },
        { label: "Mins", val: countdown.mins },
        { label: "Secs", val: countdown.secs },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-center"
        >
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {String(item.val).padStart(2, "0")}
          </div>
          <div className="text-[11px] uppercase font-medium text-slate-300 tracking-wider mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
