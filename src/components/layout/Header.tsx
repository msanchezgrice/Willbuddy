import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-[#E8E0D6] bg-[#FAF8F5] px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          data-testid="header-brand"
          className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]"
        >
          WillBuddy
        </Link>
        <nav
          aria-label="Primary"
          data-agent-nav="primary"
          data-testid="nav-primary"
          className="flex items-center gap-5 text-sm font-medium text-[#5B4F3E]"
        >
          <Link
            href="/tools"
            data-testid="nav-tools"
            className="hidden hover:text-[#2D2A26] sm:inline"
          >
            Free tools
          </Link>
          <Link
            href="/guides"
            data-testid="nav-guides"
            className="hidden hover:text-[#2D2A26] sm:inline"
          >
            Guides
          </Link>
          <Link
            href="/blog"
            data-testid="nav-blog"
            className="hidden hover:text-[#2D2A26] sm:inline"
          >
            Blog
          </Link>
          <Link
            href="/onboarding"
            data-testid="nav-start"
            data-agent-action="start-plan"
            className="rounded-full bg-[#5B7A5E] px-4 py-2 font-semibold text-white transition hover:bg-[#4A6A4D]"
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}
