"use client";

import { motion } from "framer-motion";

type Option = {
  label: string;
  value: string;
};

interface StepProps {
  question: string;
  options: Option[];
  onSelect?: (value: string) => void;
  progress?: number; // 0–100
}

export default function OnboardingStep({ question, options, onSelect, progress = 30 }: StepProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#001E31] px-6 relative">
      
      <div className="absolute top-0 left-0 w-full h-4 overflow-hidden">
        <div
          className="h-full bg-[#FF00BF] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-10 py-12">

        <h1 className="text-center text-2xl font-semibold text-[#E9F5FF] leading-snug">
          {question}
        </h1>

        <div className="flex flex-col gap-4 w-full">
          {options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect?.(opt.value)}
              className="w-full py-5 rounded-xl border border-[#7D9CB1] text-[#E9F5FF] hover:text-[#001E31] text-base font-medium cursor-pointer hover:bg-[#00FFA1] transition-colors"
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

      </div>
    </main>
  );
}
