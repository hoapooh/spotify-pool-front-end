import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex w-full touch-none select-none items-center group hover:cursor-pointer",
			className
		)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range className="absolute h-full bg-primary group-hover:bg-[#1ed760]" />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb
			className={cn(
				"block h-4 w-4 rounded-full border border-background bg-foreground ring-offset-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				props.disabled && "hidden" // Hide thumb when slider is disabled
			)}
		/>
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
