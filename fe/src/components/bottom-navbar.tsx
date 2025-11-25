"use client";

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Camera, User } from 'lucide-react';

export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      icon: Home,
      path: '/dashboard',
      label: 'Home'
    },
    {
      icon: Camera,
      path: '/camera',
      label: 'Camera',
      isCenter: true
    },
    {
      icon: User,
      path: '/profile',
      label: 'Profile'
    }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="relative h-28">
        {/* Center Camera Button - Elevated */}
        <motion.button
          onClick={() => router.push('/camera')}
          className="absolute left-1/2 -translate-x-1/2 top-0 z-20 pointer-events-auto"
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            {/* Direct green circle without white border */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00FFA1] to-[#00CC81] flex items-center justify-center shadow-2xl">
              <Camera 
                className="text-[#003B5C]" 
                size={32} 
                strokeWidth={2.5}
              />
            </div>
          </div>
        </motion.button>

        {/* Bottom Bar with Transparent Cutout */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-auto">
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 400 80" 
            preserveAspectRatio="none"
            style={{ filter: 'drop-shadow(0 -2px 8px rgba(0, 0, 0, 0.3))' }}
          >
            <defs>
              {/* Mask: White shows navbar, Black makes transparent */}
              <mask id="navbar-mask">
                {/* White rectangle - shows the navbar */}
                <rect width="400" height="80" fill="white" />
                {/* Black semicircle (dome shape) - cuts out (makes transparent) */}
                <path d="M 145,0 A 55,55 0 0,0 255,0 Z" fill="black" />
              </mask>
            </defs>
            
            {/* Navbar shape with rounded top corners and mask applied */}
            <path 
              d="M 0,32 Q 0,0 32,0 L 368,0 Q 400,0 400,32 L 400,80 L 0,80 Z" 
              fill="#003B5C"
              mask="url(#navbar-mask)"
            />
          </svg>

          {/* Navigation Items */}
          <div className="relative flex items-center justify-between h-full px-8">
            {/* Home Button */}
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-1 z-10"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-3 rounded-2xl transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#00FFA1]/20'
                  : 'bg-transparent'
              }`}>
                <Home
                  className={`transition-colors ${
                    isActive('/dashboard')
                      ? 'text-[#00FFA1]'
                      : 'text-gray-300'
                  }`}
                  size={24}
                  strokeWidth={2}
                />
              </div>
            </motion.button>

            {/* Spacer for center button */}
            <div className="w-24" />

            {/* Profile Button */}
            <motion.button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center gap-1 z-10"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-3 rounded-2xl transition-colors ${
                isActive('/profile')
                  ? 'bg-[#00FFA1]/20'
                  : 'bg-transparent'
              }`}>
                <User
                  className={`transition-colors ${
                    isActive('/profile')
                      ? 'text-[#00FFA1]'
                      : 'text-gray-300'
                  }`}
                  size={24}
                  strokeWidth={2}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
