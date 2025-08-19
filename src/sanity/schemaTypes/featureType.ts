import { defineField, defineType } from 'sanity'

export const featureType = defineType({
  name: 'feature',
  title: 'Feature',
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
      name: 'image',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'imagePath',
      title: 'Image Path (fallback)',
      description: 'Alternative to uploading image - use existing image path like /StablityBlue3.png',
      type: 'string',
    }),
    defineField({
      name: 'href',
      title: 'Link URL',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isHero',
      title: 'Is Hero Feature',
      description: 'Should this feature be displayed as the large hero item?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'gradientFrom',
      title: 'Gradient From',
      description: 'Tailwind gradient class (e.g., from-purple-500)',
      type: 'string',
      initialValue: 'from-purple-500',
    }),
    defineField({
      name: 'gradientTo',
      title: 'Gradient To',
      description: 'Tailwind gradient class (e.g., to-blue-500)',
      type: 'string',
      initialValue: 'to-blue-500',
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
      media: 'image',
    },
  },
})