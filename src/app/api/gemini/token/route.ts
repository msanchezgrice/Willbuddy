import {
  VOICE_UNAVAILABLE_CODE,
  VOICE_UNAVAILABLE_MESSAGE,
} from "@/lib/voice-unavailable";

export const dynamic = "force-dynamic";

// Keep this closed until voice has a reviewed credential boundary.
// Do not read credentials, authenticate, parse input, create sessions, or dispatch.
export function POST() {
  return Response.json(
    { error: VOICE_UNAVAILABLE_MESSAGE, code: VOICE_UNAVAILABLE_CODE },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export const GET = POST;
export const PUT = POST;
export const PATCH = POST;
export const DELETE = POST;
export const HEAD = POST;
export const OPTIONS = POST;
