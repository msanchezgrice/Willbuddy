import JSZip from "jszip";
import type { DocType } from "@/types";
import { DOC_TYPE_DOWNLOAD_ORDER, DOC_TYPE_FILENAMES } from "@/types";
import { renderDocumentPdf } from "./pdf";

/** Render each document as its own PDF and return a ZIP archive. */
export async function renderEstatePlanZip(
  documents: Record<DocType, string>
): Promise<Buffer> {
  const zip = new JSZip();

  await Promise.all(
    DOC_TYPE_DOWNLOAD_ORDER.map(async (docType) => {
      const pdf = await renderDocumentPdf(docType, documents[docType]);
      zip.file(DOC_TYPE_FILENAMES[docType], pdf);
    })
  );

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
