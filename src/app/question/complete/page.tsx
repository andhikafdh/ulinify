"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CompletePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/recommendations"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#001E31]">
      <div className="flex flex-col items-center gap-8">

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image src="/cooking.svg" alt="Cooking" width={250} height={250} />
          </motion.div>
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 border-4 border-[#FF00BF] border-t-transparent rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-[#E9F5FF] mb-2">
            Sebentar ya 🧑‍🍳 
          </h2>
          <p className="text-[#7D9CB1] text-xl">
            rekomendasi mu lagi dimasak...
          </p>
        </motion.div>

      </div>
    </main>
  );
}