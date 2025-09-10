import { DocumentActionComponent } from 'sanity'

// Custom workflow actions for features
export function createWorkflowActions(originalActions: DocumentActionComponent[], context: any): DocumentActionComponent[] {
  const { schemaType, document, getClient } = context
  
  console.log('createWorkflowActions called with:', {
    schemaType,
    documentId: document?._id,
    workflowStatus: document?.workflowStatus,
    hasGetClient: !!getClient,
    hasDocument: !!document
  })
  
  // Return early if no document or not a feature document
  if (!document || schemaType !== 'feature') {
    console.log('No document or not a feature document, returning original actions')
    return originalActions
  }

  // Ensure document has an _id before proceeding
  if (!document._id) {
    console.log('Document has no _id, returning original actions')
    return originalActions
  }

  const currentStatus = document.workflowStatus || 'draft'
  console.log('Current workflow status:', currentStatus)
  
  const client = getClient({ apiVersion: '2023-05-03' })
  console.log('Got client:', !!client)

  // Define available actions based on current status
  const workflowActions: DocumentActionComponent[] = []

  if (currentStatus === 'draft') {
    console.log('Adding Submit for Review action')
    workflowActions.push(createSubmitForReviewAction(document, client))
  }

  if (currentStatus === 'review') {
    console.log('Adding Approve/Reject actions')
    workflowActions.push(createApproveContentAction(document, client), createRejectContentAction(document, client))
  }

  if (currentStatus === 'approved') {
    console.log('Adding Publish action')
    workflowActions.push(createPublishContentAction(document, client))
  }

  if (currentStatus === 'published') {
    console.log('Adding Unpublish action')
    workflowActions.push(createUnpublishContentAction(document, client))
  }

  // Add "Back to Draft" for all statuses except draft
  if (currentStatus !== 'draft') {
    console.log('Adding Back to Draft action')
    workflowActions.push(createBackToDraftAction(document, client))
  }

  console.log('Final workflow actions count:', workflowActions.length)
  return [...workflowActions, ...originalActions]
}

// Helper function to update document status
async function updateDocumentStatus(documentId: string, newStatus: string, client: any, additionalFields: any = {}) {
  console.log('updateDocumentStatus called:', { documentId, newStatus, additionalFields })
  
  const workflowHistoryEntry = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    user: 'Current User', // TODO: Get actual user info
    notes: `Moved to ${newStatus}`
  }

  try {
    console.log('About to patch document with:', {
      workflowStatus: newStatus,
      ...additionalFields,
      workflowHistory: workflowHistoryEntry
    })
    
    const result = await client
      .patch(documentId)
      .set({
        workflowStatus: newStatus,
        ...additionalFields
      })
      .setIfMissing({ workflowHistory: [] })
      .append('workflowHistory', [workflowHistoryEntry])
      .commit()
    
    console.log('Document status updated successfully:', result)
    alert(`✅ Document status updated to: ${newStatus}`)
  } catch (error) {
    console.error('Error updating document status:', error)
    alert(`❌ Failed to update document status: ${error.message}`)
  }
}

// Submit for Review Action
function createSubmitForReviewAction(document: any, client: any): DocumentActionComponent {
  console.log('Creating Submit for Review action for document:', document._id)
  return (props: any) => {
    return {
      label: '👀 Submit for Review',
      icon: () => '👀',
      onHandle: async () => {
        console.log('Submit for Review action clicked!')
        try {
          await updateDocumentStatus(document._id, 'review', client)
          props.onComplete()
        } catch (error) {
          console.error('Error in Submit for Review action:', error)
        }
      }
    }
  }
}

// Approve Content Action
function createApproveContentAction(document: any, client: any): DocumentActionComponent {
  return (props: any) => {
    return {
      label: '✅ Approve',
      icon: () => '✅',
      tone: 'positive' as any,
      onHandle: async () => {
        await updateDocumentStatus(document._id, 'approved', client)
        props.onComplete()
      }
    }
  }
}

// Reject Content Action
function createRejectContentAction(document: any, client: any): DocumentActionComponent {
  return (props: any) => {
    return {
      label: '❌ Reject',
      icon: () => '❌',
      tone: 'critical' as any,
      onHandle: async () => {
        await updateDocumentStatus(document._id, 'rejected', client)
        props.onComplete()
      }
    }
  }
}

// Publish Content Action
function createPublishContentAction(document: any, client: any): DocumentActionComponent {
  return (props: any) => {
    return {
      label: '🚀 Publish',
      icon: () => '🚀',
      tone: 'positive' as any,
      onHandle: async () => {
        await updateDocumentStatus(document._id, 'published', client, {
          publishedAt: new Date().toISOString()
        })
        
        // Also publish the document (make it live)
        try {
          await client.createOrReplace({
            ...document,
            _id: document._id.replace('drafts.', ''),
            workflowStatus: 'published',
            publishedAt: new Date().toISOString()
          })
        } catch (error) {
          console.error('Error publishing document:', error)
        }
        props.onComplete()
      }
    }
  }
}

// Unpublish Content Action
function createUnpublishContentAction(document: any, client: any): DocumentActionComponent {
  return (props: any) => {
    return {
      label: '📤 Unpublish',
      icon: () => '📤',
      tone: 'caution' as any,
      onHandle: async () => {
        await updateDocumentStatus(document._id, 'draft', client)
        
        // Remove the published version
        try {
          const publishedId = document._id.replace('drafts.', '')
          await client.delete(publishedId)
        } catch (error) {
          console.error('Error unpublishing document:', error)
        }
        props.onComplete()
      }
    }
  }
}

// Back to Draft Action
function createBackToDraftAction(document: any, client: any): DocumentActionComponent {
  return (props: any) => {
    return {
      label: '📝 Back to Draft',
      icon: () => '📝',
      onHandle: async () => {
        await updateDocumentStatus(document._id, 'draft', client)
        props.onComplete()
      }
    }
  }
}