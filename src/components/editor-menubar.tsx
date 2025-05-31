import { useFormContext } from "react-hook-form";

import { DocumentFormReturn } from "@/lib/document-form-types";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import { JsonExporter } from "./json-exporter";
import { FilenameForm } from "./forms/filename-form";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileInputForm from "./forms/file-input-form";
import { useFieldsFileImporter } from "@/lib/hooks/use-fields-file-importer";
import { usePagerContext } from "@/lib/providers/pager-context";
import { defaultValues } from "@/lib/default-document";
import { useToast } from "@/components/ui/use-toast";

const LOCAL_STORAGE_CONFIG_KEY = "carouselGeneratorConfig";

export function EditorMenubar({}: {}) {
  const { reset, watch, getValues }: DocumentFormReturn = useFormContext();
  const { setCurrentPage } = usePagerContext();
  const { toast } = useToast();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const { handleFileSubmission: handleConfigFileSubmission } =
    useFieldsFileImporter("config");
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  const { handleFileSubmission: handleContentFileSubmission } =
    useFieldsFileImporter("slides");

  const handleSaveConfiguration = () => {
    try {
      const currentConfig = getValues("config");
      localStorage.setItem(
        LOCAL_STORAGE_CONFIG_KEY,
        JSON.stringify(currentConfig)
      );
      toast({
        title: "Configuration Saved",
        description: "Your settings have been saved to local storage.",
      });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast({
        title: "Error Saving Configuration",
        description:
          "Could not save settings to local storage. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center flex-row gap-2">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <FilenameForm className={"text-left my-1"} />
            <MenubarSeparator />
            <MenubarItem onClick={handleSaveConfiguration}>
              Save Configuration
            </MenubarItem>
            <MenubarSeparator />
            <JsonExporter
              values={watch("config")}
              filename={"carousel-settings.json"}
            >
              <MenubarItem>Export Settings</MenubarItem>
            </JsonExporter>
            <Dialog
              open={isConfigDialogOpen}
              onOpenChange={setIsConfigDialogOpen}
            >
              <DialogTrigger asChild>
                <MenubarItem onSelect={(e) => e.preventDefault()}>
                  Import Settings
                </MenubarItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load a file with Settings</DialogTitle>
                </DialogHeader>

                <FileInputForm
                  handleSubmit={(files) => {
                    handleConfigFileSubmission(files);
                    setIsConfigDialogOpen(false);
                  }}
                  label={"Settings File"}
                  description="Select a json file to load"
                />
              </DialogContent>
            </Dialog>
            <MenubarSeparator />
            <JsonExporter
              values={watch("slides")}
              filename={"carousel-content.json"}
            >
              <MenubarItem>Export Content</MenubarItem>
            </JsonExporter>
            <Dialog
              open={isContentDialogOpen}
              onOpenChange={setIsContentDialogOpen}
            >
              <DialogTrigger asChild>
                <MenubarItem onSelect={(e) => e.preventDefault()}>
                  Import Content
                </MenubarItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load a file with content</DialogTitle>
                </DialogHeader>

                <FileInputForm
                  handleSubmit={(files) => {
                    handleContentFileSubmission(files);
                    setIsContentDialogOpen(false);
                  }}
                  label={"Content File"}
                  description="Select a json file to load"
                />
              </DialogContent>
            </Dialog>

            <MenubarSeparator />

            <MenubarItem
              onClick={() => {
                reset(defaultValues);
                setCurrentPage(0);
              }}
            >
              Reset to defaults
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
