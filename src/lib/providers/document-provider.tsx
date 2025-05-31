"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormProvider from "@/lib/providers/form-provider";
import * as z from "zod";
import {
  useRetrieveFormValues,
  usePersistFormValues,
} from "@/lib/hooks/use-persist-form";

import { DocumentSchema, ConfigSchema } from "@/lib/validation/document-schema";
import { PagerProvider } from "@/lib/providers/pager-context";
import { usePager } from "@/lib/hooks/use-pager";
import { SelectionProvider } from "@/lib/providers/selection-context";
import { useSelection } from "@/lib/hooks/use-selection";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { defaultValues as appDefaultValues } from "@/lib/default-document";
import { KeysProvider } from "@/lib/providers/keys-context";
import { useKeys } from "@/lib/hooks/use-keys";
import { StatusProvider } from "@/lib/providers/editor-status-context";
import deepmerge from "deepmerge";

const FORM_DATA_KEY = "documentFormKey";
const LOCAL_STORAGE_CONFIG_KEY = "carouselGeneratorConfig";

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { getSavedData: getSavedDocumentData } = useRetrieveFormValues(
    FORM_DATA_KEY,
    appDefaultValues,
    DocumentSchema
  );

  const initialFormValues = getSavedDocumentData();

  try {
    const savedConfigString =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY)
        : null;
    if (savedConfigString) {
      const savedConfig = JSON.parse(savedConfigString);
      const parsedSavedConfig = ConfigSchema.safeParse(savedConfig);
      if (parsedSavedConfig.success) {
        if (initialFormValues) {
          initialFormValues.config = deepmerge(
            initialFormValues.config,
            parsedSavedConfig.data
          );
        }
      } else {
        console.warn(
          "Failed to parse saved configuration from localStorage, using defaults.",
          parsedSavedConfig.error
        );
      }
    }
  } catch (error) {
    console.error("Error loading or merging saved configuration:", error);
  }

  const documentForm: DocumentFormReturn = useForm<
    z.infer<typeof DocumentSchema>
  >({
    resolver: zodResolver(DocumentSchema),
    defaultValues: initialFormValues || appDefaultValues,
  });

  usePersistFormValues({
    localStorageKey: FORM_DATA_KEY,
    values: documentForm.watch(),
  });

  const keys = useKeys();
  const selection = useSelection();
  const pager = usePager(0);

  return (
    <KeysProvider value={keys}>
      <FormProvider {...documentForm}>
        <StatusProvider>
          <SelectionProvider value={selection}>
            <PagerProvider value={pager}>
              <div className="flex-1 flex flex-col">{children}</div>
            </PagerProvider>
          </SelectionProvider>
        </StatusProvider>
      </FormProvider>
    </KeysProvider>
  );
}
