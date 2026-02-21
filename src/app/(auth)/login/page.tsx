"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { login } from "@/lib/api/auth"

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      const res = await login(values.email, values.password)
      localStorage.setItem("workspaceops_token", res.data.token)
      localStorage.setItem("workspaceops_userId", res.data.userId)
      router.push("/workspaces")
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 401) {
        setApiError("Invalid email or password")
      } else {
        setApiError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <p className="text-2xl font-bold">WorkspaceOps</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline hover:text-foreground">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
