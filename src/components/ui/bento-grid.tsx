import { cn } from "@/lib/utils";

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
        "grid grid-cols-2 sm:grid-cols-3 gap-4 mx-auto",
        "max-w-7xl lg:max-w-[85rem] xl:max-w-[95rem] 2xl:max-w-[110rem]",
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
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200",
        "shadow-input dark:shadow-none",
        "p-4 lg:p-6 xl:p-8",
        "dark:bg-black dark:border-white/[0.2] bg-white border border-transparent",
        "justify-between flex flex-col space-y-4",
        "min-h-[auto] lg:min-h-[18rem] xl:min-h-[22rem]",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2 text-sm sm:text-base lg:text-lg xl:text-xl">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs sm:text-sm lg:text-base xl:text-lg dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};