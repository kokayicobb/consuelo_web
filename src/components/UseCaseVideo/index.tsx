"use client";

interface UseCaseVideoProps {
  videoUrl: string;
  title: string;
  description: string;
}

export default function UseCaseVideo({ videoUrl, title, description }: UseCaseVideoProps) {
  const getLoomEmbedUrl = (url: string) => {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://www.loom.com/embed/${match[1]}?sid=a7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7&hideEmbedTopBar=true&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
    }
    return url;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative z-10 bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-medium text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-6xl aspect-video">
          <iframe
            src={getLoomEmbedUrl(videoUrl)}
            className="w-full h-full rounded-lg border-0"
            style={{ margin: 0, padding: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title}
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
}