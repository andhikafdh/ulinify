import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001E31]">
      <div className="w-full max-w-3xl flex flex-col justify-between min-h-[90vh] px-6 py-10">
        <RegisterForm />
      </div>
    </div>
  )
}
