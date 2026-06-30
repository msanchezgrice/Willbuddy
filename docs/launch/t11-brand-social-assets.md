# T11 Brand / Social Assets

Updated: 2026-06-27

## Scope

WillBuddy is the voice-first, affordable preparatory layer for Texas estate planning. This packet saves reusable profile assets, profile copy, link-card copy, and provider handoff steps without publishing public posts or mutating provider accounts.

## Saved Assets

All files are in `public/brand/`.

| Asset | File | Use |
|---|---|---|
| Profile avatar | `willbuddy-profile-avatar.png` | X, Facebook, YouTube profile image |
| Wordmark | `willbuddy-wordmark.svg` | Partner decks, site embeds, docs |
| Link card | `willbuddy-social-card.png` | Social/link preview fallback |
| X cover | `willbuddy-x-cover.png` | X profile banner |
| Facebook cover | `willbuddy-facebook-cover.png` | Facebook page cover |
| YouTube banner | `willbuddy-youtube-banner.png` | YouTube channel banner |

Source SVGs are kept beside the PNGs for future edits.

## Brand Copy

Short bio:
> Voice-first estate planning prep for Texas families. Talk through wills, guardianship, healthcare wishes, and powers of attorney, then bring organized drafts to an attorney.

Compact bio:
> Voice-first Texas estate planning prep. Drafts for attorney review. Not a law firm.

Long description:
> WillBuddy helps busy Texas families complete the hard discovery work before meeting an attorney. A guided voice session captures family details, guardianship wishes, healthcare preferences, asset notes, and powers of attorney, then organizes the answers into draft documents for licensed attorney review. WillBuddy is not a law firm and does not provide legal advice.

Link-card title:
> WillBuddy - Voice-First Estate Planning

Link-card description:
> Talk through wills, guardianship, healthcare wishes, and powers of attorney by voice, then bring organized Texas draft documents to an attorney.

Primary URL:
> https://mywillbuddy.com/

Support email:
> support@mywillbuddy.com

## Profile Setup Handoff

### X / Twitter

Recommended handle: `@mywillbuddy`

Recommended profile URL after setup: `https://x.com/mywillbuddy`

Public check on 2026-06-27:
- `https://x.com/mywillbuddy` returned 404.
- `https://x.com/willbuddy` returned 200 but is not ownership proof and was not recorded as a WillBuddy primitive.

Status: blocked on provider ownership/auth. Creating the profile, claiming/changing a handle, uploading assets, or saving a bio is a public account mutation and needs Miguel approval in a signed-in provider session.

Setup steps after approval:
1. Open X in Miguel's signed-in Chrome profile.
2. Confirm the visible account is owned by Miguel or WillBuddy.
3. Claim or rename to `@mywillbuddy` if available.
4. Upload `public/brand/willbuddy-profile-avatar.png`.
5. Upload `public/brand/willbuddy-x-cover.png`.
6. Add the compact bio and `https://mywillbuddy.com/`.
7. Record the final handle and profile URL in `warm-start-primitives.json`.

### Facebook

Recommended page name: `WillBuddy`

Recommended public page URL after setup: `https://www.facebook.com/mywillbuddy`

Public check on 2026-06-27:
- Search results did not identify a WillBuddy-owned Facebook page for `mywillbuddy.com`.
- `https://www.facebook.com/mywillbuddy` returned a public Facebook response, but public visibility is not ownership proof and no stable page ID was verified.

Status: blocked on provider ownership/auth. Creating a page, changing a page URL, uploading cover/profile assets, or publishing a first post requires Miguel approval in a signed-in Facebook session.

Setup steps after approval:
1. Open Facebook Pages in Miguel's signed-in Chrome profile.
2. Confirm the visible page/admin account is owned by Miguel or WillBuddy.
3. Create or select the WillBuddy page.
4. Upload `public/brand/willbuddy-profile-avatar.png`.
5. Upload `public/brand/willbuddy-facebook-cover.png`.
6. Add the short bio, support email, and `https://mywillbuddy.com/`.
7. Record the public page URL and stable page/profile ID in `warm-start-primitives.json`.

### YouTube

Recommended handle: `@mywillbuddy`

Recommended channel URL after setup: `https://www.youtube.com/@mywillbuddy`

Public check on 2026-06-27:
- `https://www.youtube.com/@mywillbuddy` returned 404.
- `https://www.youtube.com/@willbuddy` returned 200 but is not ownership proof and was not recorded as a WillBuddy primitive.

Status: blocked on provider ownership/auth. Creating a channel, changing a handle, or uploading banner/profile assets requires Miguel approval in a signed-in YouTube/Google session.

Setup steps after approval:
1. Open YouTube Studio in Miguel's signed-in Chrome profile.
2. Confirm the visible channel/account is owned by Miguel or WillBuddy.
3. Claim or rename to `@mywillbuddy` if available.
4. Upload `public/brand/willbuddy-profile-avatar.png`.
5. Upload `public/brand/willbuddy-youtube-banner.png`.
6. Add the long description and `https://mywillbuddy.com/`.
7. Record the channel URL and recurring video surface URLs in `warm-start-primitives.json`.

## Link Card State

Local code already contains Next App Router metadata and a generated OG image route in `src/app/layout.tsx` and `src/app/opengraph-image.tsx`. A static fallback card is saved at `public/brand/willbuddy-social-card.png`.

Production check on 2026-06-27:
- `https://mywillbuddy.com/` returned 200.
- `https://mywillbuddy.com/opengraph-image`, `/robots.txt`, `/sitemap.xml`, `/contact`, `/privacy`, and `/terms` returned 404, indicating the current branch's SEO/legal/social-card changes are not reflected on production yet.

## No-Publish Confirmation

No public posts were sent. No social profiles, handles, bios, covers, banners, or channel settings were changed in provider dashboards.
