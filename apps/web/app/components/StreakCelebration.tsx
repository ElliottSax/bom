'use client';

import { useEffect, useState } from 'react';
import { ShareButton } from './ShareButton';
import { createStreakShareData } from '../hooks/useShare';

interface StreakCelebrationProps {
  streak: number;
  onClose: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setShow(true), 100);
  }, []);

  const getMilestoneMessage = (streak: number) => {
    if (streak >= 365) return {
      title: '🎉 ONE YEAR STREAK! 🎉',
      message: "You've studied every day for an entire year! This is legendary!",
      color: 'from-yellow-500 to-orange-500',
    };
    if (streak >= 100) return {
      title: '🔥 100-DAY STREAK! 🔥',
      message: "Triple digits! Your dedication is incredible!",
      color: 'from-purple-500 to-pink-500',
    };
    if (streak >= 30) return {
      title: '🎊 30-DAY STREAK! 🎊',
      message: "One month of consistent study! You're building a powerful habit!",
      color: 'from-orange-500 to-red-500',
    };
    if (streak >= 7) return {
      title: '⭐ 7-DAY STREAK! ⭐',
      message: "One week strong! Keep the momentum going!",
      color: 'from-blue-500 to-cyan-500',
    };
    return {
      title: '🎯 Streak Milestone!',
      message: "Great progress! Keep it up!",
      color: 'from-green-500 to-teal-500',
    };
  };

  const milestone = getMilestoneMessage(streak);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4
      transition-opacity duration-300
      ${show ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* Confetti background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['🎉', '🎊', '⭐', '🔥', '💫'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className={`
        bg-[var(--color-bg-primary)] rounded-3xl max-w-md w-full shadow-2xl
        transform transition-all duration-500
        ${show ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}
      `}>
        {/* Gradient header */}
        <div className={`
          bg-gradient-to-r ${milestone.color}
          p-8 rounded-t-3xl text-center
        `}>
          <h2 className="text-3xl font-bold text-white mb-2 animate-bounce">
            {milestone.title}
          </h2>
          <p className="text-6xl font-black text-white drop-shadow-lg">
            {streak}
          </p>
          <p className="text-xl text-white font-semibold mt-2">
            Days in a Row!
          </p>
        </div>

        {/* Message */}
        <div className="p-8 text-center">
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">
            {milestone.message}
          </p>

          {/* Streak visualization */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: Math.min(streak, 30) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-full animate-fire"
                style={{
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
            {streak > 30 && (
              <div className="flex items-center justify-center text-orange-500 font-bold">
                +{streak - 30}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <ShareButton
              data={createStreakShareData(streak)}
              variant="primary"
              size="lg"
              showMenu={true}
              className="w-full justify-center"
            />
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[var(--color-bg-secondary)] rounded-xl font-semibold hover:bg-[var(--color-bg-tertiary)] transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes fire {
          0%, 100% {
            transform: scaleY(1);
            opacity: 1;
          }
          50% {
            transform: scaleY(1.2);
            opacity: 0.8;
          }
        }

        .animate-confetti {
          animation: confetti linear infinite;
        }

        .animate-fire {
          animation: fire 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
