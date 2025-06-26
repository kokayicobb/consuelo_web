"use client"

import { createPlatePlugin } from "platejs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Workflow, Play, Pause, Settings } from "lucide-react"

export const AutomationPlugin = createPlatePlugin({
  key: "automation",
  node: {
    isElement: true,
    isVoid: true,
  },
})

export function AutomationElement({ element, ...props }: any) {
  const {
    name = "New Automation",
    description = "Automation workflow",
    status = "active",
    trigger = "Manual",
    actions = [],
  } = element

  const handleToggleAutomation = () => {
    // Integration with n8n API would go here
    console.log("Toggle automation:", name)
  }

  const handleEditAutomation = () => {
    // Open n8n editor or configuration modal
    console.log("Edit automation:", name)
  }

  return (
    <Card className="my-4 border-purple-200 bg-purple-50" {...props.attributes}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-purple-600" />
            {name}
          </CardTitle>
          <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium">Trigger:</span>
          <Badge variant="outline">{trigger}</Badge>
        </div>

        {actions.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-medium">Actions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {actions.map((action: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={handleToggleAutomation}>
            {status === "active" ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleEditAutomation}>
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

AutomationPlugin.withComponent(AutomationElement)
