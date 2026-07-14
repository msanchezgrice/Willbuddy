import React from 'react';
import {Composition} from 'remotion';
import {ToolsHookAd} from './ToolsHookAd';

const FPS = 30;
const DURATION = 15 * FPS; // 15s

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ToolsHook-Vertical"
        component={ToolsHookAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToolsHook-Square"
        component={ToolsHookAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
