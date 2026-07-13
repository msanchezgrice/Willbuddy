import React from "react";
import { colors, fonts } from "../theme";

export const Wordmark: React.FC<{ inverse?: boolean; compact?: boolean }> = ({
  inverse = false,
  compact = false,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: compact ? 12 : 18,
      color: inverse ? colors.white : colors.text,
    }}
  >
    <div
      style={{
        width: compact ? 34 : 46,
        height: compact ? 34 : 46,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: inverse ? colors.white : colors.green,
        color: inverse ? colors.green : colors.white,
        fontFamily: fonts.heading,
        fontWeight: 700,
        fontSize: compact ? 18 : 24,
      }}
    >
      W
    </div>
    <span
      style={{
        fontFamily: fonts.heading,
        fontSize: compact ? 23 : 32,
        fontWeight: 700,
        letterSpacing: -0.6,
      }}
    >
      WillBuddy
    </span>
  </div>
);

export const LegalNote: React.FC<{ inverse?: boolean }> = ({ inverse = false }) => (
  <div
    style={{
      fontFamily: fonts.body,
      fontSize: 18,
      lineHeight: 1.35,
      color: inverse ? "rgba(255,255,255,.78)" : colors.muted,
    }}
  >
    Educational only · Not legal advice · WillBuddy is not a law firm
  </div>
);
