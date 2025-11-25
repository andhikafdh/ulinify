"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
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
        <motion.div className="flex flex-col gap-5" variants={itemVariants}>
          <div>
            <Image src="/logo.svg" alt="Ulinify Logo" width={139} height={141} />
          </div>

          <div>
            <h1 className="text-6xl lg:text-7xl font-semibold leading-snug text-[#00FFA1]">
              Small Steps,
              <br />
              Big Impacts
            </h1>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center justify-center"
          variants={itemVariants}
        >
          <Image src="/characterleft.svg" alt="Welcome Illustration" width={200} height={200} />
          <Image src="/characterright.svg" alt="Welcome Illustration" width={200} height={200} />
        </motion.div>

        <motion.div className="flex flex-col gap-3" variants={itemVariants}>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 43, 166, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ stiffness: 400, damping: 17 }} // ❌ removed type
            className="w-full rounded-full py-3 text-base font-semibold bg-[#FF00BF] text-white shadow-md cursor-pointer"
            onClick={() => router.push('/register')}
          >
            Mulai
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: "#dce6ff" }}
            whileTap={{ scale: 0.98 }}
            transition={{ stiffness: 400, damping: 17 }} // ❌ removed type
            className="w-full rounded-full py-3 text-base font-semibold bg-[#E9F5FF] text-[#364152] shadow-sm cursor-pointer"
            onClick={() => router.push('/login')}
          >
            Sudah Punya Akun
          </motion.button>

        </motion.div>
      </motion.div>
    </main>
  );
}
