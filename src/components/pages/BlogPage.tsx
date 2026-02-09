'use client';

import { motion } from 'framer-motion';
import { BlogPageConfig, BlogPostMeta } from '@/types/page';
import Link from 'next/link';

interface BlogPost extends BlogPostMeta {
  content: string;
}

interface BlogPageProps {
  config: BlogPageConfig & { posts: BlogPost[] };
  embedded?: boolean;
}

export default function BlogPage({ config, embedded = false }: BlogPageProps) {
  const posts = config.posts || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={embedded ? '' : 'max-w-3xl mx-auto'}
    >
      <div className={embedded ? 'mb-4' : 'mb-8'}>
        <h1 className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary mb-4`}>
          {config.title}
        </h1>
        {config.description && (
          <p className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
            {config.description}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {posts.map((post, index) => (
          <motion.article
            key={`${post.title}-${post.date}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
          >
            <header className="mb-4">
              <h2 className="text-xl font-semibold text-primary mb-1">{post.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                {post.date && <span>{post.date}</span>}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
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

            <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4">
              {post.summary || (post.content.length > 160 ? post.content.slice(0, 160) + '…' : post.content)}
            </p>

            <Link
              href={`/blog/${encodeURIComponent((post.slug || post.title).toLowerCase().replace(/\s+/g, '-') )}`}
              className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-dark hover:underline"
            >
              阅读全文 →
            </Link>
          </motion.article>
        ))}

        {posts.length === 0 && (
          <p className="text-sm text-neutral-500">
            No blog posts yet. Add markdown files and update <code>content/blog.toml</code> to get started.
          </p>
        )}
      </div>
    </motion.div>
  );
}

