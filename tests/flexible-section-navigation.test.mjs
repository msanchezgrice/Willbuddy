import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('voice and guided modes expose non-destructive section navigation', async () => {
  const [guided, sectionNav, provider] = await Promise.all([
    read('src/components/session/GuidedPlanFlow.tsx'),
    read('src/components/session/SectionNav.tsx'),
    read('src/components/voice/VoiceProvider.tsx'),
  ]);

  assert.match(guided, /aria-label="Plan sections"/);
  assert.match(guided, /Skip this section for now/);
  assert.match(guided, /await saveCurrentDraft\(\)/);
  assert.match(guided, /first question you skipped for now/i);
  assert.match(sectionNav, /Jump to any section/);
  assert.match(sectionNav, /Skip this section for now/);
  assert.match(provider, /jumpToSection: \(section: Section\) => Promise<void>/);
  assert.match(
    provider,
    /await requireSuccessfulResponse\([\s\S]*Could not save your new section/,
  );
});

test('duration promises are consistent at fifteen total and four or less per section', async () => {
  const [sections, session, prompt, marketing, footer] = await Promise.all([
    read('src/lib/gemini/sections.ts'),
    read('src/app/session/[id]/page.tsx'),
    read('src/lib/gemini/system-prompt.ts'),
    read('src/app/(marketing)/page.tsx'),
    read('src/components/layout/Footer.tsx'),
  ]);

  assert.match(sections, /TOTAL_PLAN_ESTIMATED_MINUTES = 15/);
  assert.match(sections, /MAX_SECTION_ESTIMATED_MINUTES = 4/);
  assert.equal(
    (sections.match(/estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES/g) ?? [])
      .length,
    5,
  );
  assert.match(session, /About 15 minutes total/);
  assert.match(session, /4 minutes or less/);
  assert.match(prompt, /about 15 minutes total/);
  assert.match(marketing, /about 15 minutes total/);
  assert.match(footer, /~15 min plan/);
});
