export default function SummaryLoading() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF8F5] px-6 text-center">
      <div>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8CDBF] border-t-[#5B7A5E] motion-reduce:animate-none" />
        <h1 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          Opening your plan review…
        </h1>
        <p className="mt-2 text-sm text-[#5B4F3E]">
          Your answers are saved. We’re preparing the review screen.
        </p>
      </div>
    </main>
  );
}
