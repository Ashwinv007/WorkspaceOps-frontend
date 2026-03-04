"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { updateWorkItem } from "@/lib/api/work-items"
import { WorkItem, Entity } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  entityId: z.string().min(1, "Entity is required"),
})
type FormValues = z.infer<typeof schema>

interface EditWorkItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  workItem: WorkItem
  entities: Entity[]
}

export function EditWorkItemDialog({
  open,
  onOpenChange,
  workspaceId,
  workItem,
  entities,
}: EditWorkItemDialogProps) {
  const queryClient = useQueryClient()
  const [dueDate, setDueDate] = useState<Date | undefined>(
    workItem.dueDate ? new Date(workItem.dueDate) : undefined
  )
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: workItem.title,
      description: workItem.description ?? "",
      priority: workItem.priority,
      entityId: workItem.entityId,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: workItem.title,
        description: workItem.description ?? "",
        priority: workItem.priority,
        entityId: workItem.entityId,
      })
      setDueDate(workItem.dueDate ? new Date(workItem.dueDate) : undefined)
    }
  }, [open, workItem, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateWorkItem(workspaceId, workItem.id, {
        ...values,
        dueDate: dueDate?.toISOString() ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, workItem.id] })
      toast.success("Work item updated")
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to update work item"),
  })

  const entityValue = watch("entityId")
  const priorityValue = watch("priority")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Work Item</DialogTitle>
        </DialogHeader>

        <form id="edit-wi-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-wi-title">Title <span className="text-destructive">*</span></Label>
            <Input id="edit-wi-title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-wi-desc">Description</Label>
            <Textarea id="edit-wi-desc" {...register("description")} rows={3} />
          </div>

          <div className="space-y-1">
            <Label>Entity <span className="text-destructive">*</span></Label>
            <Select value={entityValue} onValueChange={(v) => setValue("entityId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.entityId && <p className="text-sm text-destructive">{errors.entityId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={priorityValue ?? "__none__"}
                onValueChange={(v) => setValue("priority", v === "__none__" ? undefined : v as FormValues["priority"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Due Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM d") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => { setDueDate(d); setCalendarOpen(false) }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="edit-wi-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
