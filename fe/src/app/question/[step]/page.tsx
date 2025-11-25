"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageTransition from "@/components/page-transition";
import OnboardingStep from "@/components/onboarding-step";
import { userAPI, OnboardingAnswers } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: keyof OnboardingAnswers;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
}

export default function OnboardingStepPage() {
  const router = useRouter();
  const { step } = useParams();
  const { refreshUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await userAPI.getOnboardingQuestions();
      if (response.success) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const index = parseInt(step as string) - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001E31]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF00BF]"></div>
      </div>
    );
  }

  if (index < 0 || index >= questions.length) {
    router.replace("/question/1");
    return null;
  }

  const current = questions[index];
  const isLast = index === questions.length - 1;

  const handleSelect = async (value: string) => {
    const newAnswers = { ...answers };
    
    if (current.type === 'multiple') {
      // For multiple choice, collect as array
      if (!newAnswers[current.id]) {
        newAnswers[current.id] = [] as any;
      }
      (newAnswers[current.id] as string[]).push(value);
    } else {
      // For single choice
      newAnswers[current.id] = value as any;
    }
    
    setAnswers(newAnswers);

    if (isLast) {
      // Submit all answers
      try {
        await userAPI.submitOnboarding(newAnswers as OnboardingAnswers);
        await refreshUser();
        router.push("/question/complete");
      } catch (error) {
        console.error('Failed to submit onboarding:', error);
        alert('Failed to submit answers. Please try again.');
      }
    } else {
      router.push(`/question/${index + 2}`);
    }
  };

  return (
    <PageTransition>
      <OnboardingStep
        progress={(index + 1) * (100 / questions.length)}
        question={current.question}
        options={current.options.map((opt) => 
          typeof opt === 'string' ? { label: opt, value: opt } : opt
        )}
        onSelect={handleSelect}
      />
    </PageTransition>
  );
}
