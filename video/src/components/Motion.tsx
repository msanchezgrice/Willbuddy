import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 32, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.9 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const DrawProgress: React.FC<{
  delay?: number;
  duration?: number;
  color: string;
}> = ({ delay = 0, duration = 45, color }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [delay, delay + duration], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ height: 8, borderRadius: 99, background: "#E8E0D6", overflow: "hidden" }}>
      <div style={{ width: `${width}%`, height: "100%", background: color }} />
    </div>
  );
};
