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
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      description: 'Date this feature was published or announced',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Who wrote or created this feature content',
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
      description: 'Used for the URL path (e.g., /mercury)',
      options: {
        source: 'title',
        maxLength: 200,
      },
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
    // Rich content fields for detailed feature pages
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      description: 'Rich content with text, images, and formatting for the feature detail page',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              description: 'Important for SEO and accessibility'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        },
        {
          type: 'object',
          name: 'video',
          title: 'Video',
          fields: [
            {
              name: 'videoType',
              title: 'Video Type',
              type: 'string',
              options: {
                list: [
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'Loom', value: 'loom' },
                  { title: 'Direct Upload', value: 'upload' },
                  { title: 'Custom URL', value: 'url' }
                ]
              },
              validation: (Rule) => Rule.required()
            },
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              description: 'Full URL for YouTube, Vimeo, Loom, or custom video',
              hidden: ({ parent }) => parent?.videoType === 'upload'
            },
            {
              name: 'file',
              title: 'Video File',
              type: 'file',
              description: 'Upload video file directly (MP4 recommended)',
              hidden: ({ parent }) => parent?.videoType !== 'upload'
            },
            {
              name: 'title',
              title: 'Video Title',
              type: 'string',
              description: 'Optional title to display above the video'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption to display below the video'
            },
            {
              name: 'aspectRatio',
              title: 'Aspect Ratio',
              type: 'string',
              options: {
                list: [
                  { title: '16:9 (Widescreen)', value: '16:9' },
                  { title: '4:3 (Standard)', value: '4:3' },
                  { title: '1:1 (Square)', value: '1:1' }
                ]
              },
              initialValue: '16:9'
            }
          ],
          preview: {
            select: {
              title: 'title',
              videoType: 'videoType',
              url: 'url'
            },
            prepare({ title, videoType, url }) {
              return {
                title: title || 'Video',
                subtitle: `${videoType?.toUpperCase()} - ${url || 'Uploaded file'}`
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'contentMarkdown',
      title: 'Page Content (Markdown - Legacy)',
      type: 'text',
      description: 'Markdown content (use the rich "Page Content" field above for better image support)',
      rows: 20,
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'url',
      description: 'Optional video URL for the hero section',
    }),
    defineField({
      name: 'featuresSection',
      title: 'Features Section',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'title',
            title: 'Feature Title',
            type: 'string',
          }),
          defineField({
            name: 'description',
            title: 'Feature Description',
            type: 'text',
          }),
          defineField({
            name: 'icon',
            title: 'Icon Name',
            type: 'string',
            description: 'Lucide icon name (e.g., "zap", "shield", "clock")',
          }),
        ],
      }],
      description: 'List of features to display in a grid',
    }),
    defineField({
      name: 'ctaText',
      title: 'Call to Action Text',
      type: 'string',
      initialValue: 'Get Started',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Call to Action URL',
      type: 'url',
      description: 'Where the CTA button should link to',
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