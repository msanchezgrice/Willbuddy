import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

const FONT_DIR = path.join(process.cwd(), "src/lib/documents/fonts");

/** Register brand fonts for @react-pdf/renderer (server-side only). */
export function registerPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: "Libre Baskerville",
    fonts: [
      {
        src: path.join(FONT_DIR, "LibreBaskerville-Regular.ttf"),
        fontWeight: "normal",
      },
      {
        src: path.join(FONT_DIR, "LibreBaskerville-Bold.ttf"),
        fontWeight: "bold",
      },
    ],
  });

  registered = true;
}

export const PDF_FONT = {
  heading: "Libre Baskerville",
  body: "Helvetica",
} as const;
