'use client'

import React from 'react'
import { DefaultDocumentNodeResolver } from 'sanity/structure'
import { FeatureWebPreview, MobileFeaturePreview } from './previewComponents'

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  switch (schemaType) {
    case 'feature':
      return S.document().views([
        S.view.form(),
        S.view
          .component(FeatureWebPreview)
          .title('Web Preview')
          .icon(() => '🖥️'),
        S.view
          .component(MobileFeaturePreview)
          .title('Mobile Preview')
          .icon(() => '📱'),
      ])
    default:
      return S.document().views([S.view.form()])
  }
}