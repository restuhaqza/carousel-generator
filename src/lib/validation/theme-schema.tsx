import * as z from "zod";

export const ColorSchema = z.object({
  // primary: z.string().min(4).max(9).regex(/^#/),
  primary: z.string().min(7).max(7).regex(/^#/),
  secondary: z.string(),
  background: z.string().optional(),
});

// Define an enum for gradient directions
export const GradientDirectionEnum = z.enum([
  "to top",
  "to top right",
  "to right",
  "to bottom right",
  "to bottom",
  "to bottom left",
  "to left",
  "to top left",
]);

export const ThemeSchema = ColorSchema.extend({
  isCustom: z.boolean(),
  pallette: z.string(),
  backgroundType: z.enum(["solid", "gradient"]).default("solid").optional(),
  gradientStartColor: z.string().min(7).max(7).regex(/^#/).optional(),
  gradientEndColor: z.string().min(7).max(7).regex(/^#/).optional(),
  gradientDirection: GradientDirectionEnum.optional(),
}).superRefine((data, ctx) => {
  if (data.backgroundType === "solid" && !data.background) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Background color is required for solid background type.",
      path: ["background"],
    });
  }
  if (data.backgroundType === "gradient") {
    if (!data.gradientStartColor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Gradient start color is required for gradient background type.",
        path: ["gradientStartColor"],
      });
    }
    if (!data.gradientEndColor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gradient end color is required for gradient background type.",
        path: ["gradientEndColor"],
      });
    }
    if (!data.gradientDirection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gradient direction is required for gradient background type.",
        path: ["gradientDirection"],
      });
    }
  }
});
