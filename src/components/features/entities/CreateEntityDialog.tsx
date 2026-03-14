"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createEntity, fetchEntities } from "@/lib/api/entities"
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

interface CreateEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  defaultRole?: FormValues["role"]
  defaultParentId?: string
}

export function CreateEntityDialog({ open, onOpenChange, workspaceId, defaultRole, defaultParentId }: CreateEntityDialogProps) {
  const queryClient = useQueryClient()
  const [parentId, setParentId] = useState(defaultParentId ?? "")

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", role: defaultRole },
  })

  const { data: allEntities } = useQuery({
    queryKey: ["entities", workspaceId, ""],
    queryFn: () => fetchEntities(workspaceId),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createEntity(workspaceId, { ...values, ...(parentId ? { parentId } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] })
      toast.success("Entity created")
      reset({ name: "", role: defaultRole })
      setParentId(defaultParentId ?? "")
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create entity"),
  })

  function onSubmit(values: FormValues) {
    mutation.mutate(values)
  }

  const roleValue = watch("role")
  const showParent = roleValue === "EMPLOYEE" && !defaultParentId
  const parentCandidates = (allEntities?.entities ?? []).filter((e) => e.role !== "EMPLOYEE")

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset({ name: "", role: defaultRole }); setParentId(defaultParentId ?? "") } onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Entity</DialogTitle>
        </DialogHeader>
        <form id="create-entity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="entity-name">Name</Label>
            <Input id="entity-name" placeholder="Acme Corp" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(v) => { setValue("role", v as FormValues["role"]); setParentId("") }} disabled={!!defaultRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
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
          {showParent && (
            <div className="space-y-1">
              <Label>Belongs To (optional)</Label>
              <Select value={parentId || "__none__"} onValueChange={(v) => setParentId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {parentCandidates.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset({ name: "", role: defaultRole }); setParentId(defaultParentId ?? ""); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button type="submit" form="create-entity-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Add Entity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
