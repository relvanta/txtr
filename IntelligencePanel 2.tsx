// IntelligencePanel.tsx
// Replaces the separate Validator + Completeness tabs.
// Philosophy: observations first → inferences second → contradictions flagged →
//             known unknowns surfaced → human applies what they trust.

import React, { useState } from 'react';
import {
  Eye, Brain, AlertTriangle, HelpCircle, Check, CheckCircle2,
  RefreshCw, Sparkles, ChevronDown, ChevronUp, ShieldCheck,
  ShieldAlert, Target, Layers, Tag, FolderOpen, Link, GitBranch,
  FileText, Image, Globe, Circle, XCircle, Info,
} from 'lucide-react';
import type { Project, AISettings, StatusValidation } from './types';
import {
  InventoryIntent, InventoryStage,
  INVENTORY_INTENT_LABELS, INVENTORY_STAGE_LABELS,
  INVENTORY_INTENT_SHORT, INVENTORY_STAGE_SHORT,
  INVENTORY_INTENT_COLORS, INVENTORY_STAGE_COLORS,
} from './types';
import { STATUS_VALIDATION_PROMPT } from './constants';
import { generateContent } from './services/groqService';

// ─── types ────────────────────────────────────────────────────────────────────

interface Observation {
  label: string;
  value: boolean;
  icon: React.ElementType;
  note?: string;
}

interface Contradiction {
  claim: string;
  conflicts: string[];
}

interface InferenceItem {
  label: string;
  value: string;
  confidence: number; // 0-1
  reasoning: string;
  badgeCls?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildObservations(p: Project): Observation[] {
  return [
    { label: 'Has description', value: (p.description || '').length > 40, icon: FileText,
      note: (p.description || '').length <= 40 ? 'Too short to be meaningful' : undefined },
    { label: 'Has live URL', value: !!p.liveUrl, icon: Globe },
    { label: 'Has repository', value: !!p.repository, icon: GitBranch },
    { label: 'Has tags', value: (p.tags || []).length >= 2, icon: Tag,
      note: (p.tags || []).length < 2 ? 'Fewer than 2 tags' : undefined },
    { label: 'Has category', value: !!(p.category), icon: FolderOpen },
    { label: 'Has screenshots / images', value: (p.images || []).length > 0, icon: Image },
    { label: 'Has README', value: !!(p.aiGenerated?.readme || p.docs?.readme), icon: FileText },
    { label: 'Has technical audit', value: !!(p.docs?.technicalAudit), icon: ShieldCheck },
    { label: 'Has executive brief', value: !!(p.docs?.executiveBrief), icon: Brain },
    { label: 'Intent is set', value: !!(p.inventoryIntent), icon: Target },
    { label: 'Stage is set', value: !!(p.inventoryStage), icon: Layers },
  ];
}

function detectContradictions(p: Project): Contradiction[] {
  const issues: Contradiction[] = [];

  if (p.inventoryStage === InventoryStage.Shipped && !p.liveUrl) {
    issues.push({
      claim: 'Stage = shipped',
      conflicts: ['No live URL detected — a shipped project should be accessible somewhere'],
    });
  }

  if (p.inventoryIntent === InventoryIntent.Monetize && !(p.docs?.commercialNotes) && !p.strategy?.notes) {
    issues.push({
      claim: 'Intent = monetize',
      conflicts: ['No commercial notes or pricing strategy found — monetize intent needs a model'],
    });
  }

  if (
    (p.inventoryStage === InventoryStage.Shippable || p.inventoryStage === InventoryStage.Shipped) &&
    (p.description || '').length < 80
  ) {
    issues.push({
      claim: `Stage = ${p.inventoryStage}`,
      conflicts: ['Description is too short — a publishable project needs a clear description'],
    });
  }

  if (p.inventoryIntent === InventoryIntent.Publish && !p.repository && !p.liveUrl) {
    issues.push({
      claim: 'Intent = publish',
      conflicts: ['No repository or live URL — nothing is publicly accessible yet'],
    });
  }

  return issues;
}

function buildKnownUnknowns(p: Project): string[] {
  const unknowns: string[] = [];
  if (!p.liveUrl) unknowns.push('Deployment stability unknown — no live URL to verify');
  if (!p.repository) unknowns.push('Code quality unknown — no repository accessible');
  if (!(p.docs?.technicalAudit)) unknowns.push('Technical debt level has not been assessed');
  if (!p.images?.length) unknowns.push('No screenshots — visual state of the product unknown');
  if (!(p.docs?.executiveBrief)) unknowns.push('Target buyer has not been defined');
  unknowns.push('Security audit: never assessed');
  unknowns.push('Real-world scalability: untested');
  unknowns.push('User feedback: none recorded');
  return unknowns;
}

function getConfidenceColor(c: number): string {
  if (c >= 0.7) return 'text-green-600 bg-green-50 border-green-200';
  if (c >= 0.45) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-500 bg-red-50 border-red-200';
}

function ConfidencePip({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls = value >= 0.7 ? 'bg-green-500' : value >= 0.45 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`${cls} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-bold ${value >= 0.7 ? 'text-green-600' : value >= 0.45 ? 'text-amber-500' : 'text-red-500'}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── section wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconCls?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon: Icon, title, subtitle, iconCls = 'text-gray-400', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className={iconCls} />
          <span className="text-xs font-bold text-gray-700">{title}</span>
          <span className="text-[10px] text-gray-400">{subtitle}</span>
        </div>
        {open ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
      </button>
      {open && <div className="p-3 space-y-2 bg-white">{children}</div>}
    </div>
  );
};

// ─── apply row ─────────────────────────────────────────────────────────────────

const ApplyRow: React.FC<{
  label: string;
  icon: React.ElementType;
  current: string;
  suggested: string;
  rationale?: string;
  applied: boolean;
  onApply: () => void;
  badgeCls?: string;
}> = ({ label, icon: Icon, current, suggested, rationale, applied, onApply, badgeCls }) => {
  const [showReason, setShowReason] = useState(false);
  const different = suggested && suggested !== current;
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
          <Icon size={10} /> {label}
        </span>
        {different && !applied && (
          <button onClick={onApply}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100">
            <Check size={9} /> Apply
          </button>
        )}
        {applied && <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={10}/> Applied</span>}
        {!different && <span className="text-[10px] text-gray-400 italic">no change</span>}
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-400 w-16 shrink-0">Current:</span>
        <span className="text-gray-600 font-mono">{current || '—'}</span>
      </div>
      {different && (
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-gray-400 w-16 shrink-0">Suggested:</span>
          {badgeCls
            ? <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeCls}`}>{suggested}</span>
            : <span className="text-gray-800 font-semibold">{suggested}</span>
          }
        </div>
      )}
      {rationale && (
        <button onClick={() => setShowReason(v => !v)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mt-0.5">
          <Info size={9}/> {showReason ? 'Hide' : 'Show'} reasoning
          {showReason ? <ChevronUp size={9}/> : <ChevronDown size={9}/>}
        </button>
      )}
      {rationale && showReason && (
        <p className="text-[11px] text-gray-600 leading-relaxed bg-white rounded-lg px-2.5 py-2 border border-gray-100">
          {rationale}
        </p>
      )}
    </div>
  );
};

