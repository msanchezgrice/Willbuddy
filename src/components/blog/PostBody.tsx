import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26] mt-12 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26] mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[#3D3A35] leading-relaxed mb-5">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 mb-5 text-[#3D3A35] marker:text-[#5B7A5E]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-5 text-[#3D3A35] marker:text-[#5B7A5E]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#2D2A26]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#5B7A5E] underline underline-offset-2 hover:text-[#4A6A4D]"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#5B7A5E] bg-[#F0EBE4]/50 pl-5 pr-4 py-3 my-6 rounded-r-lg text-[#5B4F3E] italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-t border-[#E8E0D6]" />,
};

export function PostBody({ content }: { content: string }) {
  return (
    <div className="text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
