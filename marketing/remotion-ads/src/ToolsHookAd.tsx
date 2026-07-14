import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// WillBuddy design tokens (CLAUDE.md)
const C = {
  bg: '#FAF8F5',
  secondary: '#F0EBE4',
  accent: '#5B7A5E',
  text: '#2D2A26',
};
const SERIF = "'Libre Baskerville', Georgia, 'Times New Roman', serif";
const SANS =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const FadeUp: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Headline: React.FC<{children: React.ReactNode; size: number}> = ({
  children,
  size,
}) => (
  <div
    style={{
      fontFamily: SERIF,
      fontSize: size,
      lineHeight: 1.25,
      color: C.text,
      textAlign: 'center',
      fontWeight: 700,
    }}
  >
    {children}
  </div>
);

// Scene 2: intestacy flowchart that draws itself
const Flowchart: React.FC<{w: number}> = ({w}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const node = (i: number) =>
    spring({frame: frame - i * 6, fps, config: {damping: 200}});
  const labels = ['Your estate', 'Spouse', 'Kids', 'Separate property', 'Community property'];
  const positions = [
    {x: 0.5, y: 0.12},
    {x: 0.25, y: 0.5},
    {x: 0.75, y: 0.5},
    {x: 0.25, y: 0.88},
    {x: 0.75, y: 0.88},
  ];
  const edges: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ];
  const h = w * 0.7;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {edges.map(([a, b], i) => {
        const p = node(i + 1);
        const x1 = positions[a].x * w;
        const y1 = positions[a].y * h;
        const x2 = x1 + (positions[b].x * w - x1) * p;
        const y2 = y1 + (positions[b].y * h - y1) * p;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={C.accent}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}
      {positions.map((p, i) => {
        const s = node(i);
        const rx = w * 0.17;
        const ry = w * 0.055;
        return (
          <g key={i} transform={`translate(${p.x * w}, ${p.y * h}) scale(${s})`}>
            <rect
              x={-rx}
              y={-ry}
              width={rx * 2}
              height={ry * 2}
              rx={ry}
              fill={i === 0 ? C.accent : '#fff'}
              stroke={C.accent}
              strokeWidth={3}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={SANS}
              fontSize={w * 0.036}
              fontWeight={600}
              fill={i === 0 ? '#fff' : C.text}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const TOOLS = [
  {name: 'Intestacy Visualizer', line: 'See who inherits — in 2 minutes'},
  {name: 'Cost Calculator', line: 'Real numbers, editable assumptions'},
  {name: 'Readiness Checklist', line: 'Your personal gap list, private'},
];

const ToolCards: React.FC<{w: number}> = ({w}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: w * 0.025, width: w * 0.82}}>
      {TOOLS.map((t, i) => {
        const s = spring({frame: frame - i * 10, fps, config: {damping: 200}});
        return (
          <div
            key={t.name}
            style={{
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px)`,
              background: '#fff',
              border: `2px solid ${C.secondary}`,
              borderRadius: 16,
              padding: w * 0.035,
              display: 'flex',
              alignItems: 'center',
              gap: w * 0.03,
              boxShadow: '0 6px 24px rgba(45,42,38,0.06)',
            }}
          >
            <div
              style={{
                width: w * 0.06,
                height: w * 0.06,
                borderRadius: '50%',
                background: C.accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontSize: w * 0.032,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{fontFamily: SERIF, fontSize: w * 0.042, fontWeight: 700, color: C.text}}>
                {t.name}
              </div>
              <div style={{fontFamily: SANS, fontSize: w * 0.03, color: C.text, opacity: 0.75}}>
                {t.line}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8%',
      flexDirection: 'column',
    }}
  >
    {children}
  </AbsoluteFill>
);

export const ToolsHookAd: React.FC = () => {
  const {width, fps, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();
  const w = width;
  const big = w * 0.085;
  const fadeOut = (end: number) =>
    interpolate(frame, [end - 8, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          width: '100%',
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: w * 0.035,
          fontWeight: 700,
          color: C.accent,
          letterSpacing: 1,
          zIndex: 10,
        }}
      >
        WillBuddy
      </div>

      {/* S1 0–2.5s */}
      <Sequence durationInFrames={75}>
        <Center>
          <div style={{opacity: fadeOut(75)}}>
            <FadeUp>
              <Headline size={big}>Texas has a plan for your family.</Headline>
            </FadeUp>
          </div>
        </Center>
      </Sequence>

      {/* S2 2.5–5.5s */}
      <Sequence from={75} durationInFrames={90}>
        <Center>
          <div style={{opacity: fadeOut(165), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: w * 0.04}}>
            <FadeUp>
              <Headline size={big * 0.85}>
                It&rsquo;s just probably not <span style={{color: C.accent, fontStyle: 'italic'}}>your</span> plan.
              </Headline>
            </FadeUp>
            <Flowchart w={w * 0.75} />
          </div>
        </Center>
      </Sequence>

      {/* S3 5.5–10s */}
      <Sequence from={165} durationInFrames={135}>
        <Center>
          <div style={{opacity: fadeOut(300), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: w * 0.045}}>
            <FadeUp>
              <Headline size={big * 0.75}>Get your answers first.</Headline>
            </FadeUp>
            <ToolCards w={w} />
          </div>
        </Center>
      </Sequence>

      {/* S4 10–12.5s */}
      <Sequence from={300} durationInFrames={75}>
        <Center>
          <div style={{opacity: fadeOut(375)}}>
            <FadeUp>
              <Headline size={big}>
                Free. No signup.{' '}
                <span style={{color: C.accent}}>Source-linked.</span>
              </Headline>
            </FadeUp>
          </div>
        </Center>
      </Sequence>

      {/* S5 12.5–15s CTA */}
      <Sequence from={375} durationInFrames={durationInFrames - 375}>
        <Center>
          <FadeUp>
            <div
              style={{
                background: '#fff',
                border: `2px solid ${C.secondary}`,
                borderRadius: 24,
                padding: w * 0.06,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: w * 0.03,
                boxShadow: '0 10px 40px rgba(45,42,38,0.08)',
              }}
            >
              <Headline size={big * 0.7}>mywillbuddy.com/tools</Headline>
              <div
                style={{
                  background: C.accent,
                  color: '#fff',
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: w * 0.04,
                  padding: `${w * 0.02}px ${w * 0.05}px`,
                  borderRadius: 999,
                  transform: `scale(${1 + 0.03 * Math.sin((frame - 375) / (fps / 6))})`,
                }}
              >
                Try the free tools
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: w * 0.02,
                  color: C.text,
                  opacity: 0.6,
                  textAlign: 'center',
                  maxWidth: w * 0.6,
                }}
              >
                Not a law firm. Draft documents for review by a licensed
                attorney. Texas residents.
              </div>
            </div>
          </FadeUp>
        </Center>
      </Sequence>
    </AbsoluteFill>
  );
};
