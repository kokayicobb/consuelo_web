// "use client"

// import { useState, useCallback } from "react"
// import { Plate, usePlateEditor } from "platejs/react"
// import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from "@platejs/basic-nodes/react"
// import { Editor, EditorContainer } from "@/components/ui/editor"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { ArrowLeft, Send, Sparkles } from "lucide-react"
// import { sendChatMessage } from "@/lib/actions-chatbot"
// import { AIResponsePlugin } from "../ui/plate/ai-response-plugin"
// import { AutomationPlugin } from "../ui/plate/automation-plugin"
// import { ChartPlugin } from "../ui/plate/chart-plugin"


// interface ConversationalEditorProps {
//   onBackToDashboard?: () => void
// }

// export function ConversationalEditor({ onBackToDashboard }: ConversationalEditorProps) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])

//   const editor = usePlateEditor({
//     plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin, AIResponsePlugin, ChartPlugin, AutomationPlugin],
//     value: [
//       {
//         type: "p",
//         children: [{ text: "Ask me anything about your business data, request reports, or set up automations..." }],
//       },
//     ],
//   })

//   const handleSendMessage = useCallback(async () => {
//     const content = editor.children
//       .map((node) => node.children?.map((child) => child.text).join("") || "")
//       .join("\n")
//       .trim()

//     if (!content) return

//     setIsLoading(true)
//     const newMessages = [...messages, { role: "user", content }]
//     setMessages(newMessages)

//     try {
//       const response = await sendChatMessage(newMessages)

//       // Insert AI response into editor
//       editor.tf.insertNodes([
//         {
//           type: "ai-response",
//           children: [{ text: response }],
//         },
//       ])

//       setMessages([...newMessages, { role: "assistant", content: response }])
//     } catch (error) {
//       console.error("Error sending message:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [editor, messages])

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center justify-between p-4 border-b">
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
//             <ArrowLeft className="w-4 h-4" />
//           </Button>
//           <h2 className="text-xl font-semibold flex items-center gap-2">
//             <Sparkles className="w-5 h-5 text-blue-500" />
//             AI Assistant
//           </h2>
//         </div>
//         <Button onClick={handleSendMessage} disabled={isLoading}>
//           <Send className="w-4 h-4 mr-2" />
//           {isLoading ? "Processing..." : "Send"}
//         </Button>
//       </div>

//       <div className="flex-1 p-4">
//         <Card className="h-full">
//           <CardHeader>
//             <CardTitle>Conversational Business Intelligence</CardTitle>
//           </CardHeader>
//           <CardContent className="h-full">
//             <Plate editor={editor}>
//               <EditorContainer className="h-full">
//                 <Editor
//                   placeholder="Ask about your sales data, request a report, or say 'Create an automation to email new leads'..."
//                   className="h-full"
//                 />
//               </EditorContainer>
//             </Plate>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
