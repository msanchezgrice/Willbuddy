import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ToolVideo } from "../data/tools";
import { colors, fonts } from "../theme";
import { DrawProgress, FadeUp } from "./Motion";

const cardShadow = "0 26px 90px rgba(68,54,41,.16)";

const Choice: React.FC<{
  label: string;
  selected: boolean;
  accent: string;
  delay: number;
}> = ({ label, selected, accent, delay }) => (
  <FadeUp delay={delay} distance={16}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        border: `2px solid ${selected ? accent : colors.border}`,
        background: selected ? `${accent}17` : colors.white,
        borderRadius: 18,
        padding: "18px 20px",
        fontFamily: fonts.body,
        fontSize: 22,
        fontWeight: 650,
        color: colors.text,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 99,
          border: `2px solid ${selected ? accent : colors.muted}`,
          boxShadow: selected ? `inset 0 0 0 5px ${colors.white}` : undefined,
          background: selected ? accent : colors.white,
        }}
      />
      {label}
    </div>
  </FadeUp>
);

const QuizPanel: React.FC<{ tool: ToolVideo }> = ({ tool }) => {
  const frame = useCurrentFrame();
  const selected = frame >= 62;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: fonts.mono,
          fontSize: 15,
          textTransform: "uppercase",
          letterSpacing: 1.8,
          color: colors.muted,
          marginBottom: 14,
        }}
      >
        <span>Question 1 of 5</span>
        <span>20%</span>
      </div>
      <DrawProgress color={tool.accent} delay={12} duration={42} />
      <FadeUp delay={14}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 32,
            lineHeight: 1.25,
            fontWeight: 700,
            color: colors.text,
            marginTop: 34,
            marginBottom: 28,
          }}
        >
          {tool.question}
        </div>
      </FadeUp>
      <div style={{ display: "grid", gap: 14 }}>
        {tool.choices.map((choice, index) => (
          <Choice
            key={choice}
            label={choice}
            selected={selected && index === 0}
            accent={tool.accent}
            delay={25 + index * 7}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 28,
          padding: "16px 26px",
          borderRadius: 999,
          background: selected ? tool.accent : colors.border,
          color: selected ? colors.white : colors.muted,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 19,
          textAlign: "center",
          transition: "none",
        }}
      >
        Continue →
      </div>
    </div>
  );
};

const MapPanel: React.FC<{ tool: ToolVideo }> = ({ tool }) => {
  const frame = useCurrentFrame();
  const spouse = interpolate(frame, [35, 75], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div>
      <FadeUp delay={8}>
        <div style={{ fontFamily: fonts.heading, fontSize: 31, fontWeight: 700, color: colors.text }}>
          Community property
        </div>
        <div style={{ marginTop: 8, fontFamily: fonts.body, color: colors.muted, fontSize: 17 }}>
          The decedent&apos;s community interest
        </div>
      </FadeUp>
      <div style={{ height: 24, background: colors.surface, borderRadius: 99, overflow: "hidden", marginTop: 38 }}>
        <div style={{ width: `${spouse}%`, height: "100%", background: tool.accent, borderRadius: 99 }} />
      </div>
      <FadeUp delay={45}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr auto",
            gap: 14,
            alignItems: "center",
            marginTop: 34,
            padding: "22px 0",
            borderBottom: `1px solid ${colors.border}`,
            fontFamily: fonts.body,
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: 99, background: tool.accent }} />
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: colors.text }}>Surviving spouse</div>
            <div style={{ fontSize: 16, color: colors.muted, marginTop: 4 }}>Selected family branch</div>
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 25, fontWeight: 800, color: colors.greenDark }}>100%</div>
        </div>
      </FadeUp>
      <FadeUp delay={60}>
        <div style={{ marginTop: 22, borderRadius: 16, padding: 20, background: "#FFF6EE", color: colors.body, fontFamily: fonts.body, fontSize: 16, lineHeight: 1.45 }}>
          Property title and the full family tree can change the analysis.
        </div>
      </FadeUp>
    </div>
  );
};

const CalculatorPanel: React.FC = () => (
  <div>
    <FadeUp delay={8}>
      <div style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.text, fontSize: 18 }}>
        Estate value used only for the illustration
      </div>
      <div
        style={{
          marginTop: 12,
          border: `2px solid ${colors.border}`,
          borderRadius: 15,
          background: colors.white,
          padding: "17px 19px",
          fontFamily: fonts.mono,
          color: colors.text,
          fontSize: 24,
        }}
      >
        $ 500,000
      </div>
    </FadeUp>
    {[
      ["Will preparation", "$800–$2,500", colors.green],
      ["Trust preparation + funding", "$3,000–$9,000", colors.clay],
      ["Will + probate path", "$8,300–$32,500", colors.muted],
    ].map(([label, range, accent], index) => (
      <FadeUp key={label} delay={28 + index * 12}>
        <div
          style={{
            marginTop: 14,
            borderLeft: `6px solid ${accent}`,
            background: colors.white,
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            fontFamily: fonts.body,
            boxShadow: "0 4px 20px rgba(68,54,41,.06)",
          }}
        >
          <span style={{ fontSize: 17, color: colors.text, fontWeight: 700 }}>{label}</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 18, color: colors.greenDark, fontWeight: 800 }}>{range}</span>
        </div>
      </FadeUp>
    ))}
  </div>
);

export const ToolUI: React.FC<{
  tool: ToolVideo;
  compact?: boolean;
}> = ({ tool, compact = false }) => (
  <div
    style={{
      background: colors.white,
      border: `2px solid ${colors.border}`,
      borderRadius: compact ? 28 : 36,
      boxShadow: cardShadow,
      overflow: "hidden",
      width: "100%",
    }}
  >
    <div
      style={{
        height: compact ? 46 : 58,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "0 22px",
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {["#C98270", "#D7AD60", "#7FA27F"].map((color) => (
        <span key={color} style={{ width: 12, height: 12, borderRadius: 99, background: color }} />
      ))}
      <span
        style={{
          marginLeft: 12,
          fontFamily: fonts.body,
          fontSize: compact ? 13 : 15,
          color: colors.muted,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tool.url}
      </span>
    </div>
    <div style={{ padding: compact ? 32 : 44 }}>
      {tool.ui === "quiz" && <QuizPanel tool={tool} />}
      {tool.ui === "map" && <MapPanel tool={tool} />}
      {tool.ui === "calculator" && <CalculatorPanel />}
    </div>
  </div>
);
