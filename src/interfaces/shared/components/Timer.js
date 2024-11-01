import React, { useState, useEffect } from 'react';

const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const started = new Date(startTime);
      setElapsed(Math.floor((now - started) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds) => {
    if (seconds < 300) return 'text-green-500'; // Under 5 minutes
    if (seconds < 600) return 'text-yellow-500'; // Under 10 minutes
    return 'text-red-500'; // Over 10 minutes
  };

  return (
    <div className={`text-2xl font-bold ${getTimerColor(elapsed)}`}>
      {formatTime(elapsed)}
    </div>
  );
};