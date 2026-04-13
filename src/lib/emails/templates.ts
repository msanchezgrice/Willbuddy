/**
 * Email templates for WillBuddy. Kept as plain strings so we don't pull in
 * react-email / mjml. Each template renders both an HTML and a plaintext
 * version with shared branding.
 */

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface InviteParams {
  fromName: string;
  inviteUrl: string;
  appUrl: string;
}

export function renderInviteEmail({
  fromName,
  inviteUrl,
  appUrl,
}: InviteParams): RenderedEmail {
  const subject = `${fromName} wants to plan your estate with you`;
  const preheader =
    "Do your own 25-minute session, then compare answers together.";

  const text = `${fromName} started an estate plan on WillBuddy and wants you to do your part.

You'll each answer the same questions in your own private voice session (about 25 minutes), then we'll show you where you agree and where you need to talk.

No lawyer clock, no 45-minute marathon. Take your time.

Start here: ${inviteUrl}

— WillBuddy
${appUrl}`;

  const html = wrapLayout({
    preheader,
    body: `
      <p style="font-size: 16px; line-height: 1.6; color: #2D2A26; margin: 0 0 16px;">
        <strong>${escape(fromName)}</strong> started an estate plan on WillBuddy and wants you to do your part.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #5A5550; margin: 0 0 16px;">
        You'll each answer the same questions in your own private voice session (about 25 minutes), then we'll show you where you agree and where you need to talk.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #5A5550; margin: 0 0 24px;">
        No lawyer clock, no 45-minute marathon. Take your time.
      </p>
      ${button("Start my session", inviteUrl)}
    `,
  });

  return { subject, html, text };
}

interface WaitingParams {
  youName: string;
  appUrl: string;
  compareUrl: string;
}

export function renderWaitingEmail({
  youName,
  appUrl,
  compareUrl,
}: WaitingParams): RenderedEmail {
  const subject = "Your estate plan is saved — we'll email when your partner finishes";
  const preheader = "Nothing to do right now. We'll let you know.";

  const text = `Nice work, ${youName}. Your answers are saved.

We'll send you another email the moment your partner finishes their session. Then you can review the comparison together and finalize your documents.

View status: ${compareUrl}

— WillBuddy
${appUrl}`;

  const html = wrapLayout({
    preheader,
    body: `
      <p style="font-size: 16px; line-height: 1.6; color: #2D2A26; margin: 0 0 16px;">
        Nice work, <strong>${escape(youName)}</strong>. Your answers are saved.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #5A5550; margin: 0 0 24px;">
        We'll send you another email the moment your partner finishes their session. Then you can review the comparison together and finalize your documents.
      </p>
      ${button("View status", compareUrl)}
    `,
  });

  return { subject, html, text };
}

interface BothDoneParams {
  partnerName: string;
  compareUrl: string;
  appUrl: string;
  agreementsCount: number;
  disagreementsCount: number;
}

export function renderBothDoneEmail({
  partnerName,
  compareUrl,
  appUrl,
  agreementsCount,
  disagreementsCount,
}: BothDoneParams): RenderedEmail {
  const subject =
    disagreementsCount === 0
      ? "You're fully aligned — ready to finalize"
      : `You agreed on ${agreementsCount} things, ${disagreementsCount} to discuss`;

  const preheader = `${disagreementsCount === 0 ? "No disagreements" : `${disagreementsCount} need discussion`} — about 10 minutes to review.`;

  const text = `${partnerName} finished their session.

You agreed on ${agreementsCount} decisions${
    disagreementsCount === 0
      ? ". You're fully aligned and ready to finalize your documents."
      : `. ${disagreementsCount} need discussion — about 10 minutes to talk through.`
  }

View comparison: ${compareUrl}

— WillBuddy
${appUrl}`;

  const html = wrapLayout({
    preheader,
    body: `
      <p style="font-size: 16px; line-height: 1.6; color: #2D2A26; margin: 0 0 16px;">
        <strong>${escape(partnerName)}</strong> finished their session.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #5A5550; margin: 0 0 24px;">
        You agreed on <strong>${agreementsCount} decisions</strong>${
          disagreementsCount === 0
            ? ". You're fully aligned and ready to finalize your documents."
            : `. <strong>${disagreementsCount}</strong> need discussion — about 10 minutes to talk through.`
        }
      </p>
      ${button("View comparison", compareUrl)}
    `,
  });

  return { subject, html, text };
}

interface IdleParams {
  appUrl: string;
  resumeUrl: string;
  daysIdle: number;
}

export function renderIdleEmail({
  appUrl,
  resumeUrl,
  daysIdle,
}: IdleParams): RenderedEmail {
  const subject =
    daysIdle >= 14
      ? "Life gets busy — your estate plan is still here"
      : "Pick up where you left off?";
  const preheader = "20 minutes now and it's done forever.";

  const text = `Your estate plan is waiting.

It's been ${daysIdle} days. Taking 20 more minutes now means your family has real clarity — and you never have to think about this again.

Resume: ${resumeUrl}

— WillBuddy
${appUrl}`;

  const html = wrapLayout({
    preheader,
    body: `
      <p style="font-size: 16px; line-height: 1.6; color: #2D2A26; margin: 0 0 16px;">
        Your estate plan is waiting.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #5A5550; margin: 0 0 24px;">
        It's been ${daysIdle} days. Taking 20 more minutes now means your family has real clarity — and you never have to think about this again.
      </p>
      ${button("Resume my plan", resumeUrl)}
    `,
  });

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

interface LayoutParams {
  preheader: string;
  body: string;
}

function wrapLayout({ preheader, body }: LayoutParams): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>WillBuddy</title>
  </head>
  <body style="margin: 0; padding: 0; background: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <span style="display: none; overflow: hidden; max-height: 0; opacity: 0; color: transparent;">${escape(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FAF8F5;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 16px; border: 1px solid #E8E0D6; overflow: hidden;">
            <tr>
              <td style="padding: 32px 32px 24px;">
                <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5B7A5E;">
                  WillBuddy
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; border-top: 1px solid #F0EBE4; background: #FAF8F5;">
                <p style="margin: 0; font-size: 12px; color: #9B8E7E; line-height: 1.5;">
                  WillBuddy is not a law firm and does not provide legal advice. Draft documents should be reviewed by a licensed Texas estate planning attorney.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background: #5B7A5E; border-radius: 12px;">
        <a href="${url}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">${escape(label)}</a>
      </td>
    </tr>
  </table>`;
}

function escape(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
