import Image from 'next/image';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import type { AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';

interface BlogAskHeavenPanelProps {
  topic: AskHeavenTopic;
  prompt?: string;
  title: string;
  slug: string;
}

export function BlogAskHeavenPanel({ topic, prompt, title, slug }: BlogAskHeavenPanelProps) {
  return (
    <section className="rounded-2xl border border-[#e4d4ff] bg-[#f8f1ff] p-3 shadow-sm" data-blog-sidebar-ask-heaven>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Image src="/images/wizard-icons/47-ask-heaven.png" alt="" aria-hidden width={16} height={16} className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Ask Heaven</p>
      </div>
      <AskHeavenWidget
        variant="compact"
        source="blog"
        topic={topic}
        prompt={prompt}
        title={title}
        utm_campaign={slug}
      />
    </section>
  );
}
