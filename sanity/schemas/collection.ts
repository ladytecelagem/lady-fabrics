// schemas/collection.ts  — substitua/mescle no seu schema atual
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: r => r.required()}),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      options: {source: 'title', maxLength: 96}, validation: r => r.required(),
    }),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string'}),
    defineField({name: 'narrative', title: 'Narrative', type: 'array', of: [{type: 'block'}]}),
    defineField({
      name: 'applications', title: 'Applications', type: 'array',
      of: [{type: 'string'}], options: {layout: 'tags'},
    }),
    defineField({name: 'heroImage', title: 'Hero Image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'gallery', title: 'Gallery', type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
    defineField({name: 'order', title: 'Order', type: 'number'}),
    defineField({name: 'seoTitle', title: 'SEO Title', type: 'string'}),
    defineField({name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2}),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'subtitle', media: 'heroImage'}},
})
