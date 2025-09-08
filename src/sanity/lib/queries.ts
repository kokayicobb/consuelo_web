import { groq } from 'next-sanity'

export const FAQS_QUERY = groq`*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer,
  category,
  order
}`

export const FAQS_BY_CATEGORY_QUERY = groq`*[_type == "faq" && category == $category] | order(order asc) {
  _id,
  question,
  answer,
  category,
  order
}`