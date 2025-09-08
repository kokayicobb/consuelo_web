import {defineField, defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this FAQ should appear (lower numbers first)',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Mercury (AI Coaching)', value: 'mercury'},
          {title: 'Zara (Roleplay)', value: 'zara'},
          {title: 'General', value: 'general'},
          {title: 'Pricing', value: 'pricing'},
          {title: 'Technical', value: 'technical'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category',
      order: 'order',
    },
    prepare({title, subtitle, order}) {
      return {
        title: `${order}. ${title}`,
        subtitle: subtitle ? `Category: ${subtitle}` : 'No category',
      }
    },
  },
})