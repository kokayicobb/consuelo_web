"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, GripVertical, Settings, Save } from "lucide-react"

export interface CustomField {
  id: string
  name: string
  label: string
  type: "text" | "email" | "phone" | "number" | "date" | "select" | "boolean" | "textarea"
  required: boolean
  sortable: boolean
  filterable: boolean
  visible: boolean
  order: number
  options?: string[] // For select fields
  defaultValue?: string
  description?: string
}

interface ColumnManagerProps {
  fields: CustomField[]
  onFieldsChange: (fields: CustomField[]) => void
  onSave: () => void
}

export default function ColumnManager({ fields, onFieldsChange, onSave }: ColumnManagerProps) {
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [isAddingField, setIsAddingField] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: "",
    label: "",
    type: "text",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: fields.length,
  })

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "boolean", label: "Yes/No" },
    { value: "textarea", label: "Long Text" },
  ]

  const handleAddField = () => {
    if (!newField.name || !newField.label) return

    const field: CustomField = {
      id: `field_${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type as CustomField["type"],
      required: newField.required || false,
      sortable: newField.sortable || true,
      filterable: newField.filterable || true,
      visible: newField.visible || true,
      order: newField.order || fields.length,
      options: newField.options || [],
      defaultValue: newField.defaultValue,
      description: newField.description,
    }

    onFieldsChange([...fields, field])
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      sortable: true,
      filterable: true,
      visible: true,
      order: fields.length + 1,
    })
    setIsAddingField(false)
  }

  const handleEditField = (field: CustomField) => {
    const updatedFields = fields.map((f) => (f.id === field.id ? field : f))
    onFieldsChange(updatedFields)
    setEditingField(null)
  }

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId)
    onFieldsChange(updatedFields)
  }

  const handleToggleVisibility = (fieldId: string) => {
    const updatedFields = fields.map((f) => (f.id === fieldId ? { ...f, visible: !f.visible } : f))
    onFieldsChange(updatedFields)
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const fieldIndex = fields.findIndex((f) => f.id === fieldId)
    const newFields = [...fields]
    const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1

    if ((direction === "up" && fieldIndex === 0) || (direction === "down" && fieldIndex === fields.length - 1)) {
      return
    }
    // Swap the fields
    ;[newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]]

    // Update order values
    newFields.forEach((field, index) => {
      field.order = index
    })

    onFieldsChange(newFields)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Column Manager
            </CardTitle>
            <CardDescription>Customize your table columns and fields to match your business needs</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                  <DialogDescription>Create a new field for your customer table</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="field-name">Field Name</Label>
                      <Input
                        id="field-name"
                        placeholder="e.g., customer_type"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field-label">Display Label</Label>
                      <Input
                        id="field-label"
                        placeholder="e.g., Customer Type"
                        value={newField.label}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-type">Field Type</Label>
                    <Select
                      value={newField.type}
                      onValueChange={(value) => setNewField({ ...newField, type: value as CustomField["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newField.type === "select" && (
                    <div className="space-y-2">
                      <Label htmlFor="field-options">Options (one per line)</Label>
                      <Textarea
                        id="field-options"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        value={newField.options?.join("\n") || ""}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            options: e.target.value.split("\n").filter(Boolean),
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="field-description">Description (optional)</Label>
                    <Input
                      id="field-description"
                      placeholder="Brief description of this field"
                      value={newField.description}
                      onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-required"
                        checked={newField.required}
                        onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                      />
                      <Label htmlFor="field-required">Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-sortable"
                        checked={newField.sortable}
                        onCheckedChange={(checked) => setNewField({ ...newField, sortable: checked })}
                      />
                      <Label htmlFor="field-sortable">Sortable</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-filterable"
                        checked={newField.filterable}
                        onCheckedChange={(checked) => setNewField({ ...newField, filterable: checked })}
                      />
                      <Label htmlFor="field-filterable">Filterable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-visible"
                        checked={newField.visible}
                        onCheckedChange={(checked) => setNewField({ ...newField, visible: checked })}
                      />
                      <Label htmlFor="field-visible">Visible</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingField(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddField} disabled={!newField.name || !newField.label}>
                    Add Field
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={onSave} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className={`${!field.visible ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, "up")}
                        disabled={index === 0}
                        className="h-4 w-4 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, "down")}
                        disabled={index === fields.length - 1}
                        className="h-4 w-4 p-0"
                      >
                        ↓
                      </Button>
                    </div>

                    <GripVertical className="h-4 w-4 text-gray-400" />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{field.label}</h4>
                        <Badge variant="outline" className="text-xs">
                          {fieldTypes.find((t) => t.value === field.type)?.label}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {field.name} {field.description && `• ${field.description}`}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {field.sortable && (
                          <Badge variant="secondary" className="text-xs">
                            Sortable
                          </Badge>
                        )}
                        {field.filterable && (
                          <Badge variant="secondary" className="text-xs">
                            Filterable
                          </Badge>
                        )}
                        {!field.visible && (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={field.visible} onCheckedChange={() => handleToggleVisibility(field.id)} />

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(field)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Field</DialogTitle>
                          <DialogDescription>Modify the properties of this field</DialogDescription>
                        </DialogHeader>
                        {editingField && (
                          <FieldEditor
                            field={editingField}
                            onSave={handleEditField}
                            onCancel={() => setEditingField(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Field</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{field.label}" field? This action cannot be undone and
                            will remove all data in this column.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteField(field.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Field
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No custom fields configured yet.</p>
              <p className="text-sm">Click "Add Field" to create your first custom field.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface FieldEditorProps {
  field: CustomField
  onSave: (field: CustomField) => void
  onCancel: () => void
}

function FieldEditor({ field, onSave, onCancel }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<CustomField>({ ...field })

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "boolean", label: "Yes/No" },
    { value: "textarea", label: "Long Text" },
  ]

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-field-name">Field Name</Label>
          <Input
            id="edit-field-name"
            value={editedField.name}
            onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-field-label">Display Label</Label>
          <Input
            id="edit-field-label"
            value={editedField.label}
            onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-field-type">Field Type</Label>
        <Select
          value={editedField.type}
          onValueChange={(value) => setEditedField({ ...editedField, type: value as CustomField["type"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {editedField.type === "select" && (
        <div className="space-y-2">
          <Label htmlFor="edit-field-options">Options (one per line)</Label>
          <Textarea
            id="edit-field-options"
            value={editedField.options?.join("\n") || ""}
            onChange={(e) =>
              setEditedField({
                ...editedField,
                options: e.target.value.split("\n").filter(Boolean),
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-field-description">Description</Label>
        <Input
          id="edit-field-description"
          value={editedField.description || ""}
          onChange={(e) => setEditedField({ ...editedField, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-field-required"
            checked={editedField.required}
            onCheckedChange={(checked) => setEditedField({ ...editedField, required: checked })}
          />
          <Label htmlFor="edit-field-required">Required</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-field-sortable"
            checked={editedField.sortable}
            onCheckedChange={(checked) => setEditedField({ ...editedField, sortable: checked })}
          />
          <Label htmlFor="edit-field-sortable">Sortable</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-field-filterable"
            checked={editedField.filterable}
            onCheckedChange={(checked) => setEditedField({ ...editedField, filterable: checked })}
          />
          <Label htmlFor="edit-field-filterable">Filterable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-field-visible"
            checked={editedField.visible}
            onCheckedChange={(checked) => setEditedField({ ...editedField, visible: checked })}
          />
          <Label htmlFor="edit-field-visible">Visible</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedField)}>Save Changes</Button>
      </DialogFooter>
    </div>
  )
}
