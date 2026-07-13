import React from "react";
import { Composition } from "remotion";
import { SuiteOverview, suiteDuration } from "./compositions/SuiteOverview";
import { Thumbnail } from "./compositions/Thumbnail";
import { ToolCutdown, cutdownDuration } from "./compositions/ToolCutdown";
import { tools } from "./data/tools";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SuiteOverview"
      component={SuiteOverview}
      durationInFrames={suiteDuration}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {tools.map((tool) => (
      <Composition
        key={tool.slug}
        id={`Tool-${tool.slug}`}
        component={ToolCutdown}
        defaultProps={{ tool }}
        durationInFrames={cutdownDuration}
        fps={FPS}
        width={1080}
        height={1920}
      />
    ))}
    <Composition
      id="Thumbnail-WillVsTrust"
      component={Thumbnail}
      defaultProps={{
        title: "Will vs. Trust in Texas",
        kicker: "Start with the right questions",
        badge: "Texas guide",
      }}
      durationInFrames={1}
      fps={FPS}
      width={1280}
      height={720}
    />
    <Composition
      id="Thumbnail-TexasCosts"
      component={Thumbnail}
      defaultProps={{
        title: "What Does Estate Planning Cost?",
        kicker: "Texas ranges explained",
        badge: "No fake precision",
        accent: "#B07A53",
      }}
      durationInFrames={1}
      fps={FPS}
      width={1280}
      height={720}
    />
  </>
);
