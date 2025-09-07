import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { type SanityDocument } from 'next-sanity'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/PortableText'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { Zap, Shield, Clock, ArrowRight } from 'lucide-react'
import UseCaseVideo from '@/components/UseCaseVideo'
import TTSPlayer from '@/components/TTSPlayer'
import VideoPlayer from '@/components/VideoPlayer'
import { getVideoUrl } from '@/sanity/lib/image'

// Icon mapping for the features section
const iconMap = {
  zap: Zap,
  shield: Shield, 
  clock: Clock,
  // Add more icons as needed
}

const FEATURE_QUERY = `*[_type == "feature" && slug.current == $slug][0] {
  _id,
  title,
  description,
  image,
  imagePath,
  video,
  isHero,
  gradientFrom,
  gradientTo,
  slug,
  content,
  contentMarkdown,
  heroVideo,
  featuresSection,
  ctaText,
  ctaUrl,
  publishedAt,
  audioFile,
  audioDuration,
  author->{
    name,
    image,
    bio
  }
}`

const USE_CASE_QUERY = `*[_type == "useCase" && slug.current == $slug][0] {
  _id,
  title,
  description,
  loomVideoUrl,
  slug
}`

const ALL_FEATURES_QUERY = `*[_type == "feature"] | order(order asc) {
  _id,
  title,
  description,
  image,
  imagePath,
  href,
  isHero,
  gradientFrom,
  gradientTo,
  slug,
  order
}`

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const [feature, useCase] = await Promise.all([
    client.fetch<SanityDocument>(FEATURE_QUERY, resolvedParams),
    client.fetch<SanityDocument>(USE_CASE_QUERY, resolvedParams),
  ])
  
  const content = feature || useCase
  
  if (!content) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: `${content.title} | Consuelo`,
    description: content.description,
  }
}

export async function generateStaticParams() {
  const [features, useCases] = await Promise.all([
    client.fetch<SanityDocument[]>(`*[_type == "feature"]{ slug }`),
    client.fetch<SanityDocument[]>(`*[_type == "useCase"]{ slug }`),
  ])

  return [
    ...features
      .filter((feature) => feature.slug?.current)
      .map((feature) => ({
        slug: feature.slug.current,
      })),
    ...useCases
      .filter((useCase) => useCase.slug?.current)
      .map((useCase) => ({
        slug: useCase.slug.current,
      })),
  ]
}

