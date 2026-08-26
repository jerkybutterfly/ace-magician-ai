import { useState, useEffect } from 'react';
import { graphStats, graphQuery, ingestText, clearGraph, type GraphNode, type GraphEdge } from '@/lib/graphrag';
import { listSkills, getRecentAttempts, autoLearn, needsAutoLearn, type SkillModule } from '@/lib/auto-learn';
import { perceiveScreen, perceiveEnvironment, type PerceptionResult } from '@/lib/multimodal';
import { getCurrentState, resetState, buildStateContext, setMission, type StateSnapshot } from '@/lib/state-manager';
import { analyzeComplexity, getComputeStats, planExecution, type ComplexityProfile } from '@/lib/reasoning-scaler';

export default function CognitivePage() {
  const [activeTab, setActiveTab] = useState<'graph' | 'learn' | 'modal' | 'state' | 'reason'>('graph');
  const [graphData, setGraphData] = useState<ReturnType<typeof graphStats> | null>(null);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<{ nodes: GraphNode[]; edges: GraphEdge[]; context: string; confidence: number } | null>(null);
  const [skills, setSkills] = useState<SkillModule[]>([]);
  const [attempts, setAttempts] = useState<ReturnType<typeof getRecentAttempts>>([]);
  const [learnInput, setLearnInput] = useState('');
  const [learnLoading, setLearnLoading] = useState(false);
  const [screenPerception, setScreenPerception] = useState<PerceptionResult | null>(null);
  const [screenLoading, setScreenLoading] = useState(false);
  const [stateSnapshot, setStateSnapshot] = useState<StateSnapshot | null>(null);
  const [missionInput, setMissionInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [reasonProfile, setReasonProfile] = useState<ComplexityProfile | null>(null);
  const [computeStats, setComputeStats] = useState<ReturnType<typeof getComputeStats> | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  function refreshData() {
    setGraphData(graphStats());
    setSkills(listSkills());
    setAttempts(getRecentAttempts(10));
    setStateSnapshot(getCurrentState());
    setComputeStats(getComputeStats());
  }

  function handleGraphQuery() {
    if (!queryText.trim()) return;
    const result = graphQuery(queryText);
    setQueryResult(result);
  }

  function handleIngest() {
    if (!queryText.trim()) return;
    const result = ingestText(queryText);
    alert(`Ingested: ${result.nodesAdded} nodes, ${result.edgesAdded} edges`);
    refreshData();
  }

  async function handleAutoLearn() {
    if (!learnInput.trim()) return;
    setLearnLoading(true);
    try {
      await autoLearn(learnInput);
      refreshData();
    } catch (e) {
      alert(`Auto-learn failed: ${e}`);
    }
    setLearnLoading(false);
  }

  async function handleScreenPerceive() {
    setScreenLoading(true);
    try {
      const result = await perceiveScreen();
      setScreenPerception(result);
    } catch (e) {
      alert(`Screen perception failed: ${e}`);
    }
    setScreenLoading(false);
  }

  function handleSetMission() {
    if (!missionInput.trim()) return;
    setMission(missionInput);
    setStateSnapshot(getCurrentState());
  }

  function handleReason() {
    if (!reasonInput.trim()) return;
    const profile = analyzeComplexity(reasonInput);
    setReasonProfile(profile);
  }

  const tabs = [
    { id: 'graph' as const, label: '🧠 GraphRAG', color: 'from-purple-500 to-blue-600' },
    { id: 'learn' as const, label: '📚 Auto-Learn', color: 'from-green-500 to-emerald-600' },
    { id: 'modal' as const, label: '👁️ Multi-Modal', color: 'from-orange-500 to-red-600' },
    { id: 'state' as const, label: '📋 State Manager', color: 'from-cyan-500 to-blue-600' },
    { id: 'reason' as const, label: '⚡ Reasoning', color: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🧠 Cognitive Systems
          </h1>
          <p className="text-gray-400 mt-2">Advanced AI capabilities: Graph Memory, Auto-Learning, Multi-Modal Perception, State Management, and Adaptive Reasoning</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GraphRAG Tab */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Graph Memory</h2>
              
              {/* Stats */}
              {graphData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{graphData.totalNodes}</div>
                    <div className="text-sm text-gray-400">Nodes</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{graphData.totalEdges}</div>
                    <div className="text-sm text-gray-400">Edges</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{Object.keys(graphData.nodesByType).length}</div>
                    <div className="text-sm text-gray-400">Node Types</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">{Object.keys(graphData.edgesByType).length}</div>
                    <div className="text-sm text-gray-400">Edge Types</div>
                  </div>
                </div>
              )}

              {/* Most Accessed */}
              {graphData && graphData.mostAccessed.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Most Accessed Nodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {graphData.mostAccessed.map((n, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-900/30 rounded-full text-sm">
                        {n.label} <span className="text-gray-500">({n.type})</span> ×{n.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Query */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Query the graph memory..."
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGraphQuery()}
                />
                <button
                  onClick={handleGraphQuery}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500"
                >
                  Query
                </button>
                <button
                  onClick={handleIngest}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
                >
                  Ingest
                </button>
                <button
                  onClick={() => { clearGraph(); refreshData(); }}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                >
                  Clear
                </button>
              </div>

              {/* Query Result */}
              {queryResult && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Confidence:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${queryResult.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">{(queryResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-4 mb-2 text-sm">
                    <span className="text-purple-400">{queryResult.nodes.length} nodes</span>
                    <span className="text-blue-400">{queryResult.edges.length} edges</span>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 rounded p-3 mt-2 max-h-64 overflow-y-auto">
                    {queryResult.context || 'No matching context found'}
                  </pre>
                </div>
              )}

              {/* Node Types Distribution */}
              {graphData && Object.keys(graphData.nodesByType).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Node Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(graphData.nodesByType).map(([type, count]) => (
                      <span key={type} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">📚 Auto-Learning Toolkit</h2>
              
              {/* Auto-learn input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Enter a tool/API to learn (e.g., 'puppeteer', 'redis', 'tensorflow')"
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAutoLearn()}
                />
                <button
                  onClick={handleAutoLearn}
                  disabled={learnLoading}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 disabled:opacity-50"
                >
                  {learnLoading ? 'Learning...' : '🧠 Auto-Learn'}
                </button>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Learned Skills ({skills.length})</h3>
                {skills.length === 0 ? (
                  <p className="text-gray-500 text-sm">No skills learned yet. Try auto-learning a tool above.</p>
                ) : (
                  <div className="grid gap-3">
                    {skills.map((skill) => (
                      <div key={skill.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{skill.name}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              skill.verified ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {skill.verified ? '✓ Verified' : '⚠ Unverified'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Used {skill.use_count}× | {skill.language}
                          </div>
                        </div>
                        <pre className="mt-2 text-xs text-gray-400 bg-gray-900 rounded p-2 max-h-24 overflow-y-auto font-mono">
                          {skill.code.slice(0, 300)}...
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Attempts */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Learning Attempts</h3>
                {attempts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No attempts yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          attempt.phase === 'done' ? 'bg-green-900/50 text-green-400' :
                          attempt.phase === 'failed' ? 'bg-red-900/50 text-red-400' :
                          'bg-blue-900/50 text-blue-400'
                        }`}>
                          {attempt.phase}
                        </span>
                        <span className="font-medium">{attempt.tool_name}</span>
                        <span className="text-sm text-gray-400 ml-auto">
                          {attempt.docs_found.length} docs found
                        </span>
                        {attempt.test_result && (
                          <span className={`text-sm ${attempt.test_result.ok ? 'text-green-400' : 'text-yellow-400'}`}>
                            {attempt.test_result.ok ? '✓ Tests passed' : '⚠ Tests had issues'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Modal Tab */}
        {activeTab === 'modal' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">👁️ Multi-Modal Perception</h2>
              
              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleScreenPerceive}
                  disabled={screenLoading}
                  className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-500 disabled:opacity-50"
                >
                  {screenLoading ? 'Perceiving...' : '📸 Capture Screen'}
                </button>
                <button
                  onClick={async () => {
                    const result = await perceiveEnvironment();
                    alert(result.summary);
                  }}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                >
                  🌍 Full Environment Scan
                </button>
              </div>

              {screenPerception && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Screen Perception</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${screenPerception.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">{(screenPerception.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 rounded p-3 max-h-48 overflow-y-auto">
                    {screenPerception.summary}
                  </pre>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-400">
                <p>Multi-modal perception enables the agent to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>See and understand the current screen state</li>
                  <li>Analyze images and documents natively</li>
                  <li>Detect audio tone and urgency</li>
                  <li>Process PDFs, spreadsheets, and structured files</li>
                  <li>Maintain live environment awareness</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* State Manager Tab */}
        {activeTab === 'state' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">📋 Executive Summary Agent</h2>
              
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">Set Mission</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    placeholder="Describe the current mission..."
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetMission()}
                  />
                  <button
                    onClick={handleSetMission}
                    className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500"
                  >
                    Set
                  </button>
                  <button
                    onClick={() => { resetState(); setStateSnapshot(getCurrentState()); }}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Current State */}
              {stateSnapshot && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium">Progress:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${stateSnapshot.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">{stateSnapshot.progress}%</span>
                  </div>

                  {stateSnapshot.mission && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-400">Mission:</span>
                      <p className="text-white">{stateSnapshot.mission}</p>
                    </div>
                  )}

                  {stateSnapshot.objectives.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-400">Objectives:</span>
                      <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                        {stateSnapshot.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stateSnapshot.blockers.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-400">Blockers:</span>
                      <ul className="list-disc list-inside text-sm text-red-400 mt-1">
                        {stateSnapshot.blockers.map((b, i) => (
                          <li key={i}>⚠️ {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stateSnapshot.compressed_history && (
                    <div>
                      <span className="text-sm text-gray-400">Compressed Context:</span>
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 rounded p-3 mt-1 max-h-32 overflow-y-auto">
                        {stateSnapshot.compressed_history}
                      </pre>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Last compressed: {new Date(stateSnapshot.timestamp).toLocaleTimeString()} | 
                    {stateSnapshot.raw_step_count} raw steps → {stateSnapshot.token_estimate} tokens
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reasoning Tab */}
        {activeTab === 'reason' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">⚡ Adaptive Reasoning</h2>
              
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">Analyze Task Complexity</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Enter a task to analyze complexity..."
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleReason()}
                  />
                  <button
                    onClick={handleReason}
                    className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-500"
                  >
                    Analyze
                  </button>
                </div>
              </div>

              {reasonProfile && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className={`text-lg font-bold ${
                        reasonProfile.level === 'expert' ? 'text-red-400' :
                        reasonProfile.level === 'complex' ? 'text-orange-400' :
                        reasonProfile.level === 'moderate' ? 'text-yellow-400' :
                        reasonProfile.level === 'simple' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {reasonProfile.level}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Score</div>
                      <div className="text-lg font-bold text-white">{reasonProfile.score}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Thinking Tokens</div>
                      <div className="text-lg font-bold text-purple-400">{reasonProfile.thinking_tokens.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Model Pref</div>
                      <div className="text-lg font-bold text-blue-400">{reasonProfile.model_preference}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Timeout</div>
                      <div className="text-lg font-bold text-gray-300">{reasonProfile.timeout_ms / 1000}s</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compute Stats */}
              {computeStats && (
                <div className="mt-6 bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Compute Usage</h3>
                  <p className="text-sm text-gray-300">{computeStats.display}</p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-400">
                <p>Adaptive reasoning scales compute based on task complexity:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><span className="text-gray-300">Trivial</span> — No thinking tokens, instant response</li>
                  <li><span className="text-green-400">Simple</span> — 128 thinking tokens, fast model</li>
                  <li><span className="text-yellow-400">Moderate</span> — 512 thinking tokens, balanced model</li>
                  <li><span className="text-orange-400">Complex</span> — 2,048 thinking tokens, deep reasoning model</li>
                  <li><span className="text-red-400">Expert</span> — 4,096 thinking tokens, reasoning-focused model</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
