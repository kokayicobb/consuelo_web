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

export const PRICING_PLANS_QUERY = groq`*[_type == "pricingPlan"] | order(order asc) {
  _id,
  name,
  slug,
  monthlyPrice,
  description,
  cta,
  popular,
  beta,
  level,
  order,
  "features": features[]-> {
    _id,
    name,
    description,
    category,
    order
  }
}`

export const PRICING_FEATURES_QUERY = groq`*[_type == "pricingFeature"] | order(category asc, order asc) {
  _id,
  name,
  description,
  category,
  order
}`