export default async function FeaturePage({ params }: Props) {
  const resolvedParams = await params
  const [feature, useCase, allFeatures] = await Promise.all([
    client.fetch<SanityDocument>(FEATURE_QUERY, resolvedParams),
    client.fetch<SanityDocument>(USE_CASE_QUERY, resolvedParams),
    client.fetch<SanityDocument[]>(ALL_FEATURES_QUERY),
  ])

  if (!feature && !useCase) {
    notFound()
  }

  // If it's a use case, render the video component
  if (useCase) {
    return (
      <UseCaseVideo
        videoUrl={useCase.loomVideoUrl}
        title={useCase.title}
        description={useCase.description}
      />
    )
  }

  // Otherwise render the feature page as before
  if (!feature) {
    notFound()
  }

  // Filter out the current feature from other features
  const otherFeatures = allFeatures.filter(f => f._id !== feature._id)

  // Helper function to get video URL from feature video config
  const getFeatureVideoUrl = () => {
    // Priority: video object > heroVideo URL
    if (feature.video) {
      switch (feature.video.videoType) {
        case 'youtube':
          if (feature.video.url) {
            const videoId = feature.video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${feature.video.autoplay ? 1 : 0}&mute=${feature.video.muted ? 1 : 0}&loop=${feature.video.loop ? 1 : 0}` : null;
          }
          break;
        case 'vimeo':
          if (feature.video.url) {
            const videoId = feature.video.url.match(/vimeo\.com\/(\d+)/)?.[1];
            return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${feature.video.autoplay ? 1 : 0}&muted=${feature.video.muted ? 1 : 0}&loop=${feature.video.loop ? 1 : 0}` : null;
          }
          break;
        case 'loom':
          if (feature.video.url) {
            return feature.video.url.includes('/embed/') 
              ? `${feature.video.url}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${feature.video.autoplay ? 'true' : 'false'}`
              : `https://www.loom.com/embed/${feature.video.url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${feature.video.autoplay ? 'true' : 'false'}`;
          }
          break;
        case 'upload':
          // Handle uploaded video files using Sanity helper
          return getVideoUrl(feature.video.file);
        case 'url':
          // Direct video URL
          return feature.video.url || null;
      }
    }
    
    // Fallback to heroVideo if available
    if (feature.heroVideo) {
      return feature.heroVideo;
    }
    
    return null;
  }

  const videoUrl = getFeatureVideoUrl()

  return (
    <div className="min-h-screen">
      {/* Hero Section - Text with Author/Date */}
      <div >
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center px-8">
            {/* Author and Date Section */}
            {(feature.publishedAt || feature.author) && (
              <div className="mb-8 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {feature.publishedAt && (
                  <time dateTime={feature.publishedAt}>
                    {new Date(feature.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
                {feature.publishedAt && feature.author && <span>•</span>}
                {feature.author && (
                  <div className="flex items-center gap-2">
                    {feature.author.image && (
                      <Image
                        src={urlFor(feature.author.image).width(32).height(32).url()}
                        alt={feature.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{feature.author.name}</span>
                  </div>
                )}
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              {feature.title}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg max-w-lg mx-auto font-light">
              {feature.description}
            </p>
            {feature.ctaUrl && (
              <div className="mt-12">
                <Link
                  href={feature.ctaUrl}
                  className="inline-flex items-center rounded-full backdrop-blur-sm px-8 py-4 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {feature.ctaText || 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Media Section - Video or Image */}
      {(videoUrl || feature.image || feature.imagePath) && (
        <div className="relative px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
{videoUrl ? (
              // Video with orientation-based sizing
              <div className="flex justify-center">
                {feature.video?.videoType === 'upload' || feature.video?.videoType === 'url' ? (
                  <VideoPlayer
                    src={videoUrl}
                    autoPlay={feature.video?.autoplay !== false}
                    loop={feature.video?.loop !== false}
                    muted={feature.video?.muted !== false}
                  />
                ) : (
                  // For embedded videos - use fixed dimensions similar to images
                  <div className="relative overflow-hidden rounded-xl" style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: '450px', // Standard 16:9 ratio like images
                  }}>
                    <iframe
                      src={videoUrl}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Images maintain fixed height for consistency
              <div className="relative h-80 sm:h-96 lg:h-[480px] overflow-hidden rounded-xl">
                {feature.image ? (
                  <Image
                    src={urlFor(feature.image).width(1200).height(600).url()}
                    alt={feature.title || 'Feature image'}
                    fill
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : feature.imagePath ? (
                  <Image
                    src={feature.imagePath}
                    alt={feature.title || 'Feature image'}
                    fill
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text-to-Speech Player */}
      {feature.audioFile && (
        <div className="py-8">
          <div className="mx-auto max-w-2xl px-8 lg:px-12">
            <TTSPlayer 
              title={feature.title}
              audioUrl={getVideoUrl(feature.audioFile)}
              audioDuration={feature.audioDuration}
            />
          </div>
        </div>
      )}

      {/* Rich Content Section - Modern Article Layout */}
      {(feature.content || feature.contentMarkdown) && (
        <div >
          <div className="mx-auto max-w-2xl px-8 py-16 sm:py-20 lg:px-12">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-light prose-headings:tracking-tight prose-h2:text-2xl prose-h2:leading-tight prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-7 prose-p:mb-4 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-img:rounded-xl prose-img:shadow-lg">
              {/* Handle rich content array (new format) */}
              {feature.content && Array.isArray(feature.content) ? (
                <PortableText value={feature.content} />
              ) : 
              /* Handle legacy markdown content (old format) */
              feature.contentMarkdown ? (
                <MarkdownContent content={feature.contentMarkdown} id={`content-${feature._id}`} />
              ) : 
              /* Handle string content in the content field (migration case) */
              feature.content && typeof feature.content === 'string' ? (
                <MarkdownContent content={feature.content} id={`content-${feature._id}`} />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Features Grid Section - Minimal Modern */}
      {feature.featuresSection && feature.featuresSection.length > 0 && (
        <div className="bg-muted py-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-20">
              <h2 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
                Why Choose {feature.title}?
              </h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground font-light">
                Discover the powerful capabilities that set us apart
              </p>
            </div>
            <div className="mx-auto max-w-5xl">
              <dl className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                {feature.featuresSection.map((item, index) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Zap
                  return (
                    <div key={index} className="text-center group">
                      <div className="mx-auto mb-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <dt className="text-xl font-medium text-foreground mb-4">
                        {item.title}
                      </dt>
                      <dd className="text-base leading-7 text-muted-foreground max-w-xs mx-auto">
                        {item.description}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section - Minimal */}
      {feature.ctaUrl && (
        <div>
          <div className="px-6 py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-muted-foreground font-light">
                Join thousands of teams already using {feature.title} to transform their workflow.
              </p>
              <div className="mt-12">
                <Link
                  href={feature.ctaUrl}
                  className="inline-flex items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/80 px-8 py-4 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {feature.ctaText || 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Features Section - Minimalist Cards */}
      {otherFeatures.length > 0 && (
        <div className="py-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-20">
              <h2 className="text-4xl font-light tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Explore More Features
              </h2>
              <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-400 font-light">
                Discover our complete suite of tools and capabilities
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {otherFeatures.slice(0, 3).map((otherFeature) => (
                <Link 
                  key={otherFeature._id}
                  href={`/${(otherFeature.slug?.current || '').replace(/^.*\//, '').trim()}`}
                  className="group block"
                >
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-8 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-colors duration-200">
                    <div className="mb-6">
                      <div className={`inline-flex rounded-full bg-gradient-to-r ${otherFeature.gradientFrom} ${otherFeature.gradientTo} p-3`}>
                        <div className="h-6 w-6 bg-white/20 rounded"></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {otherFeature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {otherFeature.description}
                    </p>
                    <div className="flex items-center text-gray-900 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                      <span className="text-sm font-medium">Learn more</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}