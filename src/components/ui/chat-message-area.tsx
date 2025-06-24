import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from "react";
import { useEffect } from "react";

type ScrollButtonAlignment = "left" | "center" | "right";

interface ScrollButtonProps {
	onClick: () => void;
	alignment?: ScrollButtonAlignment;
	className?: string;
}

export function ScrollButton({
	onClick,
	alignment = "right",
	className,
}: ScrollButtonProps) {
	const alignmentClasses = {
		left: "left-4",
		center: "left-1/2 -translate-x-1/2",
		right: "right-4",
	};

	return (
		<Button
			variant="secondary"
			size="icon"
			className={cn(
				"absolute bottom-4 rounded-full shadow-lg hover:bg-secondary",
				alignmentClasses[alignment],
				className,
			)}
			onClick={onClick}
		>
			<ChevronDown className="h-4 w-4" />
		</Button>
	);
}

interface ChatMessageAreaProps {
	children: ReactNode;
	className?: string;
	scrollButtonAlignment?: ScrollButtonAlignment;
	onScrollChange?: (isAtBottom: boolean) => void;
}

export function ChatMessageArea({
	children,
	className,
	scrollButtonAlignment = "right",
	onScrollChange,
}: ChatMessageAreaProps) {
	const [containerRef, showScrollButton, scrollToBottom] =
		useScrollToBottom<HTMLDivElement>();

	// Add scroll listener to report scroll position
	useEffect(() => {
		const container = containerRef.current;
		if (!container || !onScrollChange) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
			onScrollChange(isAtBottom);
		};

		container.addEventListener("scroll", handleScroll);
		// Check initial state
		handleScroll();

		return () => container.removeEventListener("scroll", handleScroll);
	}, [containerRef, onScrollChange]);

	return (
		<ScrollArea className="flex-1 relative">
			<div ref={containerRef}>
				<div className={cn(className, "min-h-0")}>{children}</div>
			</div>
			{showScrollButton && (
				<ScrollButton
					onClick={scrollToBottom}
					alignment={scrollButtonAlignment}
					className="absolute bottom-4 rounded-full shadow-lg hover:bg-secondary"
				/>
			)}
		</ScrollArea>
	);
}

ChatMessageArea.displayName = "ChatMessageArea";