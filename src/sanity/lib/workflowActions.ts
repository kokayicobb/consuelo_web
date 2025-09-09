import { DocumentActionComponent, DocumentActionsContext } from 'sanity'
import { createVersionHistoryActions } from './versionHistory'

// Custom workflow actions for features
export function createWorkflowActions(originalActions: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] {
  const { schemaType, document } = context
  
  // Only add workflow actions to feature documents
  if (schemaType !== 'feature') {
    return originalActions
  }

  const currentStatus = document?.workflowStatus || 'draft'

  // Define available actions based on current status
  const workflowActions: DocumentActionComponent[] = []

  if (currentStatus === 'draft') {
    workflowActions.push(SubmitForReview)
  }

  if (currentStatus === 'review') {
    workflowActions.push(ApproveContent, RejectContent)
  }

  if (currentStatus === 'approved') {
    workflowActions.push(PublishContent)
  }

  if (currentStatus === 'published') {
    workflowActions.push(UnpublishContent)
  }

  // Add "Back to Draft" for all statuses except draft
  if (currentStatus !== 'draft') {
    workflowActions.push(BackToDraft)
  }

  // Add version history actions
  const actionsWithVersionHistory = createVersionHistoryActions([...workflowActions, ...originalActions], context)
  
  return actionsWithVersionHistory
}

// Submit for Review Action
const SubmitForReview: DocumentActionComponent = (props) => ({
  label: '👀 Submit for Review',
  icon: () => '👀',
  onHandle: async () => {
    const { patch, publish, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'review',
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'review',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Submitted for review'
            }
          ]
        }
      }
    ])
    
    props.onComplete()
  }
})

// Approve Content Action
const ApproveContent: DocumentActionComponent = (props) => ({
  label: '✅ Approve',
  icon: () => '✅',
  tone: 'positive',
  onHandle: async () => {
    const { patch, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'approved',
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'approved',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Content approved for publication'
            }
          ]
        }
      }
    ])
    
    props.onComplete()
  }
})

// Reject Content Action
const RejectContent: DocumentActionComponent = (props) => ({
  label: '❌ Reject',
  icon: () => '❌',
  tone: 'critical',
  onHandle: async () => {
    const { patch, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'rejected',
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'rejected',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Content rejected - see review notes'
            }
          ]
        }
      }
    ])
    
    props.onComplete()
  }
})

// Publish Content Action
const PublishContent: DocumentActionComponent = (props) => ({
  label: '🚀 Publish',
  icon: () => '🚀',
  tone: 'positive',
  onHandle: async () => {
    const { patch, publish, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'published',
          publishedAt: new Date().toISOString(),
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'published',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Content published'
            }
          ]
        }
      }
    ])
    
    await publish.execute()
    props.onComplete()
  }
})

// Unpublish Content Action
const UnpublishContent: DocumentActionComponent = (props) => ({
  label: '📤 Unpublish',
  icon: () => '📤',
  tone: 'caution',
  onHandle: async () => {
    const { patch, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'draft',
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'unpublished',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Content unpublished'
            }
          ]
        }
      }
    ])
    
    props.onComplete()
  }
})

// Back to Draft Action
const BackToDraft: DocumentActionComponent = (props) => ({
  label: '📝 Back to Draft',
  icon: () => '📝',
  onHandle: async () => {
    const { patch, draft } = props
    
    await patch.execute([
      {
        set: {
          workflowStatus: 'draft',
          'workflowHistory': [
            ...(draft?.workflowHistory || []),
            {
              status: 'draft',
              timestamp: new Date().toISOString(),
              user: 'Current User', // TODO: Get actual user
              notes: 'Moved back to draft'
            }
          ]
        }
      }
    ])
    
    props.onComplete()
  }
})