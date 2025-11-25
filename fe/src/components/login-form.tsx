"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useRouter();
  const { login } = useAuth();
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await login(values);
      // Router.push handled in AuthContext based on onboarding status
    } catch (err: any) {
      setError(err.message || "Login failed");
      form.setError("root", { message: err.message || "Login failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card className="gap-2 border-none bg-transparent">
        <CardDescription className="mb-5">
        <h1 className="text-6xl lg:text-7xl pl-4 font-semibold leading-snug text-[#E9F5FF]">
            Selamat datang kembali!
        </h1>
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email" className="text-sm md:text-base text-white">Email</FormLabel>
                    <FormControl className="py-7">
                      <Input id="email" type="email" placeholder="Email / Nomor Telepon" className="text-sm md:text-base text-white" {...field} />
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
                    <div className="flex items-center">
                      <FormLabel htmlFor="password" className="text-sm md:text-base text-white">Password</FormLabel>
                      <a
                        href="#"
                        className="ml-auto text-xs underline-offset-4 hover:underline text-white"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
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
                    "Login"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-gray-300">
            Belum punya akun?{" "}
            <button
              onClick={() => navigate.push("/register")}
              className="text-[#FF00BF] hover:underline font-semibold"
            >
              Daftar di sini
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

