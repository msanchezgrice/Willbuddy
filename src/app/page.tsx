import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-[#5B4F3E] mb-4 tracking-tight">
          WillBuddy
        </h1>
        <p className="text-xl md:text-2xl text-[#5A5248] mb-3 leading-relaxed">
          Talk through your estate plan
          <br />
          like you&apos;re talking to a friend.
        </p>
        <p className="text-xl md:text-2xl leading-relaxed mb-12">
          <span className="text-[#5B7A5E] font-semibold">
            Then hand it to a lawyer.
          </span>
        </p>
        <p className="text-base text-[#9B8E7E] mb-12 max-w-lg mx-auto leading-relaxed">
          A voice-guided AI coach that walks you and your partner through every
          decision: guardianship, assets, healthcare wishes, powers of attorney.
          Everything transcribed. Draft documents generated. Ready for attorney
          review.
        </p>

        <Link
          href="/login"
          className="inline-block bg-[#5B7A5E] hover:bg-[#4A6A4D] text-white font-semibold text-lg px-14 py-5 rounded-full shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5"
        >
          Start Your Estate Plan
        </Link>
        <p className="text-sm text-[#9B8E7E] mt-5">
          About 45 minutes for a couple. Do it on the couch after the kids are
          asleep.
        </p>

        <div className="flex gap-12 justify-center mt-16 text-sm text-[#9B8E7E]">
          <div className="text-center max-w-[140px]">
            <div className="text-2xl mb-2">🎙️</div>
            <p className="font-semibold text-[#5B4F3E] mb-1">Voice-First</p>
            <p className="text-xs leading-relaxed">
              Talk naturally. WillBuddy listens and transcribes everything.
            </p>
          </div>
          <div className="text-center max-w-[140px]">
            <div className="text-2xl mb-2">📄</div>
            <p className="font-semibold text-[#5B4F3E] mb-1">Draft Documents</p>
            <p className="text-xs leading-relaxed">
              Texas-compliant will, POA, guardianship, healthcare directive.
            </p>
          </div>
          <div className="text-center max-w-[140px]">
            <div className="text-2xl mb-2">⚖️</div>
            <p className="font-semibold text-[#5B4F3E] mb-1">Lawyer Handoff</p>
            <p className="text-xs leading-relaxed">
              Share your plan with a Texas estate attorney for final review.
            </p>
          </div>
        </div>

        <div className="flex gap-8 justify-center mt-12 text-xs text-[#9B8E7E]">
          <span>🔒 Encrypted</span>
          <span>⚠️ Not legal advice</span>
          <span>🇺🇸 Texas estate law</span>
        </div>
      </div>
    </main>
  );
}
