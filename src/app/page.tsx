import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  Mic,
  ClipboardCheck,
  Handshake,
  Check,
  ChevronDown,
} from "lucide-react";

function HeroSection() {
  return (
    <section className="px-6 pt-20 pb-24 md:pt-32 md:pb-32">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm tracking-widest uppercase text-[#9B8E7E] mb-6">
          Voice-first estate planning for Texas families
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D2A26] mb-6 leading-tight tracking-tight">
          Talk through your estate plan like you&apos;re talking to a friend.
        </h1>
        <p className="text-lg md:text-xl text-[#5B4F3E] mb-4 leading-relaxed max-w-xl mx-auto">
          WillBuddy is an AI coach that walks you and your partner through
          wills, guardianship, healthcare wishes, and powers of attorney —
          using your voice, not forms.
        </p>
        <p className="text-base text-[#5B7A5E] font-medium mb-10">
          Draft documents generated. Ready for attorney review.
        </p>
        <TrackedLink
          href="/sign-in"
          event="signup_cta_clicked"
          eventProperties={{ location: "hero", label: "Start Your Estate Plan" }}
          className="inline-block bg-[#5B7A5E] hover:bg-[#4A6A4D] text-white font-semibold text-lg px-12 py-4 rounded-full shadow-lg shadow-[#5B7A5E]/20 transition-all hover:-translate-y-0.5"
        >
          Start Your Estate Plan
        </TrackedLink>
        <p className="text-sm text-[#9B8E7E] mt-5">
          About 45 minutes together — or do it separately (25 min each) and
          compare answers after.
        </p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Mic className="w-6 h-6" />,
      title: "Have a conversation",
      description:
        "Open WillBuddy and start talking. It asks you questions about your family, your wishes, your worries — the way a good advisor would. You talk naturally. It listens and captures everything.",
    },
    {
      number: "02",
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "Review your decisions",
      description:
        "When you're done talking, WillBuddy shows you a clear summary of every decision you made. Guardians, assets, healthcare preferences — all organized and editable before anything gets drafted.",
    },
    {
      number: "03",
      icon: <Handshake className="w-6 h-6" />,
      title: "Hand it to your lawyer",
      description:
        "WillBuddy generates Texas-compliant draft documents from your conversation. Share them with an estate attorney for final review, execution, and filing. You've done the hard part.",
    },
  ];

  return (
    <section className="px-6 py-20 md:py-28 bg-[#F0EBE4]/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[#2D2A26] text-center mb-16">
          How it works
        </h2>

        {/* Mobile: vertical layout */}
        <div className="md:hidden space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="relative pl-16">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#5B7A5E]/10 flex items-center justify-center text-[#5B7A5E]">
                {step.icon}
              </div>
              <p className="text-xs font-semibold text-[#9B8E7E] uppercase tracking-wider mb-1">
                Step {step.number}
              </p>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26] mb-2">
                {step.title}
              </h3>
              <p className="text-[#5B4F3E] leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:block">
          <div className="flex items-start gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="flex-1 relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+24px)] right-0 h-px bg-[#E8E0D6]" />
                )}
                {i > 0 && (
                  <div className="absolute top-5 left-0 right-[calc(50%+24px)] h-px bg-[#E8E0D6]" />
                )}
                <div className="flex flex-col items-center text-center px-6">
                  <div className="w-10 h-10 rounded-full bg-[#5B7A5E]/10 flex items-center justify-center text-[#5B7A5E] mb-4 relative z-10">
                    {step.icon}
                  </div>
                  <p className="text-xs font-semibold text-[#9B8E7E] uppercase tracking-wider mb-1">
                    Step {step.number}
                  </p>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#5B4F3E] leading-relaxed text-sm max-w-[280px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentsSection() {
  const documents = [
    {
      name: "Last Will & Testament",
      description:
        "Directs how your property and assets are distributed. Names an executor to carry out your wishes.",
    },
    {
      name: "Guardianship Designation",
      description:
        "Names who raises your children if something happens to you. The decision most parents lose sleep over.",
    },
    {
      name: "Medical Power of Attorney",
      description:
        "Appoints someone to make healthcare decisions if you can't speak for yourself.",
    },
    {
      name: "Durable Power of Attorney",
      description:
        "Authorizes someone to handle your finances and legal matters if you're incapacitated.",
    },
    {
      name: "HIPAA Authorization",
      description:
        "Allows your designated people to access your medical records when they need to make decisions.",
    },
  ];

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[#2D2A26] text-center mb-4">
          What you&apos;ll create
        </h2>
        <p className="text-center text-[#9B8E7E] mb-14 max-w-lg mx-auto">
          Five Texas-compliant draft documents, generated from a single
          conversation.
        </p>
        <ul className="space-y-6">
          {documents.map((doc) => (
            <li key={doc.name} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-[#5B7A5E]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-semibold text-[#2D2A26] mb-0.5">
                  {doc.name}
                </p>
                <p className="text-sm text-[#5B4F3E] leading-relaxed">
                  {doc.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WhyVoiceSection() {
  return (
    <section className="px-6 py-20 md:py-28 bg-[#F0EBE4]/50">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[#2D2A26] text-center mb-6">
          These are conversations, not checkboxes.
        </h2>
        <div className="space-y-5 text-[#5B4F3E] leading-relaxed">
          <p>
            Estate planning is emotional. You&apos;re deciding who raises your
            kids. What happens to everything you&apos;ve built. How you want to
            be cared for.
          </p>
          <p>
            Those decisions don&apos;t happen well inside a form with dropdown
            menus. They happen on the couch, after the kids are asleep, when you
            and your partner are finally talking it through.
          </p>
          <p>
            WillBuddy works like that. You talk. It listens. It asks follow-up
            questions the way a thoughtful advisor would — not in the order a
            database expects. If you need to think out loud, circle back, or
            change your mind, that&apos;s the whole point.
          </p>
          <p className="text-[#5B7A5E] font-medium">
            The best estate plan is the one you actually finish. Voice gets you
            there.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const included = [
    "All 5 Texas-compliant draft documents",
    "Full conversation transcript",
    "Shareable link for your attorney",
    "Resume your session anytime",
  ];

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[#2D2A26] mb-4">
          One price. Everything included.
        </h2>
        <p className="text-[#9B8E7E] mb-12">
          Free to start. Pay only when you&apos;re ready for documents.
        </p>

        <div className="bg-white border border-[#E8E0D6] rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="mb-6">
            <span className="text-5xl md:text-6xl font-bold text-[#2D2A26]">
              $49
            </span>
            <p className="text-sm text-[#9B8E7E] mt-2">
              Complete document package
            </p>
          </div>

          <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
            {included.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-[#5B4F3E]">
                <Check
                  className="w-4 h-4 text-[#5B7A5E] flex-shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
                {item}
              </li>
            ))}
          </ul>

          <TrackedLink
            href="/sign-in"
            event="signup_cta_clicked"
            eventProperties={{ location: "pricing", label: "Start for Free" }}
            className="inline-block bg-[#5B7A5E] hover:bg-[#4A6A4D] text-white font-semibold px-10 py-3.5 rounded-full shadow-lg shadow-[#5B7A5E]/20 transition-all hover:-translate-y-0.5"
          >
            Start for Free
          </TrackedLink>
        </div>

        <p className="text-sm text-[#9B8E7E] mt-8 max-w-md mx-auto leading-relaxed">
          A typical estate plan costs $1,000 &ndash; $2,000 with an attorney
          starting from scratch. WillBuddy does the preparation so your
          attorney&apos;s time is spent on review, not discovery.
        </p>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-[#E8E0D6] last:border-b-0">
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-left">
        <span className="font-semibold text-[#2D2A26]">{question}</span>
        <ChevronDown className="w-4 h-4 text-[#9B8E7E] flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="pb-5 text-sm text-[#5B4F3E] leading-relaxed pr-8">
        {answer}
      </p>
    </details>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "Is this legal advice?",
      answer:
        "No. WillBuddy generates draft documents based on your conversation, but it is not a law firm and does not provide legal advice. Your documents should be reviewed, finalized, and executed with a licensed Texas estate planning attorney.",
    },
    {
      question: "What states do you support?",
      answer:
        "Texas only, right now. Estate law varies significantly by state, and we built WillBuddy to be deeply accurate for Texas families first. We plan to expand to other states in the future.",
    },
    {
      question: "How long does it take?",
      answer:
        "About 45 minutes for a couple working through everything together. Individual sessions tend to be a bit shorter. You can pause and come back anytime — your session saves automatically.",
    },
    {
      question: "Can I do this alone?",
      answer:
        "Absolutely. WillBuddy works for individuals too. The conversation adapts based on whether you're planning solo or with a partner.",
    },
    {
      question: "What if I need to come back later?",
      answer:
        "Sessions save automatically. Close the tab, come back tomorrow, pick up right where you left off. No work is lost.",
    },
    {
      question: "Do I still need a lawyer?",
      answer:
        "Yes. WillBuddy creates draft documents, but a licensed attorney should review them for accuracy, ensure they meet your specific circumstances, and supervise proper execution (signing, witnessing, notarization) under Texas law.",
    },
    {
      question: "Is my information secure?",
      answer:
        "Yes. Your conversations and documents are encrypted in transit and at rest. We never use your personal information to train AI models.",
    },
    {
      question: "What if I change my mind about a decision?",
      answer:
        "You can edit any decision before generating your final documents. After your conversation, WillBuddy shows you a full summary where you can review and adjust anything.",
    },
  ];

  return (
    <section className="px-6 py-20 md:py-28 bg-[#F0EBE4]/50">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[#2D2A26] text-center mb-14">
          Common questions
        </h2>
        <div className="bg-white border border-[#E8E0D6] rounded-2xl px-6 md:px-8 divide-y-0">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <HowItWorksSection />
      <DocumentsSection />
      <WhyVoiceSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
