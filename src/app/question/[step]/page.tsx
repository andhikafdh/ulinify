"use client";

import { useRouter, useParams } from "next/navigation";
import PageTransition from "@/components/page-transition";
import OnboardingStep from "@/components/onboarding-step";
import { onboardingQuestions } from "@/components/data/onBoardingQuestion";

export default function OnboardingStepPage() {
  const router = useRouter();
  const { step } = useParams();

  const index = parseInt(step as string) - 1;

  if (index < 0 || index >= onboardingQuestions.length) {
    router.replace("/question/1");
    return null;
  }

  const current = onboardingQuestions[index];
  const isLast = index === onboardingQuestions.length - 1;

  return (
    <PageTransition>
      <OnboardingStep
        progress={(index + 1) * (100 / onboardingQuestions.length)}
        question={current.question}
        options={current.options.map((opt) => ({ label: opt, value: opt }))}

        onSelect={() => {
          if (isLast) {
            router.push("/question/complete");
          } else {
            router.push(`/question/${index + 2}`);
          }
        }}
      />
    </PageTransition>
  );
}
