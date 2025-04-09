import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image"; // Added Next.js Image import

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
    className={cn(
      // Smaller grid with tighter spacing
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mx-auto sm:ml-auto",
      // Adjusted max-width to fit beside the sidebar
      "max-w-[calc(100%-12rem)]", // 100% - sidebar width (12rem)
      // Smaller overall padding and margins
      "px-2 sm:px-4",
      // Smaller min-heights for items
      "[&>*]:min-h-[10rem] sm:[&>*]:min-h-[12rem] lg:[&>*]:min-h-[14rem]",
      "[&>*:nth-last-child(2)]:lg:order-first [&>*:last-child]:lg:order-first",
      className
    )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href = '',
  onClick,
  backgroundImage, // Added background image prop
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  backgroundImage?: string; // New prop for background image URL
}) => {
  const Wrapper = href ? Link : 'div';
  
  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-xl group/bento relative",
        "overflow-hidden",
        "justify-between flex flex-col",
        "min-h-[12rem] sm:min-h-[15rem] lg:min-h-[20rem]",
        "transform hover:scale-[1.02] hover:z-10 transition-all duration-200 ease-out",
        href && "cursor-pointer",
        className
      )}
    >
      {/* Gradient border container */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF1493]/20 to-[#00BFFF]/20 rounded-xl opacity-60"></div>
      
      {/* Image background instead of solid color */}
      {backgroundImage ? (
        <div className="absolute inset-[1px] rounded-xl overflow-hidden">
          <Image 
            src={backgroundImage} 
            alt="Background" 
            fill 
            className="object-cover"
          />
          {/* Semi-transparent overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        </div>
      ) : (
        // Fallback to original background if no image provided
        <div className="absolute inset-[1px] bg-background rounded-xl"></div>
      )}
      
      {/* Content */}
      {header}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6 xl:p-8 flex flex-col h-full">
        
        <div className="flex-grow">
          <h3 className="font-bold text-foreground mb-1 sm:mb-2 mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            {description}
          </p>
        </div>
      </div>
    </Wrapper>
  );
};