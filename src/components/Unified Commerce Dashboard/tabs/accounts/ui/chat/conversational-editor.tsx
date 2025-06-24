"use client"

import { ConversationalInterface } from "./conversation-interface"


interface ConversationalEditorProps {
  onBackToDashboard?: () => void
}

export function ConversationalEditor({ onBackToDashboard }: ConversationalEditorProps) {
  return <ConversationalInterface onBackToDashboard={onBackToDashboard} />
}
