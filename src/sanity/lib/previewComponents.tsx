'use client'

import React from 'react'

// Custom preview component for features
export function FeaturePreview(props: any) {
  const { title, description, image, gradientFrom, gradientTo, workflowStatus, order } = props

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    draft: '📝 Draft',
    review: '👀 In Review',
    approved: '✅ Approved',
    published: '🚀 Published',
    rejected: '❌ Rejected'
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Feature Image/Gradient Preview */}
      <div 
        className={`w-16 h-16 rounded-lg flex-shrink-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
        style={{
          backgroundImage: image?.asset?.url ? `url(${image.asset.url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="flex-1 min-w-0">
        {/* Title and Order */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {order && <span className="text-sm text-gray-500 mr-2">#{order}</span>}
            {title || 'Untitled Feature'}
          </h3>
          
          {/* Workflow Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[workflowStatus] || statusColors.draft}`}>
            {statusLabels[workflowStatus] || statusLabels.draft}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {description || 'No description provided'}
        </p>
        
        {/* Feature Type Based on Order */}
        <div className="text-xs text-gray-500">
          {order >= 1 && order <= 5 && '🎯 Core Feature'}
          {order >= 6 && order <= 11 && '📖 Story'}
          {order >= 12 && '🔧 Additional Feature'}
        </div>
      </div>
    </div>
  )
}

// Web preview component (shows how it looks on the actual website)
export function FeatureWebPreview({ document }: { document: any }) {
  const { title, description, image, imagePath, ctaText, ctaUrl, author, publishedAt, audioFile } = document.displayed || {}

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="text-sm text-gray-500 mb-6 text-center">🖥️ Website Preview</div>
      
      {/* Recreate the actual feature page layout */}
      <div className="min-h-screen bg-white">
        {/* Hero Section - Text with Author/Date */}
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center px-8">
            {/* Author and Date Section */}
            {(publishedAt || author) && (
              <div className="mb-8 flex items-center justify-center gap-4 text-sm text-gray-600">
                {publishedAt && (
                  <time dateTime={publishedAt}>
                    {new Date(publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
                {publishedAt && author && <span>•</span>}
                {author && (
                  <div className="flex items-center gap-2">
                    {author.image && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                        👤
                      </div>
                    )}
                    <span>{author.name}</span>
                  </div>
                )}
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {title || 'Untitled Feature'}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg max-w-lg mx-auto font-light">
              {description || 'No description provided'}
            </p>
            {ctaUrl && (
              <div className="mt-12">
                <div className="inline-flex items-center rounded-full backdrop-blur-sm px-8 py-4 text-sm font-medium bg-gray-900 text-white border border-gray-900 transition-all duration-200 shadow-lg">
                  {ctaText || 'Get Started'}
                  <span className="ml-2">→</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Media Section */}
        <div className="relative px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative h-80 sm:h-96 lg:h-[480px] overflow-hidden rounded-xl bg-gray-100">
              {image?.asset?.url ? (
                <img
                  src={image.asset.url}
                  alt={title || 'Feature image'}
                  className="w-full h-full object-cover"
                />
              ) : imagePath ? (
                <img
                  src={imagePath}
                  alt={title || 'Feature image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="text-sm">Feature image or video will appear here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player Section */}
        {audioFile && (
          <div className="py-8 bg-gray-50">
            <div className="mx-auto max-w-2xl px-8 lg:px-12">
              <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  🔊
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Listen to {title || 'this feature'}</div>
                  <div className="text-xs text-gray-500">Audio narration available</div>
                </div>
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">▶️</div>
              </div>
            </div>
          </div>
        )}

        {/* Content Preview */}
        <div className="mx-auto max-w-2xl px-8 py-16 sm:py-20 lg:px-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-7 mb-4">
              Rich content and detailed information about this feature will appear here when you add content to the "Page Content" field.
            </p>
            <h2 className="text-2xl font-light tracking-tight mt-12 mb-6 text-gray-900">Key Benefits</h2>
            <p className="text-gray-700 leading-7 mb-4">
              Additional content sections, images, and formatting will be displayed when you create rich content for this feature.
            </p>
          </div>
        </div>

        {/* CTA Section Preview */}
        {ctaUrl && (
          <div className="px-6 py-16 lg:px-8 bg-gray-50">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-light tracking-tight text-gray-900 sm:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-600 font-light">
                Join thousands of teams already using {title || 'this feature'} to transform their workflow.
              </p>
              <div className="mt-12">
                <div className="inline-flex items-center rounded-full bg-gray-900 text-white px-8 py-4 text-sm font-medium shadow-lg">
                  {ctaText || 'Get Started'}
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile preview component
export function MobileFeaturePreview({ document }: { document: any }) {
  const { title, description, image, imagePath, ctaText, ctaUrl, author, publishedAt, audioFile } = document.displayed || {}

  return (
    <div className="p-6 bg-gray-100">
      <div className="text-sm text-gray-500 mb-6 text-center">📱 Mobile Preview</div>
      
      {/* iPhone-like frame */}
      <div className="mx-auto w-80 bg-black rounded-3xl p-2 shadow-xl">
        {/* Status bar */}
        <div className="bg-white rounded-t-2xl px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <div className="text-black font-medium">9:41</div>
            <div className="flex items-center gap-1">
              <div className="text-black">📶</div>
              <div className="text-black">📶</div>
              <div className="text-black">🔋</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-b-2xl overflow-hidden max-h-[600px] overflow-y-auto">
          {/* Mobile feature page layout */}
          <div className="min-h-screen bg-white">
            {/* Mobile Hero Section */}
            <div className="px-4 py-8">
              <div className="text-center">
                {/* Mobile Author and Date */}
                {(publishedAt || author) && (
                  <div className="mb-4 text-xs text-gray-500">
                    {publishedAt && new Date(publishedAt).toLocaleDateString()}
                    {publishedAt && author && ' • '}
                    {author?.name}
                  </div>
                )}

                <h1 className="text-xl font-light tracking-tight text-gray-900 mb-4 leading-tight">
                  {title || 'Untitled Feature'}
                </h1>
                <p className="text-sm leading-relaxed text-gray-600 mb-6 px-2">
                  {description || 'No description provided'}
                </p>
                
                {ctaUrl && (
                  <div className="mb-6">
                    <div className="inline-flex items-center rounded-full px-6 py-3 text-xs font-medium bg-gray-900 text-white shadow-lg">
                      {ctaText || 'Get Started'}
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Media Section */}
            <div className="px-4 mb-6">
              <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
                {image?.asset?.url ? (
                  <img
                    src={image.asset.url}
                    alt={title || 'Feature image'}
                    className="w-full h-full object-cover"
                  />
                ) : imagePath ? (
                  <img
                    src={imagePath}
                    alt={title || 'Feature image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-xs">Add image or video</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Audio Player */}
            {audioFile && (
              <div className="px-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    🔊
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">Listen to {title || 'this feature'}</div>
                    <div className="text-xs text-gray-500">Audio available</div>
                  </div>
                  <div className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">
                    ▶️
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Content Preview */}
            <div className="px-4 py-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Rich content and detailed information about this feature will appear here when you add content to the "Page Content" field.
                </p>
                <h2 className="text-lg font-light tracking-tight text-gray-900 mt-6 mb-3">Key Benefits</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Additional content sections will be displayed when you create rich content for this feature.
                </p>
              </div>
            </div>

            {/* Mobile CTA Section */}
            {ctaUrl && (
              <div className="px-4 py-8 bg-gray-50">
                <div className="text-center">
                  <h2 className="text-xl font-light tracking-tight text-gray-900 mb-4">
                    Ready to get started?
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 mb-6 px-2">
                    Join thousands of teams using {title || 'this feature'}.
                  </p>
                  <div className="inline-flex items-center rounded-full bg-gray-900 text-white px-6 py-3 text-xs font-medium shadow-lg">
                    {ctaText || 'Get Started'}
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom spacing for scroll */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Mobile responsive layout preview
      </div>
    </div>
  )
}