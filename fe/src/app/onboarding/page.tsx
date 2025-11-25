"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Onboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Redirect if already completed onboarding
    if (!loading && user?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#001E31]">
      <motion.div 
        className="w-full max-w-3xl flex flex-col justify-between min-h-[90vh] px-6 py-10 gap-7"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        <motion.div variants={itemVariants}>
          <Image 
            src="/onboardingcharacter.svg" 
            alt="Onboarding Illustration" 
            width={300} 
            height={300} 
            className="mx-auto"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-5xl font-semibold leading-snug text-center text-[#E9F5FF] mb-5">
            Biar AI Kita Nggak <span className="text-[#FF00BF]">Sotoy</span>
          </h1>

          <p className="text-center text-lg text-[#E9F5FF] mb-10">
            Kita butuh tau dikit soal keseharian lo, dari soal ojol sampe kopi susu. 
            Supaya challenge-nya nanti relate sama hidup lo
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mx-auto">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Button
              onClick={() => router.push("/question/1")}
              className="w-15 h-15 bg-[#7dffb5] rounded-3xl shadow-lg flex items-center justify-center hover:bg-[#70f0a7] p-0 cursor-pointer"
            >
              <ArrowRight 
                className="text-[#001E31] shrink-0" 
                size={52} 
                strokeWidth={2.5}
              />
            </Button>
          </motion.div>
        </motion.div>

      </motion.div>
    </main>
  );
}
