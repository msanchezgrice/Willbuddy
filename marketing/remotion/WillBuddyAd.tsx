/**
 * WillBuddy — Remotion Video Ad
 * ------------------------------------------------------------
 * Style: typical demo/promo ad — animated text + UI motion.
 * Format: 1080 x 1920 (9:16), 30fps, ~24s (720 frames).
 * Theme: "Talk it out before you lawyer up."
 *
 * Brand tokens:
 *   bg        #FAF8F5   secondary #F0EBE4
 *   accent    #5B7A5E   text      #2D2A26
 *   Headings: Libre Baskerville (serif)   Body: system-ui
 *
 * Scenes (frames @30fps):
 *   0   - 90   S1  Hook: "You have little kids."
 *   90  - 210  S2  Problem: the $1,500 lawyer + big questions
 *   210 - 360  S3  Solution: talk it through by voice (chat UI)
 *   360 - 480  S4  Benefit: pause / come back / revisit
 *   480 - 600  S5  Payoff: $49 vs $1,500 comparison
 *   600 - 720  S6  CTA: logo + "Start for free · Texas families"
 *
 * Root registration example is at the bottom of this file.
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const COLORS = {
  bg: "#FAF8F5",
  secondary: "#F0EBE4",
  accent: "#5B7A5E",
  text: "#2D2A26",
  muted: "#7A756E",
};

const FONT_SERIF = "'Libre Baskerville', Georgia, serif";
const FONT_BODY =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ---------- Helpers ----------

const useFadeUp = (start: number, delay = 0, distance = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - start - delay,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.6 },
  });
  const opacity = interpolate(frame - start - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, transform: `translateY(${(1 - s) * distance}px)` };
};

const Bg: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.bg,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
      padding: 120,
      fontFamily: FONT_BODY,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ---------- Scene 1: Hook ----------

const SceneHook: React.FC = () => {
  const a = useFadeUp(0, 0);
  const b = useFadeUp(0, 18);
  return (
    <Bg>
      <div style={{ textAlign: "center", maxWidth: 820 }}>
        <div
          style={{
            ...a,
            fontFamily: FONT_SERIF,
            fontSize: 96,
            lineHeight: 1.1,
            color: COLORS.text,
            fontWeight: 700,
          }}
        >
          You have little kids.
        </div>
        <div
          style={{
            ...b,
            marginTop: 40,
            fontSize: 46,
            color: COLORS.muted,
          }}
        >
          You&apos;re busy. You keep meaning to make a plan.
        </div>
      </div>
    </Bg>
  );
};

// ---------- Scene 2: Problem ----------

const SceneProblem: React.FC = () => {
  const a = useFadeUp(0, 0);
  const b = useFadeUp(0, 20);
  const c = useFadeUp(0, 40);
  return (
    <Bg color={COLORS.secondary}>
      <div style={{ textAlign: "center", maxWidth: 860 }}>
        <div
          style={{
            ...a,
            fontFamily: FONT_SERIF,
            fontSize: 72,
            color: COLORS.text,
            lineHeight: 1.15,
          }}
        >
          But a lawyer starts at $1,500…
        </div>
        <div
          style={{ ...b, marginTop: 36, fontSize: 44, color: COLORS.muted }}
        >
          and half that meeting is them figuring out
        </div>
        <div
          style={{
            ...c,
            marginTop: 12,
            fontSize: 44,
            color: COLORS.accent,
            fontWeight: 600,
          }}
        >
          what you and your partner even want.
        </div>
      </div>
    </Bg>
  );
};

// ---------- Scene 3: Solution (voice chat UI) ----------

const ChatBubble: React.FC<{
  start: number;
  delay: number;
  side: "left" | "right";
  children: React.ReactNode;
}> = ({ start, delay, side, children }) => {
  const style = useFadeUp(start, delay, 24);
  const isRight = side === "right";
  return (
    <div
      style={{
        ...style,
        alignSelf: isRight ? "flex-end" : "flex-start",
        maxWidth: "78%",
        backgroundColor: isRight ? COLORS.accent : "#FFFFFF",
        color: isRight ? "#FFFFFF" : COLORS.text,
        fontSize: 40,
        lineHeight: 1.3,
        padding: "30px 38px",
        borderRadius: 32,
        borderBottomRightRadius: isRight ? 8 : 32,
        borderBottomLeftRadius: isRight ? 32 : 8,
        boxShadow: "0 8px 30px rgba(45,42,38,0.08)",
      }}
    >
      {children}
    </div>
  );
};

const SceneSolution: React.FC = () => {
  const title = useFadeUp(0, 0);
  return (
    <Bg>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div
          style={{
            ...title,
            fontFamily: FONT_SERIF,
            fontSize: 60,
            color: COLORS.text,
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          So talk it out first.
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <ChatBubble start={0} delay={30} side="left">
            Who would raise your kids if you both weren&apos;t here?
          </ChatBubble>
          <ChatBubble start={0} delay={70} side="right">
            …we&apos;ve never actually decided. My sister? Let&apos;s talk about it.
          </ChatBubble>
          <ChatBubble start={0} delay={110} side="left">
            Take your time. We can come back to it whenever you&apos;re ready.
          </ChatBubble>
        </div>
      </div>
    </Bg>
  );
};

// ---------- Scene 4: Benefit ----------

const Pill: React.FC<{ start: number; delay: number; label: string }> = ({
  start,
  delay,
  label,
}) => {
  const style = useFadeUp(start, delay, 20);
  return (
    <div
      style={{
        ...style,
        fontSize: 42,
        color: COLORS.text,
        backgroundColor: "#FFFFFF",
        border: `2px solid ${COLORS.accent}`,
        borderRadius: 999,
        padding: "22px 44px",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
};

const SceneBenefit: React.FC = () => {
  const title = useFadeUp(0, 0);
  return (
    <Bg color={COLORS.secondary}>
      <div style={{ textAlign: "center", maxWidth: 860 }}>
        <div
          style={{
            ...title,
            fontFamily: FONT_SERIF,
            fontSize: 68,
            color: COLORS.text,
            marginBottom: 60,
          }}
        >
          No forms. No pressure.
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
          }}
        >
          <Pill start={0} delay={20} label="Talk as long as you need" />
          <Pill start={0} delay={45} label="Pause & come back" />
          <Pill start={0} delay={70} label="Revisit any decision" />
          <Pill start={0} delay={95} label="Do it together or solo" />
        </div>
      </div>
    </Bg>
  );
};

// ---------- Scene 5: Price comparison ----------

const PriceCard: React.FC<{
  start: number;
  delay: number;
  amount: string;
  label: string;
  highlight?: boolean;
}> = ({ start, delay, amount, label, highlight }) => {
  const style = useFadeUp(start, delay, 30);
  return (
    <div
      style={{
        ...style,
        flex: 1,
        backgroundColor: highlight ? COLORS.accent : "#FFFFFF",
        color: highlight ? "#FFFFFF" : COLORS.text,
        borderRadius: 28,
        padding: "56px 32px",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(45,42,38,0.10)",
      }}
    >
      <div style={{ fontFamily: FONT_SERIF, fontSize: 96, fontWeight: 700 }}>
        {amount}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 34,
          color: highlight ? "rgba(255,255,255,0.9)" : COLORS.muted,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const ScenePrice: React.FC = () => {
  const title = useFadeUp(0, 0);
  return (
    <Bg>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div
          style={{
            ...title,
            fontFamily: FONT_SERIF,
            fontSize: 60,
            color: COLORS.text,
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          Then walk in ready.
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "stretch" }}>
          <PriceCard
            start={0}
            delay={20}
            amount="$1,500"
            label="Lawyer, starting from scratch"
          />
          <PriceCard
            start={0}
            delay={55}
            amount="$49"
            label="WillBuddy — thinking it through first"
            highlight
          />
        </div>
        <div
          style={{
            ...useFadeUp(0, 95),
            textAlign: "center",
            marginTop: 44,
            fontSize: 38,
            color: COLORS.muted,
          }}
        >
          Your lawyer&apos;s time goes to review — not discovery.
        </div>
      </div>
    </Bg>
  );
};

// ---------- Scene 6: CTA ----------

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = useFadeUp(0, 0);
  const sub = useFadeUp(0, 18);
  const btnScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  return (
    <Bg color={COLORS.accent}>
      <div style={{ textAlign: "center", maxWidth: 820 }}>
        <div
          style={{
            ...logo,
            fontFamily: FONT_SERIF,
            fontSize: 104,
            color: "#FFFFFF",
            fontWeight: 700,
          }}
        >
          WillBuddy
        </div>
        <div
          style={{
            ...sub,
            marginTop: 24,
            fontSize: 44,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          Estate planning you actually finish.
        </div>
        <div
          style={{
            transform: `scale(${interpolate(btnScale, [0, 1], [0.8, 1])})`,
            opacity: interpolate(frame - 40, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 70,
            display: "inline-block",
            backgroundColor: "#FFFFFF",
            color: COLORS.accent,
            fontSize: 48,
            fontWeight: 700,
            padding: "34px 72px",
            borderRadius: 20,
          }}
        >
          Start for free →
        </div>
        <div
          style={{
            ...useFadeUp(0, 70),
            marginTop: 48,
            fontSize: 36,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          $49 · Texas families · mywillbuddy.com
        </div>
      </div>
    </Bg>
  );
};

// ---------- Master composition ----------

export const WillBuddyAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence durationInFrames={90}>
        <SceneHook />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <SceneProblem />
      </Sequence>
      <Sequence from={210} durationInFrames={150}>
        <SceneSolution />
      </Sequence>
      <Sequence from={360} durationInFrames={120}>
        <SceneBenefit />
      </Sequence>
      <Sequence from={480} durationInFrames={120}>
        <ScenePrice />
      </Sequence>
      <Sequence from={600} durationInFrames={120}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * Register in src/Root.tsx:
 *
 * import { Composition } from "remotion";
 * import { WillBuddyAd } from "./WillBuddyAd";
 *
 * export const RemotionRoot = () => (
 *   <Composition
 *     id="WillBuddyAd"
 *     component={WillBuddyAd}
 *     durationInFrames={720}
 *     fps={30}
 *     width={1080}
 *     height={1920}
 *   />
 * );
 *
 * Load Libre Baskerville via @remotion/google-fonts/LibreBaskerville
 * or a <link> in the public index. Render:
 *   npx remotion render WillBuddyAd out/willbuddy-ad.mp4
 *
 * For a 1:1 (1080x1080) or 16:9 cut, change width/height in the
 * Composition and the max-width values scale acceptably.
 */

export default WillBuddyAd;