// ─── main component ────────────────────────────────────────────────────────────

interface Props {
  project: Project;
  settings: AISettings;
  onUpdateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => void;
  addToast: (msg: string, type: 'success' | 'error') => void;
}

export const IntelligencePanel: React.FC<Props> = ({ project, settings, onUpdateProject, addToast }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<StatusValidation | null>(project.statusValidation || null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState({ tags: false, category: false, status: false, intent: false, stage: false });

  const observations = buildObservations(project);
  const contradictions = detectContradictions(project);
  const unknowns = buildKnownUnknowns(project);

  const passedObs = observations.filter(o => o.value);
  const failedObs = observations.filter(o => !o.value);

  // Confidence derived from observations (deterministic, no AI)
  const obsScore = passedObs.length / observations.length;

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setApplied({ tags: false, category: false, status: false, intent: false, stage: false });
    try {
      const raw = await generateContent(STATUS_VALIDATION_PROMPT(project), settings, 'Content Generation', { responseMimeType: 'application/json' });
      const clean = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      const validation: StatusValidation = {
        validatedAt: new Date().toISOString(),
        isValid: parsed.isValid ?? true,
        aiVerdict: parsed.aiVerdict ?? '',
        suggestedTags: parsed.suggestedTags || [],
        suggestedCategory: parsed.suggestedCategory || null,
        suggestedStatus: parsed.suggestedStatus || null,
        suggestedIntent: parsed.suggestedIntent as InventoryIntent || null,
        suggestedStage: parsed.suggestedStage as InventoryStage || null,
        intentRationale: parsed.intentRationale || null,
        stageRationale: parsed.stageRationale || null,
      };
      setResult(validation);
      onUpdateProject(project.id, { statusValidation: validation });
      addToast('Intelligence review complete', 'success');
    } catch (e) {
      setError((e as Error).message);
      addToast('Review failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Apply helpers
  const applyAll = () => {
    if (!result) return;
    const patch: Partial<Project> = {};
    if (result.suggestedTags?.length) patch.tags = [...new Set([...project.tags, ...result.suggestedTags])];
    if (result.suggestedCategory) patch.category = result.suggestedCategory;
    if (result.suggestedStatus) patch.status = result.suggestedStatus as any;
    if (result.suggestedIntent) patch.inventoryIntent = result.suggestedIntent;
    if (result.suggestedStage) patch.inventoryStage = result.suggestedStage;
    if (Object.keys(patch).length) {
      onUpdateProject(project.id, patch);
      setApplied({ tags: true, category: true, status: true, intent: true, stage: true });
      addToast('All suggestions applied', 'success');
    }
  };

  const currentIntent = project.inventoryIntent ? INVENTORY_INTENT_SHORT[project.inventoryIntent] : '—';
  const currentStage = project.inventoryStage ? INVENTORY_STAGE_SHORT[project.inventoryStage] : '—';

  const hasSuggestions = result && (
    result.suggestedIntent || result.suggestedStage ||
    (result.suggestedTags?.length ?? 0) > 0 ||
    result.suggestedCategory || result.suggestedStatus
  );

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Brain size={14} className="text-indigo-500" /> Intelligence Review
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Observations first. Inferences second. You decide what to trust.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isRunning ? <Sparkles size={12} className="animate-spin" /> : result ? <RefreshCw size={12} /> : <Sparkles size={12} />}
          {isRunning ? 'Reviewing…' : result ? 'Re-run' : 'Run Review'}
        </button>
      </div>

      {/* 1 — OBSERVATIONS */}
      <Section icon={Eye} title="Observations" subtitle={`${passedObs.length}/${observations.length} present`} iconCls="text-blue-500">
        <div className="grid grid-cols-1 gap-1">
          {observations.map(o => (
            <div key={o.label} className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg ${o.value ? 'text-gray-700' : 'text-gray-400'}`}>
              {o.value
                ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                : <Circle size={11} className="text-gray-300 shrink-0" />
              }
              <span className="flex-grow">{o.label}</span>
              {o.note && <span className="text-[10px] text-amber-500 italic">{o.note}</span>}
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Observable completeness</span>
            <span className="font-bold">{Math.round(obsScore * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${obsScore >= 0.7 ? 'bg-green-500' : obsScore >= 0.45 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${Math.round(obsScore * 100)}%` }}
            />
          </div>
        </div>
      </Section>

      {/* 2 — CONTRADICTIONS */}
      {contradictions.length > 0 && (
        <Section icon={AlertTriangle} title="Contradictions" subtitle={`${contradictions.length} detected`} iconCls="text-amber-500">
          {contradictions.map((c, i) => (
            <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 space-y-1.5">
              <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
                <XCircle size={11} /> Claimed: {c.claim}
              </p>
              {c.conflicts.map((f, j) => (
                <p key={j} className="text-[11px] text-amber-600 flex items-start gap-1.5 pl-4">
                  <span className="shrink-0 mt-0.5">↳</span> {f}
                </p>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* 3 — AI INFERENCES (only after run) */}
      {result && (
        <Section icon={Brain} title="AI Inferences" subtitle="Based on your project description and metadata" iconCls="text-indigo-500">
          <div className={`rounded-xl border p-3 mb-2 ${result.isValid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-2">
              {result.isValid
                ? <ShieldCheck size={13} className="text-green-600 shrink-0 mt-0.5" />
                : <ShieldAlert size={13} className="text-amber-600 shrink-0 mt-0.5" />
              }
              <p className="text-[11px] text-gray-700 leading-relaxed">{result.aiVerdict}</p>
            </div>
          </div>

          {/* Confidence note */}
          <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-lg border border-gray-100 mb-2">
            <Info size={11} className="text-gray-400 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Confidence below reflects how much observable evidence supports each inference.
              Low confidence = human judgment needed.
            </p>
          </div>

          {/* Intent inference */}
          {result.suggestedIntent && (
            <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><Target size={10}/> Intent</span>
                <ConfidencePip value={obsScore * 0.8 + 0.1} />
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400 w-16 shrink-0">Suggested:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${INVENTORY_INTENT_COLORS[result.suggestedIntent]}`}>
                  {INVENTORY_INTENT_SHORT[result.suggestedIntent]}
                </span>
              </div>
              {result.intentRationale && (
                <p className="text-[10px] text-gray-500 leading-relaxed pl-1">{result.intentRationale}</p>
              )}
            </div>
          )}

          {/* Stage inference */}
          {result.suggestedStage && (
            <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><Layers size={10}/> Stage</span>
                <ConfidencePip value={result.isValid ? 0.65 : 0.4} />
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400 w-16 shrink-0">Suggested:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${INVENTORY_STAGE_COLORS[result.suggestedStage]}`}>
                  {INVENTORY_STAGE_SHORT[result.suggestedStage]}
                </span>
              </div>
              {result.stageRationale && (
                <p className="text-[10px] text-gray-500 leading-relaxed pl-1">{result.stageRationale}</p>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-300 pt-1">
            Reviewed {new Date(result.validatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </Section>
      )}

      {/* 4 — SUGGESTIONS (apply) */}
      {result && hasSuggestions && (
        <Section icon={Check} title="Apply Suggestions" subtitle="Human-controlled" iconCls="text-green-500" defaultOpen={false}>
          <div className="flex justify-end mb-1">
            <button onClick={applyAll}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100">
              <Check size={10}/> Apply All
            </button>
          </div>

          {result.suggestedIntent && (
            <ApplyRow label="Intent" icon={Target} current={currentIntent}
              suggested={INVENTORY_INTENT_SHORT[result.suggestedIntent]}
              rationale={result.intentRationale || undefined}
              applied={applied.intent}
              onApply={() => { onUpdateProject(project.id, { inventoryIntent: result.suggestedIntent! }); setApplied(a => ({ ...a, intent: true })); addToast('Intent updated', 'success'); }}
              badgeCls={INVENTORY_INTENT_COLORS[result.suggestedIntent]}
            />
          )}

          {result.suggestedStage && (
            <ApplyRow label="Stage" icon={Layers} current={currentStage}
              suggested={INVENTORY_STAGE_SHORT[result.suggestedStage]}
              rationale={result.stageRationale || undefined}
              applied={applied.stage}
              onApply={() => { onUpdateProject(project.id, { inventoryStage: result.suggestedStage! }); setApplied(a => ({ ...a, stage: true })); addToast('Stage updated', 'success'); }}
              badgeCls={INVENTORY_STAGE_COLORS[result.suggestedStage]}
            />
          )}

          {result.suggestedCategory && result.suggestedCategory !== project.category && (
            <ApplyRow label="Category" icon={FolderOpen} current={project.category || '—'}
              suggested={result.suggestedCategory} applied={applied.category}
              onApply={() => { onUpdateProject(project.id, { category: result.suggestedCategory! }); setApplied(a => ({ ...a, category: true })); addToast('Category updated', 'success'); }}
            />
          )}

          {(result.suggestedTags?.length ?? 0) > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><Tag size={10}/> Suggested tags</span>
                {!applied.tags
                  ? <button onClick={() => { const merged = [...new Set([...project.tags, ...(result.suggestedTags||[])])]; onUpdateProject(project.id, { tags: merged }); setApplied(a => ({ ...a, tags: true })); addToast('Tags merged', 'success'); }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100">
                      <Check size={9}/> Merge
                    </button>
                  : <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={10}/> Applied</span>
                }
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.suggestedTags!.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full border border-indigo-100">{t}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 5 — KNOWN UNKNOWNS */}
      <Section icon={HelpCircle} title="Known Unknowns" subtitle="Things this system cannot evaluate" iconCls="text-gray-400" defaultOpen={false}>
        <div className="space-y-1">
          {unknowns.map((u, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500 px-1">
              <span className="mt-0.5 shrink-0 w-1 h-1 rounded-full bg-gray-300 mt-1.5" />
              {u}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-300 pt-2 border-t border-gray-100">
          These gaps don't mean the project is weak — they mean the record is incomplete.
        </p>
      </Section>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span className="font-mono break-all">{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!result && !isRunning && (
        <div className="text-center py-8 space-y-2">
          <Brain size={28} className="text-gray-200 mx-auto" />
          <p className="text-xs text-gray-400">
            Observations above are always live. Run a review to get AI inferences and suggestions.
          </p>
        </div>
      )}
    </div>
  );
};

export default IntelligencePanel;
