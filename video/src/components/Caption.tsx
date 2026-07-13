import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

export const Caption: React.FC<{
  lines: string[];
  start?: number;
  framesPerLine?: number;
  dark?: boolean;
}> = ({ lines, start = 0, framesPerLine = 72, dark = false }) => {
  const frame = useCurrentFrame();
  const index = Math.min(
    lines.length - 1,
    Math.max(0, Math.floor((frame - start) / framesPerLine)),
  );
  if (frame < start || lines.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 42,
        maxWidth: "86%",
        borderRadius: 14,
        padding: "13px 22px",
        background: dark ? "rgba(45,42,38,.92)" : "rgba(255,255,255,.94)",
        color: dark ? colors.white : colors.text,
        fontFamily: fonts.body,
        fontSize: 22,
        lineHeight: 1.3,
        fontWeight: 700,
        textAlign: "center",
        boxShadow: "0 10px 35px rgba(45,42,38,.16)",
      }}
    >
      {lines[index]}
    </div>
  );
};
