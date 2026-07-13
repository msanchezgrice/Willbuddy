import { spawnSync } from "node:child_process";

const tools = ["readiness", "will-trust", "intestacy", "cost", "poa"];

for (const tool of tools) {
  const output = `output/willbuddy-${tool}-short.mp4`;
  const result = spawnSync(
    "npx",
    [
      "remotion",
      "render",
      "src/index.ts",
      `Tool-${tool}`,
      output,
      "--codec",
      "h264",
      "--crf",
      "18",
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) process.exit(result.status ?? 1);
}
