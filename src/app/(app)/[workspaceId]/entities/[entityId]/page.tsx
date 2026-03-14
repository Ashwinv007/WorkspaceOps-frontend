"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchEntityById, fetchEntityDocuments, fetchEntityWorkItems, deleteEntity, fetchEntities } from "@/lib/api/entities"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { fetchWorkItemTypes } from "@/lib/api/work-item-types"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { useDownloadDocument } from "@/lib/hooks/useDownloadDocument"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EditEntityDialog } from "@/components/features/entities/EditEntityDialog"
import { CreateEntityDialog } from "@/components/features/entities/CreateEntityDialog"
import { UploadDocumentDialog } from "@/components/features/documents/UploadDocumentDialog"
import { CreateWorkItemDialog } from "@/components/features/work-items/CreateWorkItemDialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ArrowLeft, Download, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function EntityDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; entityId: string }>
}) {
  const { workspaceId, entityId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAdmin } = useWorkspaceRole()
  const { downloadDocument } = useDownloadDocument()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createWorkItemOpen, setCreateWorkItemOpen] = useState(false)
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)

  const { data: entity, isLoading } = useQuery({
    queryKey: ["entity", workspaceId, entityId],
    queryFn: () => fetchEntityById(workspaceId, entityId),
  })

  const { data: documents } = useQuery({
    queryKey: ["entity-documents", workspaceId, entityId],
    queryFn: () => fetchEntityDocuments(workspaceId, entityId),
    enabled: !!entity,
  })

  const { data: workItemsData } = useQuery({
    queryKey: ["entity-work-items", workspaceId, entityId],
    queryFn: () => fetchEntityWorkItems(workspaceId, entityId),
    enabled: !!entity,
  })

  const { data: documentTypes } = useQuery({
    queryKey: ["document-types", workspaceId],
    queryFn: () => fetchDocumentTypes(workspaceId),
  })

  const { data: workItemTypesData } = useQuery({
    queryKey: ["work-item-types", workspaceId],
    queryFn: () => fetchWorkItemTypes(workspaceId),
  })

  const { data: entitiesData } = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => fetchEntities(workspaceId),
  })

  const employees = (entitiesData?.entities ?? []).filter(
    (e) => e.parentId === entityId
  )

  const deleteMutation = useMutation({
    mutationFn: () => deleteEntity(workspaceId, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] })
      toast.success("Entity deleted")
      router.push(`/${workspaceId}/entities`)
    },
    onError: () => toast.error("Failed to delete entity"),
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!entity) return null

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/${workspaceId}/entities`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Entities
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{entity.name}</h1>
            <StatusBadge type="entityRole" value={entity.role} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Created {format(new Date(entity.createdAt), "MMM d, yyyy")}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">
            Documents {documents ? `(${documents.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="work-items">
            Work Items {workItemsData ? `(${workItemsData.count})` : ""}
          </TabsTrigger>
          {entity.role !== "EMPLOYEE" && (
            <TabsTrigger value="employees">
              Employees {employees.length > 0 ? `(${employees.length})` : ""}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
          {!documents?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No documents linked to this entity.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>
                      <StatusBadge type="expiry" value={doc.expiryStatus} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.expiryDate ? format(new Date(doc.expiryDate), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(doc.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => downloadDocument(doc.downloadUrl, doc.fileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="work-items" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setCreateWorkItemOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Work Item
            </Button>
          </div>
          {!workItemsData?.workItems.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No work items for this entity.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workItemsData.workItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/${workspaceId}/work-items/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.priority ? (
                        <StatusBadge type="priority" value={item.priority} />
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {entity.role !== "EMPLOYEE" && (
          <TabsContent value="employees" className="mt-4">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setAddEmployeeOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </div>
            {!employees.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No employees linked to this entity.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Link
                          href={`/${workspaceId}/entities/${emp.id}`}
                          className="font-medium hover:underline"
                        >
                          {emp.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="entityRole" value={emp.role} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <EditEntityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        workspaceId={workspaceId}
        entity={entity}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Entity"
        description={`Are you sure you want to delete "${entity.name}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
      {documentTypes && entitiesData && (
        <UploadDocumentDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          workspaceId={workspaceId}
          documentTypes={documentTypes}
          entities={entitiesData.entities}
          defaultEntityId={entityId}
        />
      )}
      {workItemTypesData && entitiesData && (
        <CreateWorkItemDialog
          open={createWorkItemOpen}
          onOpenChange={setCreateWorkItemOpen}
          workspaceId={workspaceId}
          entities={entitiesData.entities}
          workItemTypes={workItemTypesData.workItemTypes}
          defaultEntityId={entityId}
        />
      )}
      <CreateEntityDialog
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        workspaceId={workspaceId}
        defaultRole="EMPLOYEE"
        defaultParentId={entityId}
      />
    </div>
  )
}
