import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DocType } from "@/types";
import { DOC_TYPE_LABELS, DOC_TYPE_DOWNLOAD_ORDER } from "@/types";
import { parseDocumentBody, type PdfBlock } from "./pdf-parse";
import { registerPdfFonts, PDF_FONT } from "./fonts";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: 72,
    fontSize: 11,
    lineHeight: 1.55,
    color: "#2D2A26",
    fontFamily: PDF_FONT.body,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid #E8E0D6",
  },
  brand: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: "#5B7A5E",
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 17,
    fontFamily: PDF_FONT.heading,
    fontWeight: "bold",
    color: "#2D2A26",
    marginBottom: 8,
  },
  draftBannerText: {
    fontSize: 8.5,
    color: "#6B5A3E",
    lineHeight: 1.45,
    fontFamily: "Helvetica",
    backgroundColor: "#F5F0E8",
    borderLeft: "3px solid #C4A35A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  content: {
    flexGrow: 1,
  },
  docTitle: {
    fontSize: 14,
    fontFamily: PDF_FONT.heading,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: 12,
    fontFamily: PDF_FONT.heading,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#2D2A26",
  },
  subheading: {
    fontSize: 11,
    fontFamily: PDF_FONT.heading,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#3D3832",
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  listItem: {
    marginBottom: 4,
    paddingLeft: 14,
  },
  listBullet: {
    fontFamily: PDF_FONT.body,
    fontWeight: "bold",
  },
  signatureBlock: {
    marginTop: 10,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 4,
    color: "#3D3832",
  },
  signatureLine: {
    borderBottom: "1px solid #2D2A26",
    height: 22,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 72,
    right: 72,
    fontSize: 8,
    color: "#9B8E7E",
    textAlign: "center",
    borderTop: "1px solid #E8E0D6",
    paddingTop: 6,
    fontFamily: "Helvetica",
  },
});

const DRAFT_NOTICE =
  "DRAFT — for review by a licensed Texas attorney. WillBuddy is not a law firm and does not provide legal advice. Not valid until reviewed, finalized, and properly executed.";

function renderBlock(block: PdfBlock, index: number) {
  switch (block.type) {
    case "docTitle":
      return (
        <Text key={index} style={styles.docTitle}>
          {block.text}
        </Text>
      );
    case "heading":
      return (
        <Text key={index} style={styles.heading}>
          {block.text}
        </Text>
      );
    case "subheading":
      return (
        <Text key={index} style={styles.subheading}>
          {block.text}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={index} style={styles.paragraph}>
          {block.text}
        </Text>
      );
    case "listItem":
      return (
        <Text key={index} style={styles.listItem}>
          <Text style={styles.listBullet}>• </Text>
          {block.text}
        </Text>
      );
    case "signature":
      return (
        <View key={index} style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>{block.label}</Text>
          <View style={styles.signatureLine} />
        </View>
      );
    default:
      return null;
  }
}

function DocumentPages({ title, body }: { title: string; body: string }) {
  const blocks = parseDocumentBody(body);

  return (
    <Page size="LETTER" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <Text style={styles.brand}>WillBuddy · Texas Estate Plan</Text>
        <Text style={styles.title}>{title}</Text>
        <Text
          style={styles.draftBannerText}
          render={({ pageNumber }) => (pageNumber === 1 ? DRAFT_NOTICE : "")}
        />
      </View>

      <View style={styles.content}>{blocks.map(renderBlock)}</View>

      <Text
        style={styles.footer}
        fixed
        render={({ pageNumber, totalPages }) =>
          `${title} — WillBuddy draft — page ${pageNumber} of ${totalPages}`
        }
      />
    </Page>
  );
}

function buildDocument(
  documents: Record<DocType, string>,
  docTypes: DocType[],
  documentTitle: string
) {
  return (
    <Document title={documentTitle} author="WillBuddy">
      {docTypes.map((docType) => (
        <DocumentPages
          key={docType}
          title={DOC_TYPE_LABELS[docType]}
          body={documents[docType] ?? ""}
        />
      ))}
    </Document>
  );
}

/** Render a single document type as its own PDF. */
export async function renderDocumentPdf(
  docType: DocType,
  body: string
): Promise<Buffer> {
  registerPdfFonts();
  const doc = buildDocument({ [docType]: body } as Record<DocType, string>, [
    docType,
  ], DOC_TYPE_LABELS[docType]);
  return renderToBuffer(doc);
}

/** Render all estate-plan documents into one combined PDF. */
export async function renderEstatePlanPdf(
  documents: Record<DocType, string>
): Promise<Buffer> {
  registerPdfFonts();
  const doc = buildDocument(
    documents,
    DOC_TYPE_DOWNLOAD_ORDER,
    "WillBuddy Estate Plan (Draft)"
  );
  return renderToBuffer(doc);
}
