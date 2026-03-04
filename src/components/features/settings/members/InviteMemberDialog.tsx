"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { inviteMember } from "@/lib/api/workspaces"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

const schema = z.object({
  invitedEmail: z.string().min(1, "Email is required").email("Invalid email"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
})
type FormValues = z.infer<typeof schema>

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
}

export function InviteMemberDialog({ open, onOpenChange, workspaceId }: InviteMemberDialogProps) {
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "MEMBER" },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => inviteMember(workspaceId, values.invitedEmail, values.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
      toast.success("Member invited")
      reset()
      setApiError(null)
      onOpenChange(false)
    },
    onError: (err: { response?: { status: number } }) => {
      const status = err?.response?.status
      if (status === 404) {
        setApiError("No account found with this email")
      } else if (status === 409) {
        setApiError("This person is already a member")
      } else {
        setApiError("Failed to invite member. Please try again.")
      }
    },
  })

  const roleValue = watch("role")

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setApiError(null) } onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <form id="invite-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" placeholder="colleague@example.com" {...register("invitedEmail")} />
            {errors.invitedEmail && <p className="text-sm text-destructive">{errors.invitedEmail.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(v) => setValue("role", v as FormValues["role"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); setApiError(null); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
