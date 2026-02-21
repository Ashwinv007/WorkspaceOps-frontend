"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { fetchWorkspaces, createWorkspace } from "@/lib/api/workspaces"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus, Building2, LogOut } from "lucide-react"
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

  const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
    OWNER: "default",
    ADMIN: "secondary",
    MEMBER: "outline",
    VIEWER: "outline",
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background px-8 py-4 flex items-center justify-between">
        <p className="text-xl font-bold">WorkspaceOps</p>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Workspaces</h1>
            <p className="text-muted-foreground mt-1">
              Select a workspace to continue, or create a new one
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : !workspaces?.length ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">You don&apos;t have any workspaces yet</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              Create your first workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Card key={ws.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{ws.name}</CardTitle>
                    <Badge variant={roleVariant[ws.userRole] ?? "outline"}>{ws.userRole}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(ws.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/${ws.id}/dashboard`)}
                  >
                    Open →
                  </Button>
                </CardFooter>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
