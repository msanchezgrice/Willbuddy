import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { LegalNote, Wordmark } from "../components/Brand";
import { Caption } from "../components/Caption";
import { FadeUp } from "../components/Motion";
import { ToolUI } from "../components/ToolUI";
import { tools, type ToolVideo } from "../data/tools";
import { colors, fonts } from "../theme";

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 240], [0, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: colors.background, padding: "84px 104px", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: 999,
          right: -160 + drift,
          top: -280 + drift,
          background: "radial-gradient(circle, rgba(91,122,94,.24), rgba(91,122,94,0) 68%)",
        }}
      />
      <FadeUp>
        <Wordmark />
      </FadeUp>
      <div style={{ marginTop: 180, maxWidth: 1250 }}>
        <FadeUp delay={15}>
          <div style={{ fontFamily: fonts.body, color: colors.green, fontSize: 24, fontWeight: 800, letterSpacing: 3.8, textTransform: "uppercase" }}>
            Five free Texas planning tools
          </div>
        </FadeUp>
        <FadeUp delay={26}>
          <div style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 86, lineHeight: 1.06, fontWeight: 700, letterSpacing: -3, marginTop: 24 }}>
            One useful answer can get your estate plan moving.
          </div>
        </FadeUp>
        <FadeUp delay={45}>
          <div style={{ fontFamily: fonts.body, color: colors.body, fontSize: 31, lineHeight: 1.45, marginTop: 28 }}>
            No account. No email gate. No fake certainty.
          </div>
        </FadeUp>
      </div>
      <div style={{ position: "absolute", left: 104, bottom: 58 }}>
        <LegalNote />
      </div>
    </AbsoluteFill>
  );
};

const ToolScene: React.FC<{ tool: ToolVideo; number: number }> = ({ tool, number }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 320], [1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: colors.background, padding: "66px 80px 94px", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.83fr 1.17fr", gap: 72, height: "100%", alignItems: "center" }}>
        <div>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 19, color: tool.accent, fontWeight: 800 }}>0{number}</span>
              <span style={{ width: 64, height: 2, background: tool.accent }} />
              <span style={{ fontFamily: fonts.body, fontSize: 18, letterSpacing: 2.4, textTransform: "uppercase", color: colors.muted, fontWeight: 800 }}>
                {tool.eyebrow}
              </span>
            </div>
          </FadeUp>
          <FadeUp delay={12}>
            <div style={{ marginTop: 32, fontFamily: fonts.heading, fontSize: 58, lineHeight: 1.1, letterSpacing: -1.6, fontWeight: 700, color: colors.text }}>
              {tool.title}
            </div>
          </FadeUp>
          <FadeUp delay={24}>
            <div style={{ marginTop: 26, fontFamily: fonts.body, fontSize: 26, lineHeight: 1.46, color: colors.body }}>
              {tool.promise}
            </div>
          </FadeUp>
          <FadeUp delay={42}>
            <div style={{ marginTop: 34, display: "inline-flex", padding: "15px 22px", borderRadius: 99, background: tool.accent, color: colors.white, fontFamily: fonts.body, fontSize: 18, fontWeight: 800 }}>
              Free · no account required
            </div>
          </FadeUp>
        </div>
        <div style={{ transform: `scale(${scale})` }}>
          <ToolUI tool={tool} compact />
        </div>
      </div>
      <Caption lines={tool.voiceover} start={8} framesPerLine={76} dark />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => (
  <AbsoluteFill style={{ background: colors.green, color: colors.white, padding: "86px 104px" }}>
    <FadeUp>
      <Wordmark inverse />
    </FadeUp>
    <div style={{ margin: "auto 0", maxWidth: 1380 }}>
      <FadeUp delay={12}>
        <div style={{ fontFamily: fonts.heading, fontSize: 82, lineHeight: 1.08, fontWeight: 700, letterSpacing: -2.4 }}>
          Start with the question that matters to you.
        </div>
      </FadeUp>
      <FadeUp delay={26}>
        <div style={{ marginTop: 34, fontFamily: fonts.body, fontSize: 35, lineHeight: 1.4, color: "rgba(255,255,255,.88)" }}>
          mywillbuddy.com/tools
        </div>
      </FadeUp>
      <FadeUp delay={42}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 40 }}>
          {tools.map((tool) => (
            <span key={tool.slug} style={{ border: "1px solid rgba(255,255,255,.42)", borderRadius: 99, padding: "12px 18px", fontFamily: fonts.body, fontSize: 18 }}>
              {tool.shortTitle}
            </span>
          ))}
        </div>
      </FadeUp>
    </div>
    <div style={{ position: "absolute", left: 104, bottom: 58 }}>
      <LegalNote inverse />
    </div>
  </AbsoluteFill>
);

const introFrames = 240;
const toolFrames = 330;
const endFrames = 360;

export const suiteDuration = introFrames + tools.length * toolFrames + endFrames;

export const SuiteOverview: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={introFrames}>
      <Intro />
    </Sequence>
    {tools.map((tool, index) => (
      <Sequence key={tool.slug} from={introFrames + index * toolFrames} durationInFrames={toolFrames}>
        <ToolScene tool={tool} number={index + 1} />
      </Sequence>
    ))}
    <Sequence from={introFrames + tools.length * toolFrames} durationInFrames={endFrames}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
