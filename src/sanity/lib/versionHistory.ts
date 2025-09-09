import { DocumentActionComponent, DocumentActionsContext } from 'sanity'

// Enhanced version history tracking
export function createVersionHistoryActions(originalActions: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] {
  const { schemaType } = context
  
  // Only add version history to feature documents
  if (schemaType !== 'feature') {
    return originalActions
  }

  return [ViewVersionHistory, CompareVersions, ...originalActions]
}

// View Version History Action
const ViewVersionHistory: DocumentActionComponent = (props) => ({
  label: 'Version History',
  icon: () => '📜',
  onHandle: async () => {
    // This would open a custom modal or pane showing version history
    // For now, we'll add the history tracking to the document
    console.log('Opening version history for:', props.id)
    
    // In a real implementation, this would:
    // 1. Query document history from Sanity
    // 2. Open a modal with timeline view
    // 3. Allow comparing different versions
    
    props.onComplete()
  }
})

// Compare Versions Action  
const CompareVersions: DocumentActionComponent = (props) => ({
  label: 'Compare Versions',
  icon: () => '🔍',
  onHandle: async () => {
    console.log('Opening version comparison for:', props.id)
    
    // This would open a side-by-side comparison view
    props.onComplete()
  }
})

// Function to track document changes
export function trackDocumentChange(documentId: string, changeType: string, changes: any, userId?: string) {
  const historyEntry = {
    _type: 'versionHistory',
    documentId,
    changeType,
    timestamp: new Date().toISOString(),
    userId: userId || 'system',
    changes,
    snapshot: changes.after || changes // Store the document state after change
  }
  
  // In a real implementation, this would save to Sanity
  console.log('Tracking change:', historyEntry)
  
  return historyEntry
}