'use client';

/**
 * Export Modal Component
 *
 * Displays a file preview of the generated Claude Code configuration.
 *
 * Features:
 * - File tree navigation
 * - File content preview with copy
 * - Install commands display
 * - Download ZIP functionality
 * - Copy all files
 */

import { useState, useEffect, useCallback } from 'react';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import type { ExportFile } from '@/lib/export-generator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportResponse {
  files: ExportFile[];
  installCommands: string[];
  summary: {
    fileCount: number;
    hasCommands: boolean;
    hasMcpConfig: boolean;
  };
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { nodes, stackName } = useStackBuilderStore();

  // State
  const [files, setFiles] = useState<ExportFile[]>([]);
  const [installCommands, setInstallCommands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get project name from store
  const projectName = stackName || 'my-stack';

  // Map nodes to components format
  const components = nodes.map((node) => ({
    id: node.data.id || node.id,
    type: node.data.type,
    name: node.data.name,
    config: node.data.config,
    prompt: node.data.prompt,
    description: node.data.description,
  }));

  // Generate preview when modal opens
  const generatePreview = useCallback(async () => {
    if (components.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components, projectName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate export');
      }

      const data: ExportResponse = await response.json();
      setFiles(data.files);
      setInstallCommands(data.installCommands);
      setActiveFile(data.files[0]?.path || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }, [components, projectName]);

  useEffect(() => {
    if (isOpen && components.length > 0) {
      generatePreview();
    }
  }, [isOpen, generatePreview]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Download ZIP
  const handleDownloadZip = useCallback(async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components, projectName, format: 'zip' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ZIP');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [components, projectName]);

  // Copy all files
  const handleCopyAll = useCallback(() => {
    const allContent = files
      .map((f) => `// === ${f.path} ===\n${f.content}`)
      .join('\n\n');
    copyToClipboard(allContent, 'all');
  }, [files, copyToClipboard]);

  // Get active file content
  const activeFileContent = files.find((f) => f.path === activeFile)?.content || '';

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Export to Claude Code</h2>
            <p className="text-sm text-slate-600">
              {components.length} components → {files.length} files
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-slate-600">Generating export...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-red-600">Error: {error}</div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && files.length > 0 && (
          <>
            <div className="flex-1 flex overflow-hidden">
              {/* File Tree Panel */}
              <div className="w-48 border-r border-slate-200 p-3 overflow-y-auto bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Files
                </div>
                <div className="space-y-1">
                  {files.map((file) => {
                    const filename = file.path.split('/').pop() || file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setActiveFile(file.path)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm truncate transition-colors ${
                          activeFile === file.path
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                        title={file.path}
                      >
                        {filename}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Content Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* File Header */}
                <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <code className="text-sm text-slate-600">{activeFile}</code>
                  <button
                    onClick={() => copyToClipboard(activeFileContent, activeFile || '')}
                    className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                  >
                    {copied === activeFile ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                {/* File Content */}
                <div className="flex-1 overflow-auto bg-slate-100 p-4">
                  <pre className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
                    {activeFileContent}
                  </pre>
                </div>
              </div>
            </div>

            {/* Install Commands Section */}
            {installCommands.length > 0 && (
              <div className="border-t border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">
                  MCP Install Commands
                </div>
                <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                  {installCommands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <code className="text-green-400 text-sm font-mono flex-1 truncate">
                        {cmd}
                      </code>
                      <button
                        onClick={() => copyToClipboard(cmd, `cmd-${idx}`)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {copied === `cmd-${idx}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={handleCopyAll}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                📋 {copied === 'all' ? 'Copied!' : 'Copy All'}
              </button>
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📦 Download ZIP
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && files.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-slate-600">No components to export</div>
          </div>
        )}
      </div>
    </div>
  );
}
