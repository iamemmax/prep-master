'use client';

import { Spinner } from '@/components/ui/Spinner';
import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 via-white to-blue-50/30" />

      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ecb22e] rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ecb22e] rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Multi-layer spinner */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-linear-to-r from-[#ecb22e]/20 via-[#ecb22e]/20 to-[#ecb22e]/20 blur-xl animate-pulse-slow" />
          </div>

          {/* Outer rotating ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ecb22e] border-r-[#ecb22e] animate-spin-fast" />
            
            {/* Middle rotating ring - opposite direction */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#ecb22e] border-l-[#ecb22e] animate-spin-reverse" />
            
            {/* Inner spinner component */}
            <div className="relative scale-75">
              <Spinner />
            </div>
          </div>
        </div>

        {/* Animated progress dots */}
        <div className="flex gap-2.5">
          <div className="w-2.5 h-2.5 bg-[#ecb22e] rounded-full animate-scale-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-[#ecb22e] rounded-full animate-scale-pulse" style={{ animationDelay: '100ms' }} />
          <div className="w-2.5 h-2.5 bg-[#ecb22e] rounded-full animate-scale-pulse" style={{ animationDelay: '200ms' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-fast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-spin-fast {
          animation: spin-fast 0.6s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 0.8s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 1.2s ease-in-out infinite;
        }

        .animate-scale-pulse {
          animation: scale-pulse 0.8s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: -2s;
        }

        .delay-100 {
          animation-delay: 0.05s;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;