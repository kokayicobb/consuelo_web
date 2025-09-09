import {defineField, defineType} from 'sanity'

export const pricingPlanType = defineType({
  name: 'pricingPlan',
  title: 'Pricing Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Plan Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly Price',
      type: 'number',
      description: 'Price per month in dollars (use decimals for cents, e.g. 0.15)',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action Button Text',
      type: 'string',
      initialValue: 'Free 14 day trial',
    }),
    defineField({
      name: 'popular',
      title: 'Popular Plan',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'beta',
      title: 'Beta Plan',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'level',
      title: 'Plan Level',
      type: 'string',
      options: {
        list: [
          {title: 'Growth', value: 'growth'},
          {title: 'Scale', value: 'scale'},
          {title: 'Enterprise', value: 'enterprise'},
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this plan should appear (lower numbers first)',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'pricingFeature'}]
        }
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'monthlyPrice',
      media: 'popular',
      order: 'order',
    },
    prepare({title, subtitle, media, order}) {
      return {
        title: `${order}. ${title}${media ? ' ★' : ''}`,
        subtitle: subtitle ? `$${subtitle}/month` : 'Custom pricing',
      }
    },
  },
})