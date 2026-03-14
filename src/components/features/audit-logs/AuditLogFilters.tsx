"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { WorkspaceMember } from "@/lib/types/api"

const ACTION_GROUPS = [
  {
    label: "Auth",
    actions: ["USER_LOGIN", "USER_SIGNUP", "USER_LOGOUT"],
  },
  {
    label: "Workspace",
    actions: [
      "WORKSPACE_CREATED",
      "WORKSPACE_MEMBER_INVITED",
      "WORKSPACE_MEMBER_ROLE_UPDATED",
      "WORKSPACE_MEMBER_REMOVED",
    ],
  },
  {
    label: "Entity",
    actions: ["ENTITY_CREATED", "ENTITY_UPDATED", "ENTITY_DELETED"],
  },
  {
    label: "Document",
    actions: ["DOCUMENT_UPLOADED", "DOCUMENT_UPDATED", "DOCUMENT_DELETED"],
  },
  {
    label: "Document Type",
    actions: [
      "DOCUMENT_TYPE_CREATED",
      "DOCUMENT_TYPE_FIELD_ADDED",
      "DOCUMENT_TYPE_DELETED",
    ],
  },
  {
    label: "Work Item",
    actions: [
      "WORK_ITEM_CREATED",
      "WORK_ITEM_UPDATED",
      "WORK_ITEM_DELETED",
      "WORK_ITEM_STATUS_CHANGED",
      "WORK_ITEM_DOCUMENT_LINKED",
      "WORK_ITEM_DOCUMENT_UNLINKED",
    ],
  },
  {
    label: "Work Item Type",
    actions: ["WORK_ITEM_TYPE_CREATED", "WORK_ITEM_TYPE_DELETED"],
  },
]

const TARGET_TYPES = [
  "Workspace",
  "Entity",
  "Document",
  "DocumentType",
  "WorkItem",
  "WorkItemType",
  "Member",
]

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}

function formatTargetTypeLabel(value: string): string {
  return value.replace(/([A-Z])/g, " $1").trim()
}

export interface AuditLogFilterValues {
  userId?: string
  action?: string
  targetType?: string
  fromDate?: string
  toDate?: string
}

interface AuditLogFiltersProps {
  members: WorkspaceMember[]
  onApply: (filters: AuditLogFilterValues) => void
}

export function AuditLogFilters({ members, onApply }: AuditLogFiltersProps) {
  const [userId, setUserId] = useState("")
  const [action, setAction] = useState("")
  const [targetType, setTargetType] = useState("")
  const [from, setFrom] = useState<Date | undefined>()
  const [to, setTo] = useState<Date | undefined>()
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  function handleApply() {
    onApply({
      ...(userId && { userId }),
      ...(action && { action }),
      ...(targetType && { targetType }),
      ...(from && { fromDate: from.toISOString() }),
      ...(to && { toDate: to.toISOString() }),
    })
  }

  function handleClear() {
    setUserId("")
    setAction("")
    setTargetType("")
    setFrom(undefined)
    setTo(undefined)
    onApply({})
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>User</Label>
          <Select value={userId || "__all__"} onValueChange={(v) => setUserId(v === "__all__" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All users</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.userName ?? m.userEmail ?? m.userId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Action</Label>
          <Select value={action || "__all__"} onValueChange={(v) => setAction(v === "__all__" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="__all__">All actions</SelectItem>
              {ACTION_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.actions.map((a) => (
                    <SelectItem key={a} value={a}>{formatLabel(a)}</SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Target Type</Label>
          <Select value={targetType || "__all__"} onValueChange={(v) => setTargetType(v === "__all__" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All types</SelectItem>
              {TARGET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{formatTargetTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>From</Label>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !from && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "MMM d") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(d) => { setFrom(d); setFromOpen(false) }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !to && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={to}
                  onSelect={(d) => { setTo(d); setToOpen(false) }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleApply}>Apply Filters</Button>
        <button
          onClick={handleClear}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  )
}
