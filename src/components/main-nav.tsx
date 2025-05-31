import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "./ui/button";
import { EditorMenubar } from "./editor-menubar";
import {
  Download,
  Loader2Icon,
  Settings,
  FileText,
  ImageIcon,
} from "lucide-react";
import Pager from "./pager";
import { FilenameForm } from "./forms/filename-form";
import { BringYourKeysDialog } from "@/components/api-keys-dialog";
import { StarOnGithub } from "@/components/star-on-github";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormContext } from "react-hook-form";
import { DocumentSchema } from "@/lib/validation/document-schema";
import * as z from "zod";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { useToast } from "./ui/use-toast";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

interface MainNavProps {
  handlePrint: () => void;
  isPrinting: boolean;
  className?: string;
}

export function MainNav({ handlePrint, isPrinting, className }: MainNavProps) {
  const { watch } = useFormContext<z.infer<typeof DocumentSchema>>();
  const { toast } = useToast();
  const [isExportingImages, setIsExportingImages] = React.useState(false);

  const slides = watch("slides");
  const filename = watch("filename") || "carousel";

  // Transparent 1x1 PNG placeholder
  const transparentPlaceholder =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const handleExportAsImages = async () => {
    if (!slides || slides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Please add some content to your carousel.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingImages(true);
    toast({
      title: "Exporting Images",
      description: `Processing ${slides.length} slide(s)... This may take a moment. Check console for detailed logs.`,
    });

    console.log(`Starting image export for ${slides.length} slides.`);
    const zip = new JSZip();
    let successfulImages = 0;

    for (let i = 0; i < slides.length; i++) {
      console.log(`Processing slide ${i + 1}...`);
      const slideElementContainerId = `carousel-item-${i}`;
      const slideElementContainer = document.getElementById(
        slideElementContainerId
      );

      if (slideElementContainer) {
        console.log(
          `Found container for slide ${i + 1}: #${slideElementContainerId}`
        );
        const pageContentElement =
          slideElementContainer.querySelector<HTMLElement>(
            '[data-page-content="true"]'
          );

        if (pageContentElement) {
          console.log(
            `Found page content element for slide ${i + 1}:`,
            pageContentElement
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const dataUrl = await toPng(pageContentElement, {
              quality: 0.95,
              pixelRatio: 2,
              imagePlaceholder: transparentPlaceholder,
              fetchRequestInit: { mode: "cors" },
            });
            const slideFilename = `slide-${i + 1}.png`;
            zip.file(slideFilename, dataUrl.split(",")[1], { base64: true });
            successfulImages++;
            console.log(
              `Successfully processed and added slide ${i + 1} to ZIP.`
            );
          } catch (error) {
            console.error(
              `Error converting slide ${i + 1} to image:`,
              error,
              pageContentElement
            );
            toast({
              title: `Error processing slide ${i + 1}`,
              description:
                "Could not convert this slide to an image. Check console. External images might be blocked. Skipping.",
              variant: "destructive",
            });
          }
        } else {
          console.warn(
            `Could not find page content element with [data-page-content="true"] for slide ${
              i + 1
            } inside #${slideElementContainerId}. HTML structure of container:`,
            slideElementContainer.innerHTML
          );
          toast({
            title: `Skipping slide ${i + 1}`,
            description:
              "Could not find specific page content element. Check console.",
            variant: "default",
          });
        }
      } else {
        console.warn(
          `Could not find container #${slideElementContainerId} for slide ${
            i + 1
          }.`
        );
      }
    }

    console.log(
      `Finished processing all slides. Successful images: ${successfulImages}`
    );

    if (successfulImages > 0) {
      zip
        .generateAsync({ type: "blob" })
        .then((content) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = `${filename}-images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          toast({
            title: "Image Export Successful",
            description: `Downloaded ${successfulImages} image(s) as a ZIP file. Some external images might be replaced with placeholders due to loading issues.`,
          });
        })
        .catch((err) => {
          console.error("Error generating ZIP file:", err);
          toast({
            title: "ZIP Generation Failed",
            description: "Could not create the ZIP file. Check console.",
            variant: "destructive",
          });
        });
    } else if (slides && slides.length > 0) {
      toast({
        title: "Export Failed",
        description:
          "No images were successfully generated. Check console for errors, possibly related to external content.",
        variant: "destructive",
      });
    }
    setIsExportingImages(false);
  };

  const isLoading = isPrinting || isExportingImages;

  return (
    <div
      className={cn(
        "flex gap-4 md:gap-10 justify-between items-center",
        className
      )}
    >
      <div className="flex gap-4">
        <Link href="/" className="items-center space-x-2 flex">
          <Icons.logo />
          <span className="hidden font-bold md:inline-block">
            Carousel Generator
          </span>
        </Link>
        <EditorMenubar />
      </div>
      <div className="hidden lg:block">
        <Pager />
      </div>
      <div className="flex gap-2 items-center">
        <div className="hidden md:block">
          <FilenameForm />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={"icon"} disabled={isLoading}>
              {isLoading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <Download />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handlePrint}
              disabled={isPrinting || isExportingImages}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
              {isPrinting && (
                <Loader2Icon className="ml-auto h-4 w-4 animate-spin" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportAsImages}
              disabled={isExportingImages || isPrinting}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Export as Images (ZIP)
              {isExportingImages && (
                <Loader2Icon className="ml-auto h-4 w-4 animate-spin" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <StarOnGithub />
        <Link
          className="block lg:hidden"
          href={"https://github.com/FranciscoMoretti/carousel-generator"}
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={cn(
              buttonVariants({
                variant: "ghost",
              }),
              "w-9 px-0"
            )}
          >
            <Icons.gitHub className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </div>
        </Link>
        {/* // TODO: Re-enable your own keys system  */}
        {/* <BringYourKeysDialog
          triggerButton={
            <Button variant="ghost" size={"icon"}>
              <div className="flex flex-row gap-1 items-center">
                <Settings />
              </div>
            </Button>
          }
        /> */}
      </div>
    </div>
  );
}
