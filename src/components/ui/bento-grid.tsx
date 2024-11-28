import { cn } from "@/lib/utils";
import Link from "next/link";

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
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto",
        "max-w-[90%] sm:max-w-[95%] lg:max-w-7xl xl:max-w-[95rem] 2xl:max-w-[110rem]",
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
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 border border-transparent",
        "shadow-none dark:shadow-none",
        "overflow-hidden",
        "justify-between flex flex-col",
        "min-h-[12rem] sm:min-h-[15rem] lg:min-h-[20rem]",
        "transform hover:scale-[1.02] hover:z-10 transition-all duration-200 ease-out",
        className
      )}
    >
      {header}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6 xl:p-8 flex flex-col h-full">
        <div className="bg-background/80 dark:bg-background/90 backdrop-blur-sm rounded-full p-2 sm:p-3 inline-block mb-2 sm:mb-3 self-start text-accent">
          {icon}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-foreground mb-1 sm:mb-2 mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

