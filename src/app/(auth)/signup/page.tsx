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
import { signup } from "@/lib/api/auth"

const schema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
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
      const res = await signup(values.email, values.password, values.name)
      localStorage.setItem("workspaceops_token", res.data.token)
      localStorage.setItem("workspaceops_userId", res.data.userId)
      router.push(`/${res.data.workspaceId}/dashboard`)
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 409) {
        setApiError("An account with this email already exists")
      } else if (status === 400) {
        setApiError("Please check your details and try again.")
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
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start tracking your workspace operations</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
            </div>
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
              <p className="text-sm text-muted-foreground">Minimum 6 characters</p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            form="signup-form"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-foreground">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
