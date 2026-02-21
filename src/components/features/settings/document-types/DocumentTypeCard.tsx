"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteDocumentType } from "@/lib/api/document-types"
import { DocumentType } from "@/lib/types/api"
import { AddFieldDialog } from "./AddFieldDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DocumentTypeCardProps {
  docType: DocumentType
  workspaceId: string
}

export function DocumentTypeCard({ docType, workspaceId }: DocumentTypeCardProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocumentType(workspaceId, docType.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types", workspaceId] })
      toast.success("Document type deleted")
      setDeleteOpen(false)
    },
    onError: () => toast.error("Failed to delete document type"),
  })

  return (
    <>
      <Card>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-3">
                <p className="font-semibold">{docType.name}</p>
                <div className="flex items-center gap-1.5">
                  {docType.hasExpiry && <Badge variant="secondary" className="text-xs">Expiry</Badge>}
                  {docType.hasMetadata && (
                    <Badge variant="outline" className="text-xs">
                      {docType.fields.length} field{docType.fields.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {docType.fields.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Expiry Field</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docType.fields.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-sm">{f.fieldKey}</TableCell>
                        <TableCell className="text-sm capitalize">{f.fieldType}</TableCell>
                        <TableCell className="text-sm">{f.isRequired ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-sm">{f.isExpiryField ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No fields defined.</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddFieldOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Field
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Type
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AddFieldDialog
        open={addFieldOpen}
        onOpenChange={setAddFieldOpen}
        workspaceId={workspaceId}
        typeId={docType.id}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Document Type"
        description={`Are you sure you want to delete "${docType.name}"? This will affect all documents of this type.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
