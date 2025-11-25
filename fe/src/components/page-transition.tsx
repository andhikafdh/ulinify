"use client";

import { motion } from "framer-motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}     
      animate={{ x: 0, opacity: 1 }}   
      exit={{ x: -80, opacity: 0 }}  
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22
      }}
      className="w-full overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
