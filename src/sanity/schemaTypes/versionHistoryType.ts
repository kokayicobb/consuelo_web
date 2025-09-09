import { defineField, defineType } from 'sanity'

export const versionHistoryType = defineType({
  name: 'versionHistory',
  title: 'Version History',
  type: 'document',
  fields: [
    defineField({
      name: 'documentId',
      title: 'Document ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'documentType',
      title: 'Document Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'changeType',
      title: 'Change Type',
      type: 'string',
      options: {
        list: [
          { title: '✨ Created', value: 'created' },
          { title: '✏️ Updated', value: 'updated' },
          { title: '🚀 Published', value: 'published' },
          { title: '📤 Unpublished', value: 'unpublished' },
          { title: '👀 Submitted for Review', value: 'submitted' },
          { title: '✅ Approved', value: 'approved' },
          { title: '❌ Rejected', value: 'rejected' },
          { title: '🗑️ Deleted', value: 'deleted' }
        ]
      }
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'ID of the user who made this change'
    }),
    defineField({
      name: 'userName',
      title: 'User Name',
      type: 'string',
      description: 'Name of the user who made this change'
    }),
    defineField({
      name: 'changeDescription',
      title: 'Change Description',
      type: 'text',
      description: 'Human-readable description of what changed'
    }),
    defineField({
      name: 'changedFields',
      title: 'Changed Fields',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of fields that were modified'
    }),
    defineField({
      name: 'previousValues',
      title: 'Previous Values',
      type: 'object',
      description: 'Values before the change (for comparison)',
      fields: [
        { name: 'data', title: 'Data', type: 'text' }
      ]
    }),
    defineField({
      name: 'newValues',
      title: 'New Values', 
      type: 'object',
      description: 'Values after the change',
      fields: [
        { name: 'data', title: 'Data', type: 'text' }
      ]
    }),
    defineField({
      name: 'diffSummary',
      title: 'Diff Summary',
      type: 'text',
      description: 'Summary of changes made'
    }),
    defineField({
      name: 'version',
      title: 'Version Number',
      type: 'number',
      description: 'Incremental version number for this document'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for categorizing this change (e.g., "major", "minor", "hotfix")'
    })
  ],
  preview: {
    select: {
      title: 'changeType',
      subtitle: 'changeDescription',
      timestamp: 'timestamp',
      userName: 'userName'
    },
    prepare({ title, subtitle, timestamp, userName }) {
      const changeTypeLabels = {
        created: '✨ Created',
        updated: '✏️ Updated', 
        published: '🚀 Published',
        unpublished: '📤 Unpublished',
        submitted: '👀 Submitted for Review',
        approved: '✅ Approved',
        rejected: '❌ Rejected',
        deleted: '🗑️ Deleted'
      }
      
      return {
        title: changeTypeLabels[title] || title,
        subtitle: `${subtitle || 'No description'} • ${userName || 'Unknown user'} • ${new Date(timestamp).toLocaleDateString()}`
      }
    }
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'timestampDesc',
      by: [{ field: 'timestamp', direction: 'desc' }]
    },
    {
      title: 'Oldest First', 
      name: 'timestampAsc',
      by: [{ field: 'timestamp', direction: 'asc' }]
    }
  ]
})