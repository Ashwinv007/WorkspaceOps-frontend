"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateEntity } from "@/lib/api/entities"
import { Entity } from "@/lib/types/api"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  role: z.enum(["SELF", "CUSTOMER", "EMPLOYEE", "VENDOR"]),
})
type FormValues = z.infer<typeof schema>

interface EditEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  entity: Entity
}

export function EditEntityDialog({ open, onOpenChange, workspaceId, entity }: EditEntityDialogProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: entity.name, role: entity.role },
  })

  useEffect(() => {
    if (open) {
      reset({ name: entity.name, role: entity.role })
    }
  }, [open, entity, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateEntity(workspaceId, entity.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["entity", workspaceId, entity.id] })
      toast.success("Entity updated")
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to update entity"),
  })

  const roleValue = watch("role")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Entity</DialogTitle>
        </DialogHeader>
        <form id="edit-entity-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-entity-name">Name</Label>
            <Input id="edit-entity-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(v) => setValue("role", v as FormValues["role"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELF">Self</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="VENDOR">Vendor</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-entity-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
