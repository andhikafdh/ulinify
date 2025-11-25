"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useRouter();
  const { register: registerUser } = useAuth();
  
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: "",
      email: "", 
      password: "",
      confirmPassword: ""
    },
    mode: "onTouched",
  })

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password
      });
      // Router.push handled in AuthContext (goes to onboarding)
    } catch (err: any) {
      setError(err.message || "Registrasi gagal");
      form.setError("root", { message: err.message || "Registrasi gagal" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card className="gap-2 border-none bg-transparent">
        <CardDescription className="mb-5">
        <h1 className="text-6xl lg:text-7xl pl-4 font-semibold leading-snug text-[#E9F5FF]">
            Daftar Akun Baru
        </h1>
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name" className="text-sm md:text-base text-white">Nama Lengkap</FormLabel>
                    <FormControl className="py-7">
                      <Input id="name" type="text" placeholder="Masukkan nama lengkap" className="text-sm md:text-base text-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm md:text-base" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email" className="text-sm md:text-base text-white">Email</FormLabel>
                    <FormControl className="py-7">
                      <Input id="email" type="email" placeholder="Masukkan email" className="text-sm md:text-base text-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm md:text-base" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password" className="text-sm md:text-base text-white">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          disabled={isSubmitting}
                          className="h-14 text-base pr-12 text-white"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-4 my-2 flex items-center cursor-pointer border-l border-[#CBD5E1]"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword" className="text-sm md:text-base text-white">Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Masukkan ulang password"
                          disabled={isSubmitting}
                          className="h-14 text-base pr-12 text-white"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-4 my-2 flex items-center cursor-pointer border-l border-[#CBD5E1]"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 43, 166, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  type="submit" 
                  className="w-full rounded-lg py-6 text-base font-semibold bg-[#FF00BF] text-white shadow-md cursor-pointer hover:bg-[#FF00BF]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-gray-300">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate.push("/login")}
              className="text-[#FF00BF] hover:underline font-semibold"
            >
              Masuk di sini
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
