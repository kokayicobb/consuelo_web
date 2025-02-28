import { useState, useEffect } from "react";

const Timer = () => {
  const [time, setTime] = useState(0.0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => Math.round((prevTime + 0.1) * 10) / 10);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-sm text-gray-600">
      {time.toFixed(1)}s
    </div>
  );
};

export default Timer;
