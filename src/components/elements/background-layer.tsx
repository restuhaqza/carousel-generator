import React from "react";
import { cn } from "@/lib/utils";
import { ThemeSchema } from "@/lib/validation/theme-schema";
import * as z from "zod";

export type BackgroundLayerProps = {
  theme: z.infer<typeof ThemeSchema>;
  className?: string;
};

export function BackgroundLayer({
  theme,
  className = "",
}: BackgroundLayerProps) {
  const style: React.CSSProperties = {};

  if (
    theme.backgroundType === "gradient" &&
    theme.gradientStartColor &&
    theme.gradientEndColor &&
    theme.gradientDirection
  ) {
    style.backgroundImage = `linear-gradient(${theme.gradientDirection}, ${theme.gradientStartColor}, ${theme.gradientEndColor})`;
  } else if (theme.background) {
    style.backgroundColor = theme.background;
  }

  return (
    <div
      style={style}
      className={cn(
        "w-full h-full absolute top-0 left-0 right-0 bottom-0",
        className
      )}
    ></div>
  );
}
