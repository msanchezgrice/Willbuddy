import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "WillBuddy voice-first estate planning for Texas families";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF8F5",
          color: "#2D2A26",
          padding: "72px",
          border: "24px solid #5B7A5E",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#5B7A5E",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: 38,
              maxWidth: 860,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: 0,
            }}
          >
            Voice-first estate planning for Texas families
          </div>
        </div>
        <div
          style={{
            maxWidth: 840,
            color: "#5B4F3E",
            fontFamily: "Arial, sans-serif",
            fontSize: 34,
            lineHeight: 1.25,
          }}
        >
          Talk through guardianship, wills, healthcare wishes, and powers of
          attorney before attorney review.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
