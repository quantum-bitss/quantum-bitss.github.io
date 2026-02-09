import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTomlContent, getMarkdownContent } from '@/lib/content';
import { BlogPageConfig, BlogPostMeta } from '@/types/page';
import ReactMarkdown from 'react-markdown';

function getBlogConfig(): BlogPageConfig | null {
  return getTomlContent<BlogPageConfig>('blog.toml');
}

function getSlug(meta: BlogPostMeta): string {
  if (meta.slug) return meta.slug;
  return encodeURIComponent(meta.title.toLowerCase().replace(/\s+/g, '-'));
}

export function generateStaticParams() {
  const config = getBlogConfig();
  const posts = config?.posts || [];
  return posts.map((post) => ({
    slug: getSlug(post),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = getBlogConfig();
  const posts = config?.posts || [];
  const meta = posts.find((p) => getSlug(p) === slug);

  if (!meta) {
    return {};
  }

  return {
    title: meta.title,
    description: meta.summary || config?.description,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getBlogConfig();

  if (!config) {
    notFound();
  }

  const posts = config.posts || [];
  const meta = posts.find((p) => getSlug(p) === slug);

  if (!meta) {
    notFound();
  }

  const content = getMarkdownContent(meta.source);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">{meta.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          {meta.date && <span>{meta.date}</span>}
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

