import { defineField, defineType } from 'sanity'

export const useCaseType = defineType({
  name: 'useCase',
  title: 'Use Case',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used for the URL path (e.g., /ecommerce-demo)',
      options: {
        source: 'title',
        maxLength: 200,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Insurance', value: 'insurance' },
          { title: 'B2B', value: 'b2b' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'loomVideoUrl',
      title: 'Loom Video URL',
      description: 'Full Loom video URL (e.g., https://www.loom.com/share/...)',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})