"use client"

import { createPlatePlugin } from "platejs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Copy, Edit, Save } from "lucide-react"
import { useState } from "react"

export const EmailArtifactPlugin = createPlatePlugin({
  key: "email-artifact",
  node: {
    isElement: true,
    isVoid: true,
  },
})

export function EmailArtifactElement({ element, ...props }: any) {
  const { subject: initialSubject = "", template: initialTemplate = "" } = element
  const [isEditing, setIsEditing] = useState(false)
  const [subject, setSubject] = useState(initialSubject)
  const [template, setTemplate] = useState(initialTemplate)

  const handleSendEmail = () => {
    // Integration with email service
    console.log("Sending email:", { subject, template })
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(template)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save template to database
    console.log("Saving template:", { subject, template })
  }

  const variables = ["{{firstName}}", "{{lastName}}", "{{companyName}}", "{{senderName}}"]

  return (
    <Card className="my-4 border-blue-200 bg-blue-50" {...props.attributes}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Email Template
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-3 h-3 mr-1" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button size="sm" onClick={handleSave}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Subject:</label>
          {isEditing ? (
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
          ) : (
            <p className="mt-1 p-2 bg-white rounded border">{subject}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Template:</label>
          {isEditing ? (
            <Textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={8} className="mt-1" />
          ) : (
            <div className="mt-1 p-3 bg-white rounded border whitespace-pre-wrap">{template}</div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Available Variables:</label>
          <div className="flex flex-wrap gap-1">
            {variables.map((variable) => (
              <Badge key={variable} variant="outline" className="text-xs">
                {variable}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSendEmail} className="flex-1">
            <Send className="w-3 h-3 mr-1" />
            Send Email
          </Button>
          <Button variant="outline" onClick={handleCopyTemplate}>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

EmailArtifactPlugin.withComponent(EmailArtifactElement)
