import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DocType } from "@/types";
import { DOC_TYPE_LABELS } from "@/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: "#2D2A26",
    fontFamily: "Helvetica",
  },
  brand: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#9B8E7E",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: "#2D2A26",
    marginBottom: 4,
  },
  draftBanner: {
    fontSize: 8.5,
    color: "#8a6d3b",
    backgroundColor: "#fcf3e3",
    padding: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  line: { marginBottom: 2 },
  blankLine: { marginBottom: 6 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 7.5,
    color: "#9B8E7E",
    textAlign: "center",
    borderTop: "1px solid #E8E0D6",
    paddingTop: 8,
  },
});

const DRAFT_NOTICE =
  "DRAFT — for review by a licensed Texas attorney. WillBuddy is not a law firm and does not provide legal advice. This document is not valid until reviewed, finalized, and properly executed.";

function DocumentSection({ title, body }: { title: string; body: string }) {
  const lines = body.split("\n");
  return (
    <Page size="LETTER" style={styles.page} wrap>
      <Text style={styles.brand}>WillBuddy · Texas Estate Plan</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.draftBanner}>{DRAFT_NOTICE}</Text>
      <View>
        {lines.map((line, i) => (
          <Text key={i} style={line.trim() === "" ? styles.blankLine : styles.line}>
            {line === "" ? " " : line}
          </Text>
        ))}
      </View>
      <Text
        style={styles.footer}
        fixed
        render={({ pageNumber, totalPages }) =>
          `WillBuddy draft — page ${pageNumber} of ${totalPages}`
        }
      />
    </Page>
  );
}

/**
 * Render all estate-plan documents into a single combined PDF buffer,
 * one document per page group. Server-side only.
 */
export async function renderEstatePlanPdf(
  documents: Record<DocType, string>
): Promise<Buffer> {
  const order: DocType[] = [
    "will",
    "guardianship",
    "medical_poa",
    "durable_poa",
    "hipaa",
  ];

  const doc = (
    <Document title="WillBuddy Estate Plan (Draft)" author="WillBuddy">
      {order.map((docType) => (
        <DocumentSection
          key={docType}
          title={DOC_TYPE_LABELS[docType]}
          body={documents[docType] ?? ""}
        />
      ))}
    </Document>
  );

  return renderToBuffer(doc);
}
