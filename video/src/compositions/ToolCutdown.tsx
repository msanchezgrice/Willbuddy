import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { LegalNote, Wordmark } from "../components/Brand";
import { Caption } from "../components/Caption";
import { FadeUp } from "../components/Motion";
import { ToolUI } from "../components/ToolUI";
import type { ToolVideo } from "../data/tools";
import { colors, fonts } from "../theme";

const Hook: React.FC<{ tool: ToolVideo }> = ({ tool }) => (
  <AbsoluteFill style={{ background: tool.accent, padding: "100px 70px 140px", color: colors.white }}>
    <Wordmark inverse compact />
    <div style={{ margin: "auto 0" }}>
      <FadeUp delay={5}>
        <div style={{ fontFamily: fonts.body, fontSize: 25, fontWeight: 800, letterSpacing: 3.2, textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>
          {tool.eyebrow}
        </div>
      </FadeUp>
      <FadeUp delay={12}>
        <div style={{ marginTop: 28, fontFamily: fonts.heading, fontSize: 78, lineHeight: 1.07, fontWeight: 700, letterSpacing: -2.4 }}>
          {tool.title}
        </div>
      </FadeUp>
    </div>
    <div style={{ position: "absolute", bottom: 62, left: 70 }}>
      <LegalNote inverse />
    </div>
  </AbsoluteFill>
);

const Demo: React.FC<{ tool: ToolVideo }> = ({ tool }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 480], [1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: colors.background, padding: "68px 58px 130px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark compact />
        <span style={{ borderRadius: 99, background: tool.secondary, color: colors.greenDark, padding: "11px 15px", fontFamily: fonts.body, fontSize: 16, fontWeight: 800 }}>
          Free tool
        </span>
      </div>
      <FadeUp delay={6}>
        <div style={{ marginTop: 52, fontFamily: fonts.heading, fontSize: 49, lineHeight: 1.12, fontWeight: 700, color: colors.text }}>
          {tool.promise}
        </div>
      </FadeUp>
      <div style={{ marginTop: 58, transform: `scale(${zoom})` }}>
        <ToolUI tool={tool} />
      </div>
      <Caption lines={tool.voiceover.slice(1, 3)} start={10} framesPerLine={210} dark />
    </AbsoluteFill>
  );
};

const Result: React.FC<{ tool: ToolVideo }> = ({ tool }) => (
  <AbsoluteFill style={{ background: colors.background, padding: "110px 68px 130px" }}>
    <FadeUp>
      <div style={{ fontFamily: fonts.body, fontSize: 24, letterSpacing: 3.2, textTransform: "uppercase", color: tool.accent, fontWeight: 800 }}>
        Result
      </div>
    </FadeUp>
    <div style={{ margin: "auto 0" }}>
      <FadeUp delay={10}>
        <div style={{ border: `2px solid ${colors.border}`, borderRadius: 34, padding: "48px 42px", background: colors.white, boxShadow: "0 30px 90px rgba(68,54,41,.15)" }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 58, lineHeight: 1.12, fontWeight: 700, color: colors.text }}>
            {tool.resultLabel}
          </div>
          <div style={{ marginTop: 25, fontFamily: fonts.body, fontSize: 31, lineHeight: 1.45, color: colors.body }}>
            {tool.resultDetail}
          </div>
          <div style={{ marginTop: 36, height: 8, width: 110, borderRadius: 99, background: tool.accent }} />
        </div>
      </FadeUp>
    </div>
    <Caption lines={[tool.voiceover[3]]} start={5} framesPerLine={150} dark />
  </AbsoluteFill>
);

const Cta: React.FC<{ tool: ToolVideo }> = ({ tool }) => (
  <AbsoluteFill style={{ background: tool.accent, color: colors.white, padding: "96px 70px 135px" }}>
    <Wordmark inverse compact />
    <div style={{ margin: "auto 0" }}>
      <FadeUp delay={6}>
        <div style={{ fontFamily: fonts.heading, fontSize: 72, lineHeight: 1.07, fontWeight: 700 }}>
          Try it free.
        </div>
      </FadeUp>
      <FadeUp delay={18}>
        <div style={{ marginTop: 34, borderRadius: 20, padding: "25px 27px", background: colors.white, color: colors.greenDark, fontFamily: fonts.body, fontSize: 26, lineHeight: 1.35, fontWeight: 800, overflowWrap: "anywhere" }}>
          {tool.url}
        </div>
      </FadeUp>
      <FadeUp delay={30}>
        <div style={{ marginTop: 28, fontFamily: fonts.body, fontSize: 24, color: "rgba(255,255,255,.82)" }}>
          No account or email required.
        </div>
      </FadeUp>
    </div>
    <div style={{ position: "absolute", bottom: 62, left: 70 }}>
      <LegalNote inverse />
    </div>
  </AbsoluteFill>
);

export const cutdownDuration = 900;

export const ToolCutdown: React.FC<{ tool: ToolVideo }> = ({ tool }) => (
  <AbsoluteFill>
    <Sequence durationInFrames={135}>
      <Hook tool={tool} />
    </Sequence>
    <Sequence from={135} durationInFrames={480}>
      <Demo tool={tool} />
    </Sequence>
    <Sequence from={615} durationInFrames={150}>
      <Result tool={tool} />
    </Sequence>
    <Sequence from={765} durationInFrames={135}>
      <Cta tool={tool} />
    </Sequence>
  </AbsoluteFill>
);
