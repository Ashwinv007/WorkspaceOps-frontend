"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { fetchWorkspaces, createWorkspace } from "@/lib/api/workspaces"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Loader2, Plus, Building2, LogOut, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const schema = z.object({ name: z.string().min(1, "Workspace name is required") })
type FormValues = z.infer<typeof schema>

export default function WorkspacesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: ({ tenantId, name }: { tenantId: string; name: string }) =>
      createWorkspace(tenantId, name),
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      setDialogOpen(false)
      reset()
      toast.success("Workspace created")
      router.push(`/${newWs.id}/dashboard`)
    },
    onError: () => toast.error("Failed to create workspace"),
  })

  function onSubmit(values: FormValues) {
    const tenantId = workspaces?.[0]?.tenantId
    if (!tenantId) return
    createMutation.mutate({ tenantId, name: values.name })
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">WorkspaceOps</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Choose a workspace</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Select below to continue
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !workspaces?.length ? (
          <div className="text-center py-20">
            <div className="bg-muted/60 rounded-xl p-3 inline-flex mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">No workspaces yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first workspace to get started.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              Create workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all duration-150"
                onClick={() => router.push(`/${ws.id}/dashboard`)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight truncate">{ws.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Created {format(new Date(ws.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge type="role" value={ws.userRole} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new workspace</DialogTitle>
          </DialogHeader>
          <form id="create-ws-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input id="ws-name" placeholder="Acme HQ" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-ws-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 className="animate-spin mr-2 h-4 w-4" />Creating...</>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
