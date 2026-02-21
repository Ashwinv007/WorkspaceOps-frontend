"use client"

import { useState } from "react"
import { Control, Controller } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DocumentTypeField } from "@/lib/types/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface DynamicMetadataFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: DocumentTypeField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function DynamicMetadataForm({ fields, control }: DynamicMetadataFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.fieldKey} className="space-y-1">
          <Label htmlFor={`metadata.${field.fieldKey}`}>
            {field.fieldKey}
            {field.isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Controller
            name={`metadata.${field.fieldKey}`}
            control={control}
            rules={{ required: field.isRequired ? `${field.fieldKey} is required` : false }}
            render={({ field: formField, fieldState }) => (
              <>
                {field.fieldType === "text" ? (
                  <Input
                    id={`metadata.${field.fieldKey}`}
                    {...formField}
                    value={formField.value ?? ""}
                  />
                ) : (
                  <DatePickerField
                    value={formField.value}
                    onChange={formField.onChange}
                    id={`metadata.${field.fieldKey}`}
                  />
                )}
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      ))}
    </div>
  )
}

function DatePickerField({
  value,
  onChange,
  id,
}: {
  value: string | undefined
  onChange: (val: string) => void
  id: string
}) {
  const [open, setOpen] = useState(false)
  const parsed = value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {parsed ? format(parsed, "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsed}
          onSelect={(date) => {
            if (date) {
              onChange(date.toISOString())
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
