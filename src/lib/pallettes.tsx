import { generateForegroundColorFrom } from "@/lib/theme-utils";
import themes, { Theme } from "@/lib/themes";
import {
  ColorSchema,
  ThemeSchema,
  GradientDirectionEnum,
} from "@/lib/validation/theme-schema";
import { formatHex, parse } from "culori";
import * as z from "zod";

export type Colors = z.infer<typeof ThemeSchema>;

type Pallette = {
  [colorName: string]: Colors;
};
export const pallettes: Pallette = Object.entries(themes).reduce<
  Record<string, Colors>
>((acc, [themeName, theme]) => {
  acc[themeName] = ThemeToColors(theme);
  return acc;
}, {});

function ThemeToColors(theme: Theme): z.infer<typeof ThemeSchema> {
  const baseColors = {
    primary:
      (theme["primary"] && formatHex(parse(theme["primary"]))) ||
      generateForegroundColorFrom(theme.primary),
    secondary: generateForegroundColorFrom(theme["base-100"]),
    background: theme["base-100"]
      ? formatHex(parse(theme["base-100"]))
      : undefined,
    isCustom: false,
    pallette: "",
  };

  if (theme.backgroundType === "gradient") {
    return {
      ...baseColors,
      backgroundType: "gradient",
      gradientStartColor: theme.gradientStartColor,
      gradientEndColor: theme.gradientEndColor,
      gradientDirection: theme.gradientDirection as
        | z.infer<typeof GradientDirectionEnum>
        | undefined,
    };
  }

  return {
    ...baseColors,
    backgroundType: "solid",
    gradientStartColor: undefined,
    gradientEndColor: undefined,
    gradientDirection: undefined,
  };
}
