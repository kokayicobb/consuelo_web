"use client"
import { useMemo } from "react"
import { Plate, usePlateEditor, PlateElement } from "platejs/react"

import { Editor, EditorContainer } from "@/components/ui/editor"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartArtifactPlugin, ChartArtifactElement } from "./chart-artifact-panel"
import { EmailArtifactPlugin, EmailArtifactElement } from "./email-artifact-plugin"
import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from "@platejs/basic-nodes/react"
// import { AutomationArtifactPlugin, AutomationArtifactElement } from "./automation-plugin"
// Define base element type
interface BaseElement {
  type: string
  children: Array<{ text: string }>
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  hasArtifacts?: boolean
  artifacts?: any[]
}

interface AIResponsePanelProps {
  message: Message
}

// Define custom element types
interface ChartElement extends BaseElement {
  type: 'chart-artifact'
  title: string
  data: any[]
}

interface EmailElement extends BaseElement {
  type: 'email-artifact'
  subject: string
  template: string
}

interface AutomationElement extends BaseElement {
  type: 'automation-artifact'
  name: string
  description: string
  trigger: string
  actions: string[]
}

export function AIResponsePanel({ message }: AIResponsePanelProps) {
  const initialValue = useMemo(() => {
    const nodes: any[] = [
      {
        type: "p",
        children: [{ text: message.content }],
      },
    ]

    // Add artifacts as interactive elements
    if (message.artifacts && message.artifacts.length > 0) {
      message.artifacts.forEach((artifact) => {
        switch (artifact.type) {
          case "chart":
            nodes.push({
              type: "chart-artifact",
              title: artifact.title,
              data: artifact.data,
              children: [{ text: "" }],
            } as ChartElement)
            break
          case "email":
            nodes.push({
              type: "email-artifact",
              subject: artifact.subject,
              template: artifact.template,
              children: [{ text: "" }],
            } as EmailElement)
            break
          case "automation":
            nodes.push({
              type: "automation-artifact",
              name: artifact.name,
              description: artifact.description,
              trigger: artifact.trigger,
              actions: artifact.actions,
              children: [{ text: "" }],
            } as AutomationElement)
            break
        }
      })
    }

    return nodes
  }, [message])

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      ChartArtifactPlugin,
      EmailArtifactPlugin,
     
    ],
    value: initialValue,
    readOnly: true,
    components: {
      'chart-artifact': ChartArtifactElement,
      'email-artifact': EmailArtifactElement,
     
    },
  })

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <Plate editor={editor}>
          <EditorContainer>
            <Editor className="min-h-full border-none focus:outline-none" placeholder="" />
          </EditorContainer>
        </Plate>
      </div>
    </ScrollArea>
  )
}