'use client';

/**
 * Homepage - Organized AI Marketplace
 *
 * Visual landing page featuring popular pre-built stacks that users can
 * explore and load into the Stack Builder to learn from examples.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { POPULAR_STACKS } from '@/lib/data/popular-stacks';
import { useStackBuilderStore } from '@/stores/stack-builder-store';

export default function HomePage() {
  const router = useRouter();
  const { loadStack } = useStackBuilderStore();

  const handleLoadStack = (stackId: string) => {
    const stack = POPULAR_STACKS.find((s) => s.id === stackId);
    if (!stack) return;

    // Load the stack into the builder
    loadStack({
      nodes: stack.nodes,
      edges: stack.edges,
      name: stack.name,
      description: stack.description,
    });

    // Navigate to builder
    router.push('/builder');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">🎨</div>
              <div>
                <div className="text-xl font-bold text-slate-900">Organized AI</div>
                <div className="text-xs text-slate-500">Stack Builder</div>
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/builder" className="text-slate-600 hover:text-slate-900 transition-colors">
                Start from Scratch
              </Link>
              <Link
                href="https://github.com/Organized-AI/organized-codebase"
                target="_blank"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="/builder"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Open Builder
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-transparent py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            ✨ Learn by Example
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Build Your Perfect Claude Stack
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Start with a popular stack template. See how components connect visually.
            Customize and export in seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/builder"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Building →
            </Link>
            <a
              href="#popular-stacks"
              className="px-6 py-3 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Explore Templates
            </a>
          </div>
        </div>
      </section>

      {/* Popular Stacks */}
      <section id="popular-stacks" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Stacks</h2>
            <p className="text-slate-600">
              Pre-built configurations ready to use. Click to explore and customize.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {POPULAR_STACKS.map((stack) => (
              <button
                key={stack.id}
                onClick={() => handleLoadStack(stack.id)}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {stack.name}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{stack.description}</p>
                  </div>
                  <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity ml-2">
                    🚀
                  </div>
                </div>

                {/* Component Preview */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {stack.nodes.slice(0, 4).map((node) => (
                      <div
                        key={node.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <span>{node.data.icon}</span>
                        <span className="text-slate-700">{node.data.name.split(' ')[0]}</span>
                      </div>
                    ))}
                    {stack.nodes.length > 4 && (
                      <div className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        +{stack.nodes.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    ⬇️ {stack.downloads.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    👍 {stack.upvotes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    🔗 {stack.nodes.length} components
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {stack.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  Load in Stack Builder
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Stack CTA */}
          <div className="mt-12 text-center">
            <div className="inline-block p-8 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-slate-900 mb-2">Build Your Own Stack</h3>
              <p className="text-sm text-slate-600 mb-4 max-w-sm mx-auto">
                Start from scratch or mix components from different templates
              </p>
              <Link
                href="/builder"
                className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Open Empty Canvas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold text-slate-900 mb-2">Visual Builder</h3>
              <p className="text-sm text-slate-600">
                Drag-and-drop interface to compose your perfect Claude Code setup
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-slate-900 mb-2">One-Click Export</h3>
              <p className="text-sm text-slate-600">
                Export to Organized Codebase template or download as ZIP
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-semibold text-slate-900 mb-2">See Connections</h3>
              <p className="text-sm text-slate-600">
                Understand how components work together with visual relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="text-white font-bold mb-1">Organized AI</div>
              <div className="text-sm">Built with ❤️ for Claude Code developers</div>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="https://github.com/Organized-AI/organized-codebase" target="_blank" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://docs.claude.com" target="_blank" className="hover:text-white transition-colors">
                Claude Docs
              </a>
              <Link href="/builder" className="hover:text-white transition-colors">
                Stack Builder
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
