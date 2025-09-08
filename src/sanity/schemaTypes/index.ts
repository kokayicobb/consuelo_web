import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {featureType} from './featureType'
import {useCaseType} from './useCaseType'
import {faqType} from './faqType'
import {pricingPlanType} from './pricingPlanType'
import {pricingFeatureType} from './pricingFeatureType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, authorType, featureType, useCaseType, faqType, pricingPlanType, pricingFeatureType],
}
