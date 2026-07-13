import React from "react";
import { AbsoluteFill } from "remotion";
import { Wordmark } from "../components/Brand";
import { colors, fonts } from "../theme";

export const Thumbnail: React.FC<{
  title: string;
  kicker: string;
  badge: string;
  accent?: string;
}> = ({ title, kicker, badge, accent = colors.green }) => (
  <AbsoluteFill style={{ background: colors.background, padding: "64px 74px", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -90, top: -120, width: 660, height: 660, borderRadius: 999, background: `radial-gradient(circle, ${accent}55, ${accent}00 68%)` }} />
    <Wordmark compact />
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 40, alignItems: "center", height: "100%" }}>
      <div>
        <div style={{ fontFamily: fonts.body, color: accent, fontSize: 27, fontWeight: 900, letterSpacing: 2.8, textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ marginTop: 22, fontFamily: fonts.heading, color: colors.text, fontSize: 70, lineHeight: 1.04, fontWeight: 700, letterSpacing: -2.2 }}>
          {title}
        </div>
      </div>
      <div style={{ position: "relative", height: 420 }}>
        <div style={{ position: "absolute", inset: 38, borderRadius: 36, background: accent, transform: "rotate(5deg)", opacity: .18 }} />
        <div style={{ position: "absolute", inset: 16, borderRadius: 36, border: `3px solid ${colors.border}`, background: colors.white, boxShadow: "0 30px 90px rgba(68,54,41,.18)", display: "grid", placeItems: "center", textAlign: "center", padding: 36 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, color: accent, fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2 }}>{badge}</div>
            <div style={{ marginTop: 28, display: "grid", gap: 15 }}>
              {["Your facts", "The tradeoffs", "Your next question"].map((item, index) => (
                <div key={item} style={{ border: `2px solid ${index === 1 ? accent : colors.border}`, background: index === 1 ? `${accent}15` : colors.white, borderRadius: 14, padding: "15px 18px", fontFamily: fonts.body, color: colors.text, fontSize: 19, fontWeight: 800 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
