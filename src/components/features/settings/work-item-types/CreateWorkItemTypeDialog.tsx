"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createWorkItemType } from "@/lib/api/work-item-types"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  entityType: z.enum(["SELF", "CUSTOMER", "EMPLOYEE", "VENDOR"]).optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateWorkItemTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
}

export function CreateWorkItemTypeDialog({ open, onOpenChange, workspaceId }: CreateWorkItemTypeDialogProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createWorkItemType(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-item-types", workspaceId] })
      toast.success("Work item type created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create work item type"),
  })

  const entityTypeValue = watch("entityType")

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Work Item Type</DialogTitle>
        </DialogHeader>
        <form id="create-wit-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="wit-name">Name</Label>
            <Input id="wit-name" placeholder="Compliance Review" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="wit-desc">Description (optional)</Label>
            <Textarea id="wit-desc" {...register("description")} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Entity Type Restriction (optional)</Label>
            <Select
              value={entityTypeValue ?? "__none__"}
              onValueChange={(v) => setValue("entityType", v === "__none__" ? undefined : v as FormValues["entityType"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Any entity type</SelectItem>
                <SelectItem value="SELF">Self</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="VENDOR">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
          <Button type="submit" form="create-wit-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
