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
      return `https://www.loom.com/embed/${match[1]}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-medium text-white">{title}</h1>
          <p className="mt-2 text-gray-300">{description}</p>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-6xl aspect-video">
          <iframe
            src={getLoomEmbedUrl(videoUrl)}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  );
}