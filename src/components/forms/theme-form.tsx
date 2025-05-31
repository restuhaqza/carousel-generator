import { useFormContext } from "react-hook-form";
import * as z from "zod";
import React from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ColorPickerInput } from "./fields/color-picker-input";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { pallettes } from "@/lib/pallettes";
import { CustomIndicatorRadioGroupItem } from "../custom-indicator-radio-group-item";
import { ColorThemeDisplay } from "../color-theme-display";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { Checkbox } from "../ui/checkbox";
import { GradientDirectionEnum } from "@/lib/validation/theme-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function PalletteSelector({ form }: { form: DocumentFormReturn }) {
  const { control, setValue } = form;

  return (
    <FormField
      control={control as any}
      name="config.theme.pallette"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Select a palette</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(palletteName) => {
                const selectedPallette = pallettes[palletteName];
                setValue("config.theme.primary", selectedPallette.primary);
                setValue("config.theme.secondary", selectedPallette.secondary);
                setValue(
                  "config.theme.backgroundType",
                  selectedPallette.backgroundType || "solid"
                );

                if (selectedPallette.backgroundType === "gradient") {
                  setValue(
                    "config.theme.gradientStartColor",
                    selectedPallette.gradientStartColor
                  );
                  setValue(
                    "config.theme.gradientEndColor",
                    selectedPallette.gradientEndColor
                  );
                  setValue(
                    "config.theme.gradientDirection",
                    selectedPallette.gradientDirection
                  );
                  setValue("config.theme.background", undefined);
                } else {
                  setValue(
                    "config.theme.background",
                    selectedPallette.background
                  );
                  setValue("config.theme.gradientStartColor", undefined);
                  setValue("config.theme.gradientEndColor", undefined);
                  setValue("config.theme.gradientDirection", undefined);
                }
                setValue(field.name, palletteName);
              }}
              defaultValue={field.value}
              className="grid grid-cols-3 space-y-1"
            >
              {Object.entries(pallettes).map(([palletteName, colors]) => (
                <FormItem
                  className="flex items-center space-x-3 space-y-0"
                  key={palletteName}
                >
                  <FormControl>
                    <CustomIndicatorRadioGroupItem value={palletteName}>
                      <ColorThemeDisplay colors={colors} />
                    </CustomIndicatorRadioGroupItem>
                  </FormControl>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CustomColors({ form }: { form: DocumentFormReturn }) {
  const backgroundType = form.watch("config.theme.backgroundType");

  return (
    <>
      <ColorPickerInput name="config.theme.primary" label="Primary Color" />
      <ColorPickerInput name="config.theme.secondary" label="Secondary Color" />

      <FormField
        control={form.control as any}
        name="config.theme.backgroundType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Background Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value ?? "solid"}
                className="flex space-x-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="solid" />
                  </FormControl>
                  <FormLabel className="font-normal">Solid</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="gradient" />
                  </FormControl>
                  <FormLabel className="font-normal">Gradient</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormDescription>
              Select whether to use a solid color or a gradient for the
              background.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {backgroundType === "solid" && (
        <ColorPickerInput
          name="config.theme.background"
          label="Background Color"
        />
      )}

      {backgroundType === "gradient" && (
        <div className="space-y-6 p-4 border rounded-md">
          <h4 className="text-md font-medium">Gradient Options</h4>
          <ColorPickerInput
            name="config.theme.gradientStartColor"
            label="Start Color"
          />
          <ColorPickerInput
            name="config.theme.gradientEndColor"
            label="End Color"
          />
          <FormField
            control={form.control as any}
            name="config.theme.gradientDirection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GradientDirectionEnum.options.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
}

export function ThemeForm({}: {}) {
  const form: DocumentFormReturn = useFormContext();
  const { watch, setValue, getValues } = form;
  const isCustom = watch("config.theme.isCustom");

  React.useEffect(() => {
    if (isCustom && getValues("config.theme.backgroundType") === undefined) {
      setValue("config.theme.backgroundType", "solid", {
        shouldValidate: false,
      });
    }
  }, [isCustom, setValue, getValues]);

  return (
    <Form {...form}>
      <form className="space-y-8 w-full py-4">
        <FormField
          control={form.control as any}
          name="config.theme.isCustom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      if (
                        getValues("config.theme.backgroundType") === undefined
                      ) {
                        setValue("config.theme.backgroundType", "solid", {
                          shouldValidate: true,
                        });
                      }
                      if (
                        getValues("config.theme.backgroundType") === "solid" &&
                        !getValues("config.theme.background")
                      ) {
                        setValue("config.theme.background", "#FFFFFF", {
                          shouldValidate: true,
                        });
                      }
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none text-base">
                <FormLabel>Use custom colors</FormLabel>
              </div>
            </FormItem>
          )}
        />
        {isCustom ? (
          <CustomColors form={form} />
        ) : (
          <PalletteSelector form={form} />
        )}
      </form>
    </Form>
  );
}
