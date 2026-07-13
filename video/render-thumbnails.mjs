import { spawnSync } from "node:child_process";

const thumbnails = [
  ["Thumbnail-WillVsTrust", "output/thumbnail-will-vs-trust.png"],
  ["Thumbnail-TexasCosts", "output/thumbnail-texas-estate-planning-cost.png"],
];

for (const [composition, output] of thumbnails) {
  const result = spawnSync(
    "npx",
    ["remotion", "still", "src/index.ts", composition, output],
    { stdio: "inherit" },
  );

  if (result.status !== 0) process.exit(result.status ?? 1);
}
