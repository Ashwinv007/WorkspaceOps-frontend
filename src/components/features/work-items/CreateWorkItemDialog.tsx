"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import { createWorkItem } from "@/lib/api/work-items"
import { Entity, WorkItemType } from "@/lib/types/api"
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
  workItemTypeId: z.string().min(1, "Work item type is required"),
  entityId: z.string().min(1, "Entity is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateWorkItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  entities: Entity[]
  workItemTypes: WorkItemType[]
  defaultEntityId?: string
}

export function CreateWorkItemDialog({
  open,
  onOpenChange,
  workspaceId,
  entities,
  workItemTypes,
  defaultEntityId,
}: CreateWorkItemDialogProps) {
  const queryClient = useQueryClient()
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [entityOpen, setEntityOpen] = useState(false)
  const [entitySearch, setEntitySearch] = useState("")

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open && defaultEntityId) {
      setValue("entityId", defaultEntityId)
    }
  }, [open, defaultEntityId, setValue])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createWorkItem(workspaceId, {
        ...values,
        dueDate: dueDate?.toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
      toast.success("Work item created")
      reset()
      setDueDate(undefined)
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create work item"),
  })

  const typeValue = watch("workItemTypeId")
  const entityValue = watch("entityId")
  const priorityValue = watch("priority")

  const selectedWorkItemType = workItemTypes.find((t) => t.id === typeValue)
  const filteredEntities = entities.filter(
    (e) => !selectedWorkItemType?.entityType || e.role === selectedWorkItemType.entityType
  )

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setDueDate(undefined) } onOpenChange(v) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Work Item</DialogTitle>
        </DialogHeader>

        <form id="create-wi-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">New work items always start as Draft.</p>

          <div className="space-y-1">
            <Label>Work Item Type <span className="text-destructive">*</span></Label>
            <Select value={typeValue} onValueChange={(v) => { setValue("workItemTypeId", v); setValue("entityId", "") }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {workItemTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workItemTypeId && <p className="text-sm text-destructive">{errors.workItemTypeId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Entity <span className="text-destructive">*</span></Label>
            <Popover open={entityOpen} onOpenChange={setEntityOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {entityValue
                    ? (filteredEntities.find((e) => e.id === entityValue)?.name ?? "Select entity")
                    : "Select entity"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search entities..."
                    value={entitySearch}
                    onChange={(e) => setEntitySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredEntities.filter((e) => e.name.toLowerCase().includes(entitySearch.toLowerCase())).length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No entities found.</p>
                  ) : (
                    filteredEntities
                      .filter((e) => e.name.toLowerCase().includes(entitySearch.toLowerCase()))
                      .map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => { setValue("entityId", e.id); setEntityOpen(false); setEntitySearch("") }}
                          className={cn(
                            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            entityValue === e.id && "bg-accent"
                          )}
                        >
                          <Check className={cn("mr-2 h-4 w-4", entityValue === e.id ? "opacity-100" : "opacity-0")} />
                          {e.name}
                        </button>
                      ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {errors.entityId && <p className="text-sm text-destructive">{errors.entityId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="wi-title">Title <span className="text-destructive">*</span></Label>
            <Input id="wi-title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="wi-desc">Description (optional)</Label>
            <Textarea id="wi-desc" {...register("description")} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Priority (optional)</Label>
              <Select value={priorityValue ?? "__none__"} onValueChange={(v) => setValue("priority", v === "__none__" ? undefined : v as FormValues["priority"])}>
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
              <Label>Due Date (optional)</Label>
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
          <Button variant="ghost" onClick={() => { reset(); setDueDate(undefined); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button type="submit" form="create-wi-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
