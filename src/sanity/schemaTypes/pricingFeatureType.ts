import {defineField, defineType} from 'sanity'

export const pricingFeatureType = defineType({
  name: 'pricingFeature',
  title: 'Pricing Feature',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Feature Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Feature Description',
      type: 'text',
      rows: 2,
      description: 'Optional detailed description of the feature',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Setup & Integration', value: 'setup'},
          {title: 'Analytics & Insights', value: 'analytics'},
          {title: 'AI Features', value: 'ai'},
          {title: 'Sales Tools', value: 'sales'},
          {title: 'Support', value: 'support'},
          {title: 'General', value: 'general'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the category (lower numbers first)',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'name',
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