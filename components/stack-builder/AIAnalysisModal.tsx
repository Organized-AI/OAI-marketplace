'use client';

/**
 * AI Analysis Modal Component
 *
 * Displays AI-powered analysis of the current stack configuration.
 * Features:
 * - Real Anthropic API integration
 * - Rate limiting display (3 free/day)
 * - Workflow visualization
 * - Recommendations
 * - Cost/token estimates
 */

import { useState, useEffect } from 'react';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import { useSessionId } from '@/hooks/useSessionId';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface WorkflowPhase {
  number: number;
  name: string;
  components: string[];
  description: string;
}

interface AnalysisResult {
  isValid: boolean;
  confidence: number;
  complexity: 'simple' | 'standard' | 'complex' | 'enterprise';
  estimatedTokensPerRun: string;
  estimatedCostPerRun: string;
  estimatedDuration: string;
  compatibilityIssues: string[];
  missingDependencies: string[];
  securityConcerns: string[];
  recommendations: Recommendation[];
  workflow: {
    pattern: string;
    phases: WorkflowPhase[];
  };
  summary: string;
}

export function AIAnalysisModal({ isOpen, onClose }: AIAnalysisModalProps) {
  const { nodes, stackName, stackDescription } = useStackBuilderStore();
  const sessionId = useSessionId();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingValidations, setRemainingValidations] = useState<number | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen]);

  // Perform analysis
  const runAnalysis = async () => {
    if (!sessionId || nodes.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/validate-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack: {
            name: stackName || 'Unnamed Stack',
            description: stackDescription,
            components: nodes.map((n) => ({
              id: n.data.id,
              type: n.data.type,
              name: n.data.name,
              description: n.data.description,
              config: n.data.config,
            })),
          },
          sessionId,
          userApiKey: userApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Analysis failed');
        if (data.remainingValidations !== undefined) {
          setRemainingValidations(data.remainingValidations);
        }
      } else {
        setAnalysis(data.analysis);
        setRemainingValidations(data.remainingValidations);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'complex':
        return 'bg-orange-100 text-orange-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Stack Analysis</h2>
            <p className="text-sm text-slate-600 mt-1">
              Powered by Claude - Real AI analysis of your configuration
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Initial state - before analysis */}
          {!analysis && !isAnalyzing && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">AI</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Analyze Your Stack
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Get AI-powered insights about your component configuration including
                compatibility analysis, workflow suggestions, and optimization recommendations.
              </p>

              {/* API Key section */}
              {showApiKeyInput ? (
                <div className="mb-6 max-w-md mx-auto">
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                    Your Anthropic API Key (optional)
                  </label>
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1 text-left">
                    Use your own key for unlimited validations. Key is not stored.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 mb-6"
                >
                  Use your own API key for unlimited validations
                </button>
              )}

              <button
                onClick={runAnalysis}
                disabled={nodes.length === 0 || !sessionId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Stack ({nodes.length} components)
              </button>

              {remainingValidations !== null && remainingValidations >= 0 && (
                <p className="text-sm text-slate-500 mt-4">
                  {remainingValidations} free validation{remainingValidations !== 1 ? 's' : ''} remaining today
                </p>
              )}
            </div>
          )}

          {/* Loading state */}
          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Analyzing Your Stack...
              </h3>
              <p className="text-slate-600">
                Claude is reviewing your component configuration
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !isAnalyzing && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">!</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Analysis Failed
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>

              {remainingValidations === 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-amber-800">
                    Add your own Anthropic API key below for unlimited validations.
                  </p>
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full mt-3 px-4 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <button
                onClick={runAnalysis}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Analysis results */}
          {analysis && !isAnalyzing && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {stackName || 'Your Stack'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(analysis.complexity)}`}>
                        {analysis.complexity}
                      </span>
                      <span className="text-sm text-slate-600">
                        {Math.round(analysis.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className={`text-4xl ${analysis.isValid ? 'text-green-500' : 'text-red-500'}`}>
                    {analysis.isValid ? 'valid' : 'invalid'}
                  </div>
                </div>
                <p className="text-slate-700">{analysis.summary}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">{analysis.estimatedTokensPerRun}</div>
                  <div className="text-sm text-slate-600">Tokens/Run</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">{analysis.estimatedCostPerRun}</div>
                  <div className="text-sm text-slate-600">Est. Cost</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">{analysis.estimatedDuration}</div>
                  <div className="text-sm text-slate-600">Duration</div>
                </div>
              </div>

              {/* Issues */}
              {(analysis.compatibilityIssues.length > 0 ||
                analysis.missingDependencies.length > 0 ||
                analysis.securityConcerns.length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h4 className="font-semibold text-red-900 mb-3">Issues Found</h4>
                  <div className="space-y-2">
                    {analysis.compatibilityIssues.map((issue, i) => (
                      <div key={`compat-${i}`} className="flex items-start gap-2 text-sm text-red-800">
                        <span>X</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                    {analysis.missingDependencies.map((dep, i) => (
                      <div key={`dep-${i}`} className="flex items-start gap-2 text-sm text-red-800">
                        <span>!</span>
                        <span>Missing dependency: {dep}</span>
                      </div>
                    ))}
                    {analysis.securityConcerns.map((concern, i) => (
                      <div key={`sec-${i}`} className="flex items-start gap-2 text-sm text-red-800">
                        <span>*</span>
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow */}
              {analysis.workflow && analysis.workflow.phases.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">
                    Suggested Workflow ({analysis.workflow.pattern})
                  </h4>
                  <div className="space-y-4">
                    {analysis.workflow.phases.map((phase, index) => (
                      <div key={phase.number} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {phase.number}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-900">{phase.name}</h5>
                          <p className="text-sm text-slate-600 mt-1">{phase.description}</p>
                          {phase.components.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {phase.components.map((comp) => (
                                <span
                                  key={comp}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded"
                                >
                                  {comp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {index < analysis.workflow.phases.length - 1 && (
                          <div className="absolute left-4 top-10 w-0.5 h-full bg-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Recommendations</h4>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <span className={`text-2xl ${getImpactColor(rec.impact)}`}>
                            {rec.type === 'optimization' ? '*' : rec.type === 'warning' ? '!' : 'i'}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900">{rec.title}</h5>
                          <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                          <span className={`text-xs font-medium ${getImpactColor(rec.impact)} mt-2 inline-block`}>
                            {rec.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-analyze button */}
              <div className="text-center pt-4">
                <button
                  onClick={runAnalysis}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Re-analyze Stack
                </button>
                {remainingValidations !== null && remainingValidations >= 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    {remainingValidations} free validation{remainingValidations !== 1 ? 's' : ''} remaining today
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
