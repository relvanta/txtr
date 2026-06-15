import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
Search, Plus, Download, X, Sparkles, FileText, BrainCircuit, Lightbulb, TrendingUp,
BarChart, Settings, Trash2, Filter, ChevronDown, Github, ExternalLink, CheckCircle, AlertTriangle, Eye, Copy, Heart, Pencil, Send, ArrowLeft,
TextCursorInput, Link as LinkIcon, Folder, Boxes, FilePlus, Bot, LogOut,
BarChart3, Shield, DollarSign, Activity, LayoutGrid, Trello, FileCode,
GitMerge, GitBranchPlus, Zap, Target, ArrowRight, Layers, Database, ListFilter, Package, Info,
ShieldCheck, Wand2,
} from 'lucide-react';
import {
ProjectStatus, ProjectType, type Project, type AISettings, type AIAction,
type ToastMessage, type ChatMessage, type AIExpert, type AITask,
AIProvider, MonetizationModel, Strategy, OpenSpec, OpenSpecChange,
OpenSpecStatus, ProjectIntent, PROJECT_INTENT_LABELS, EXTERNALIZER_ELIGIBLE_INTENTS,
ItemStage, ITEM_STAGE_LABELS, ExternalizationStatus, RecommendedRoute,
type ExternalizerScore, type ExternalizerOS, type RuntimeApiKeys, RUNTIME_KEYS_STORAGE_KEY,
InventoryIntent, InventoryStage,
INVENTORY_INTENT_LABELS, INVENTORY_STAGE_LABELS,
INVENTORY_INTENT_SHORT, INVENTORY_STAGE_SHORT,
INVENTORY_INTENT_COLORS, INVENTORY_STAGE_COLORS,
} from './types';
import SystemCardPanel from './SystemCardPanel';
import RelvantaExportPanel from './RelvantaExportPanel';
import HandoffPipelinePanel from './HandoffPipelinePanel';
import InfoModal from './InfoModal';
import ExportManagerModal from './ExportManagerModal';
import IntelligencePanel from './IntelligencePanel';
import MediaPromptsPanel from './MediaPromptsPanel';
import { Globe } from 'lucide-react'; // add Globe to existing lucide import line
import {
LOCAL_STORAGE_SETTINGS_KEY, PROJECT_TYPES, PROJECT_STATUSES, AI_PROMPT_TEMPLATES,
AI_EXPERT_ROLES, AI_PARSE_PROMPT_TEMPLATE, IMAGE_GENERATION_PROMPT_TEMPLATE,
INITIAL_AI_SETTINGS, CONFIGURABLE_AI_TASKS, AI_PROVIDERS, MONETIZATION_MODELS,
INITIAL_OPEN_SPEC, OPEN_SPEC_FROM_PROJECT_TEMPLATE, OPEN_SPEC_PROPOSAL_GENERATION_TEMPLATE,
PROJECT_INTENTS, ITEM_STAGES, EXTERNALIZATION_STATUSES, RECOMMENDED_ROUTES,
EXTERNALIZER_SCORE_FIELDS, EXTERNALIZER_SCORE_MAX, computeExternalizerScore,
STAGE_COLORS, INTENT_COLORS, EXTERNALIZER_SCORE_GENERATION_TEMPLATE,
EXTERNALIZATION_FILE_GENERATION_TEMPLATE, GENERATE_EXTERNALIZATION_MD,
} from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { generateContent, generateImage, saveRuntimeKeys, loadRuntimeKeys, fetchGroqModels } from './services/groqService';
import { useAuth } from './hooks/useAuth';
import { signInWithGoogle, signOutUser } from './firebase';
import { addProject, deleteProject, subscribeToProjects, updateProject } from './services/firestoreService';

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const calculateStrategyScore = (strategy: Partial<Strategy> = {}): number => {
const { revenuePotential = 0, easeOfBuild = 0, marketValidation = 0 } = strategy;
return Math.round(((Number(revenuePotential) * 1.5) + (Number(marketValidation) * 1.2)) * Number(easeOfBuild));
};

const getPlaceholderImageUrl = (text: string) =>
`https://placehold.co/800x450/9ca3af/ffffff?text=${encodeURIComponent(text)}`;

const downloadFile = (content: string, filename: string, mimeType = 'text/plain') => {
const a = document.createElement('a');
a.href = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
a.download = filename;
a.click();
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────

const Modal: React.FC<{
isOpen: boolean; onClose: () => void; children: React.ReactNode;
title: string; size?: 'lg' | '2xl' | '4xl';
}> = ({ isOpen, onClose, children, title, size = 'lg' }) => {
if (!isOpen) return null;
const sizeClass = { lg: 'max-w-lg', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl' }[size];
return (
<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
<div className={`bg-white rounded-3xl shadow-2xl w-full ${sizeClass} relative overflow-hidden border border-gray-100`} onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between p-6 border-b border-gray-100">
<h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
<button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"><X size={20} /></button>
</div>
<div>{children}</div>
</div>
</div>
);
};

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
useEffect(() => {
const t = setTimeout(() => onDismiss(toast.id), 5000);
return () => clearTimeout(t);
}, [toast.id, onDismiss]);
const ok = toast.type === 'success';
const Icon = ok ? CheckCircle : AlertTriangle;
return (
<div className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border w-full max-w-sm text-white ${ok ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-500 border-red-600'}`}>
<Icon size={24} />
<p className="font-medium">{toast.message}</p>
<button onClick={() => onDismiss(toast.id)} className="ml-auto p-1 rounded-full hover:bg-white/20"><X size={18} /></button>
</div>
);
};

const ImageLoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => (

  <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
    <Sparkles className="text-indigo-400 animate-spin" style={{ width: size, height: size }} />
  </div>
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }> = ({ loading, children, className = '', ...props }) => (
<button {...props} className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
{loading && <Sparkles size={16} className="animate-spin" />}
{children}
</button>
);

const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900';

// ─── PROJECT FORM MODAL ────────────────────────────────────────────────────────

type CreateProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'aiGenerated' | 'isHearted' | 'userId'>;

const BLANK_FORM: CreateProjectData = {
name: '', description: '', type: ProjectType.Website, intent: ProjectIntent.Experiment,
category: '', status: ProjectStatus.Idea, isPublic: false, tags: [],
repository: '', liveUrl: '', images: [''],
strategy: { model: MonetizationModel.NotMonetized, revenuePotential: 5, easeOfBuild: 5, marketValidation: 5, notes: '' },
};

const ProjectFormModal: React.FC<{
isOpen: boolean; onClose: () => void;
onSave: (data: CreateProjectData, id: string | null) => void;
projectToEdit: Project | null; onBulkImport: (file: File) => void;
addToast: (msg: string, type: 'success' | 'error') => void; settings: AISettings;
}> = ({ isOpen, onClose, onSave, projectToEdit, onBulkImport, addToast, settings }) => {
const [formData, setFormData] = useState<CreateProjectData>(BLANK_FORM);
const [activeTab, setActiveTab] = useState<'manual' | 'url' | 'local' | 'bulk'>('manual');
const [url, setUrl] = useState('');
const [isParsing, setIsParsing] = useState(false);
const localRef = useRef<HTMLInputElement>(null);
const bulkRef = useRef<HTMLInputElement>(null);

useEffect(() => {
if (!isOpen) return;
if (projectToEdit) {
const { id, createdAt, updatedAt, aiGenerated, isHearted, userId, externalizer, openSpec, ...rest } = projectToEdit;
setFormData({ ...BLANK_FORM, ...rest, strategy: { ...BLANK_FORM.strategy, ...rest.strategy } });
} else {
setFormData(BLANK_FORM);
}
setActiveTab('manual');
setUrl('');
}, [isOpen, projectToEdit]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
const { name, value, type } = e.target;
setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
};

const handleStrategyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
const { name, value, type } = e.target;
setFormData(prev => ({ ...prev, strategy: { ...prev.strategy, [name]: type === 'range' ? parseInt(value, 10) : value } }));
};

const handleParse = async (content: string) => {
setIsParsing(true);
addToast('AI is analyzing the content...', 'success');
try {
const result = await generateContent(AI_PARSE_PROMPT_TEMPLATE(content, PROJECT_TYPES), settings, 'Content Parsing', { responseMimeType: 'application/json' });
if (!result) throw new Error('AI returned an empty response.');
const parsed = JSON.parse(result.replace(/`json\n?/, '').replace(/`$/, '').trim());
setFormData(prev => ({
...prev,
name: parsed.name || '',
description: parsed.description || '',
category: parsed.category || '',
tags: Array.isArray(parsed.tags) ? parsed.tags : [],
type: PROJECT_TYPES.includes(parsed.type) ? parsed.type : ProjectType.Website,
}));
addToast('Content parsed! Please review.', 'success');
setActiveTab('manual');
} catch (error) {
addToast(`AI parsing failed: ${(error as Error).message}`, 'error');
} finally {
setIsParsing(false);
}
};

const tabs = [
{ id: 'manual', label: 'Manually', icon: TextCursorInput },
{ id: 'url', label: 'From URL', icon: LinkIcon },
{ id: 'local', label: 'From Local File', icon: Folder },
{ id: 'bulk', label: 'Bulk Import', icon: Boxes },
];

return (
<Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Edit Project' : 'Create New Project'} size="2xl">
<div className="flex border-b border-gray-100">
{tabs.map(tab => (
<button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>
<tab.icon size={16} /><span>{tab.label}</span>
</button>
))}
</div>
<div className="p-6 relative">
{isParsing && (
<div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
<Sparkles className="animate-spin text-indigo-500" size={48} />
<p className="mt-4 font-semibold text-gray-700">AI is working its magic...</p>
</div>
)}

    {activeTab === 'manual' && (
      <form onSubmit={e => { e.preventDefault(); onSave(formData, projectToEdit?.id ?? null); onClose(); }} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" name="category" value={formData.category} onChange={handleChange} required className={inputCls} /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} required className={inputCls} /></div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intent <span className="text-xs text-gray-400 font-normal">(gates available features)</span></label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(ProjectIntent).map(intent => (
              <button key={intent} type="button" onClick={() => setFormData(prev => ({ ...prev, intent }))}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-left ${formData.intent === intent ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                {PROJECT_INTENT_LABELS[intent]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Intent
              <span className="text-xs text-gray-400 font-normal ml-1">(what do you want to do with this?)</span>
            </label>
            <select
              value={formData.inventoryIntent || ''}
              onChange={e => setFormData(prev => ({ ...prev, inventoryIntent: e.target.value as InventoryIntent || undefined }))}
              className={inputCls}
            >
              <option value="">— not set —</option>
              {Object.values(InventoryIntent).map(v => (
                <option key={v} value={v}>{INVENTORY_INTENT_LABELS[v]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Stage
              <span className="text-xs text-gray-400 font-normal ml-1">(how real is it actually?)</span>
            </label>
            <select
              value={formData.inventoryStage || ''}
              onChange={e => setFormData(prev => ({ ...prev, inventoryStage: e.target.value as InventoryStage || undefined }))}
              className={inputCls}
            >
              <option value="">— not set —</option>
              {Object.values(InventoryStage).map(v => (
                <option key={v} value={v}>{INVENTORY_STAGE_LABELS[v]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label><select name="type" value={formData.type} onChange={handleChange} className={inputCls}>{PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="status" value={formData.status} onChange={handleChange} className={inputCls}>{PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags.join(', ')} onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))} className={inputCls} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Repository URL</label><input type="url" name="repository" value={formData.repository} onChange={handleChange} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label><input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} className={inputCls} /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="url" value={formData.images[0]} onChange={e => { const imgs = [...formData.images]; imgs[0] = e.target.value; setFormData(prev => ({ ...prev, images: imgs })); }} className={inputCls} /></div>

        {/* Monetization */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monetization Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><select name="model" value={formData.strategy?.model} onChange={handleStrategyChange} className={inputCls}>{MONETIZATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div className="flex flex-col items-center justify-center bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-lg p-2 text-center">
              <span className="text-sm font-bold text-indigo-800">Strategy Score</span>
              <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">{calculateStrategyScore(formData.strategy)}</span>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {(['revenuePotential', 'easeOfBuild', 'marketValidation'] as const).map(field => (
              <div key={field}>
                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <strong>{formData.strategy?.[field]}</strong>
                </label>
                <input type="range" name={field} min="1" max="10" value={formData.strategy?.[field] || 5} onChange={handleStrategyChange} className="w-full accent-indigo-600" />
              </div>
            ))}
          </div>
          <div className="mt-6"><label className="block text-sm font-medium text-gray-700 mb-1">Strategy Notes</label><textarea name="notes" value={formData.strategy?.notes || ''} onChange={handleStrategyChange} rows={3} placeholder="e.g., Competitors, target market, pricing ideas..." className={inputCls} /></div>
        </div>

        <div className="flex items-center pt-6 border-t border-gray-200">
          <input id="isPublic" name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-900">Is Public?</label>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
          <PrimaryButton type="submit">{projectToEdit ? 'Save Changes' : 'Create Project'}</PrimaryButton>
        </div>
      </form>
    )}

    {activeTab === 'url' && (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Enter a URL and AI will populate the project details for you.</p>
        <div className="flex gap-2">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/..." className={inputCls} />
          <PrimaryButton onClick={() => { if (!url) return addToast('Please enter a URL.', 'error'); handleParse(`Content from URL: ${url}. Analyze this project. For GitHub, analyze the README.`); }} disabled={isParsing}>Fetch & Analyze</PrimaryButton>
        </div>
      </div>
    )}

    {activeTab === 'local' && (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">Upload a text file (README.md, package.json, etc.) and AI will parse it.</p>
        <input type="file" ref={localRef} onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => handleParse(ev.target?.result as string); r.readAsText(f); } }} accept=".txt,.md,.json" className="hidden" />
        <PrimaryButton onClick={() => localRef.current?.click()} disabled={isParsing}>Select File</PrimaryButton>
      </div>
    )}

    {activeTab === 'bulk' && (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">Import multiple projects from a previously exported JSON file.</p>
        <input type="file" ref={bulkRef} onChange={e => { const f = e.target.files?.[0]; if (f) { onBulkImport(f); onClose(); } }} accept=".json" className="hidden" />
        <PrimaryButton onClick={() => bulkRef.current?.click()}>Import JSON</PrimaryButton>
      </div>
    )}
  </div>
</Modal>

);
};

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ProjectStatus, string> = {
[ProjectStatus.Idea]: 'bg-blue-100 text-blue-800',
[ProjectStatus.Ongoing]: 'bg-yellow-100 text-yellow-800',
[ProjectStatus.NearlyThere]: 'bg-purple-100 text-purple-800',
[ProjectStatus.Shipped]: 'bg-green-100 text-green-800',
};

const ProjectCard: React.FC<{
project: Project; onSelect: (p: Project) => void;
onToggleHeart: (id: string) => void; isGeneratingImage: boolean;
}> = ({ project, onSelect, onToggleHeart, isGeneratingImage }) => (

  <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col overflow-hidden cursor-pointer" onClick={() => onSelect(project)}>
    <div className="relative">
      <div className="w-full h-40">
        {isGeneratingImage ? <ImageLoadingSpinner /> : <img src={project.images[0] || getPlaceholderImageUrl(project.name)} alt={project.name} className="w-full h-full object-cover" />}
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleHeart(project.id); }} className="absolute top-3 right-3 p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors">
        <Heart size={20} className={project.isHearted ? 'text-red-500 fill-current' : 'text-gray-600'} />
      </button>
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-bold">
        <BarChart3 size={14} /><span>{calculateStrategyScore(project.strategy)}</span>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{project.name}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[project.status]}`}>{project.status}</span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 flex-grow">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.inventoryIntent && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${INVENTORY_INTENT_COLORS[project.inventoryIntent]}`}>
            {INVENTORY_INTENT_SHORT[project.inventoryIntent]}
          </span>
        )}
        {project.inventoryStage && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${INVENTORY_STAGE_COLORS[project.inventoryStage]}`}>
            {INVENTORY_STAGE_SHORT[project.inventoryStage]}
          </span>
        )}
        {project.intent && !project.inventoryIntent && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${INTENT_COLORS[project.intent] || 'bg-gray-100 text-gray-600'}`}>{PROJECT_INTENT_LABELS[project.intent]}</span>}
        {project.externalizer?.stage && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[project.externalizer.stage] || 'bg-gray-100 text-gray-600'}`}>{ITEM_STAGE_LABELS[project.externalizer.stage]}</span>}
        {project.externalizer?.externalized && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Externalized</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-md">{tag}</span>)}
        {project.tags.length > 3 && <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-md">+{project.tags.length - 3}</span>}
      </div>
    </div>
  </div>
);

// ─── EXTERNALIZER OS PANEL ────────────────────────────────────────────────────

const ExternalizerOSPanel: React.FC<{
project: Project;
onUpdateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => void;
addToast: (msg: string, type: 'success' | 'error') => void;
settings: AISettings;
handleExportContent: (content: string, filename: string) => void;
}> = ({ project, onUpdateProject, addToast, settings, handleExportContent }) => {
const ext = project.externalizer || { stage: ItemStage.Raw, externalized: false };
const score: ExternalizerScore = {
  pain: 0,
  clarity: 0,
  speed: 0,
  leverage: 0,
  transferability: 0,
  obsession: 0,
  ...(ext.score || {}),
};
const [isGeneratingScore, setIsGeneratingScore] = useState(false);
const [isGeneratingFile, setIsGeneratingFile] = useState(false);
const [localFile, setLocalFile] = useState<Partial<typeof ext.externalizationFile>>(ext.externalizationFile || {});
const [scoreReasoning, setScoreReasoning] = useState('');

useEffect(() => { setLocalFile(ext.externalizationFile || {}); }, [project.id]);
const getScoreColor = (value: number) => {
  if (value >= 8) return 'text-green-600';
  if (value >= 5) return 'text-yellow-600';
  return 'text-gray-400';
};
const computed = computeExternalizerScore(score);
const recommendation = getExternalizerRecommendation(computed);
const scorePct = Math.round((computed / EXTERNALIZER_SCORE_MAX) * 100);
const updateExt = (patch: Partial<ExternalizerOS>) => {
  onUpdateProject(project.id, {
    externalizer: {
      ...ext,
      ...patch,
    },
  });
};
const handleAIScore = async () => {
setIsGeneratingScore(true);
try {
const result = await generateContent(EXTERNALIZER_SCORE_GENERATION_TEMPLATE(project), settings, 'Externalizer Score Generation', { responseMimeType: 'application/json' });
const { reasoning, ...scoreFields } = JSON.parse(result.replace(/`json\n?/, '').replace(/`$/, '').trim());
const c = computeExternalizerScore(scoreFields);
updateExt({ score: { ...scoreFields, computed: c } });
if (reasoning) setScoreReasoning(reasoning);
addToast('AI score generated!', 'success');
} catch (e) { addToast('Score generation failed: ' + (e as Error).message, 'error'); }
finally { setIsGeneratingScore(false); }
};

const handleAIGenerateFile = async () => {
setIsGeneratingFile(true);
try {
const result = await generateContent(EXTERNALIZATION_FILE_GENERATION_TEMPLATE(project), settings, 'Externalization File Generation', { responseMimeType: 'application/json' });
const parsed = JSON.parse(result.replace(/`json\n?/, '').replace(/`$/, '').trim());
const newFile = { ...localFile, ...parsed };
setLocalFile(newFile);
updateExt({ externalizationFile: newFile });
addToast('Externalization file generated!', 'success');
} catch (e) { addToast('File generation failed: ' + (e as Error).message, 'error'); }
finally { setIsGeneratingFile(false); }
};

const checklistItems = [
{ label: 'Problem is clearly defined', done: !!localFile?.problem && localFile.problem.length > 20 },
{ label: 'Solution is demonstrable', done: !!localFile?.proof && localFile.proof.length > 10 },
{ label: 'Can be explained in <10 min', done: !!localFile?.insight && localFile.insight.length > 20 },
];

return (
<div className="p-4 space-y-5 overflow-y-auto h-full">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2"><Zap size={18} className="text-violet-600" /><h3 className="font-bold text-gray-900">Externalizer OS</h3></div>
<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${INTENT_COLORS[project.intent!] || 'bg-gray-100 text-gray-600'}`}>{PROJECT_INTENT_LABELS[project.intent!]}</span>
</div>

  {/* Stage */}
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stage</p>
    <div className="flex flex-wrap gap-1.5">
      {ITEM_STAGES.map(s => (
        <button key={s} onClick={() => updateExt({ stage: s as ItemStage })}
          className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${ext.stage === s ? STAGE_COLORS[s] + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
          {ITEM_STAGE_LABELS[s]}
        </button>
      ))}
    </div>
  </div>

  {/* Readiness checklist */}
  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Externalization Readiness</p>
    <div className="space-y-1.5">
      {checklistItems.map(item => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
            {item.done && <CheckCircle size={10} className="text-white" />}
          </div>
          <span className={`text-xs ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
        </div>
      ))}
    </div>
    {checklistItems.every(c => c.done) && (
      <button onClick={() => updateExt({ externalized: !ext.externalized })}
        className={`mt-3 w-full text-xs font-bold py-1.5 rounded-lg transition-colors ${ext.externalized ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
        {ext.externalized ? '✓ Marked as Externalized' : 'Mark as Externalized'}
      </button>
    )}
  </div>

  {/* Weighted score */}
  <div>
<div className="flex items-center justify-between mb-2">
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
    Weighted Score
  </p>

  <div className="flex items-center gap-2">
    <span className="text-lg font-extrabold text-violet-700">
      {computed}
      <span className="text-xs font-normal text-gray-400">
        /{EXTERNALIZER_SCORE_MAX}
      </span>
    </span>

    {/* 👇 NEW */}
    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 text-violet-700">
      {recommendation}
    </span>

    <button>...</button>
  </div>
</div>
    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
      <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${scorePct}%` }} />
    </div>
    <div className="space-y-2">
      {EXTERNALIZER_SCORE_FIELDS.map((field) => (
        <div key={field} className="flex items-center gap-2">
          <span
            className="text-xs text-gray-600 w-24 flex-shrink-0"
            title={EXTERNALIZER_SCORE_FIELDS.find(f => f === field) ? 'Score field' : ''}
          >
            {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
          </span>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={score[field] ?? 0}
            onChange={(e) => {
              const updated = {
                ...score,
                [field]: Number(e.target.value),
              };

              updateExt({
                score: {
                  ...updated,
                  computed: computeExternalizerScore(updated),
                },
              });
            }}
            className="flex-grow accent-violet-600 h-1.5"
          />

          <span className={`text-xs font-bold w-5 text-right ${getScoreColor(score[field])}`}>
  {score[field] ?? 0}
</span>
        </div>
      ))}
    </div>
    {scoreReasoning && <p className="mt-2 text-xs text-gray-500 italic bg-violet-50 p-2 rounded-lg">{scoreReasoning}</p>}
  </div>

  {/* Externalization file */}
  <div className="border-t border-gray-100 pt-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Externalization File</p>
      <div className="flex gap-1.5">
        <button onClick={handleAIGenerateFile} disabled={isGeneratingFile} className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg hover:bg-violet-100 disabled:opacity-50">
          <Sparkles size={12} className={isGeneratingFile ? 'animate-spin' : ''} /> AI Fill
        </button>
        <button onClick={() => handleExportContent(GENERATE_EXTERNALIZATION_MD({ ...project, externalizer: { ...ext, externalizationFile: localFile as any } }), `${project.name.toLowerCase().replace(/\s+/g, '-')}-externalization`)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200">
          <Download size={12} /> .md
        </button>
      </div>
    </div>
    <div className="space-y-2.5">
      {(['problem', 'insight', 'solution', 'proof', 'notes'] as const).map(field => (
        <div key={field}>
          <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{field}</label>
          <textarea rows={2} value={(localFile as any)?.[field] || ''}
            onChange={e => setLocalFile(prev => ({ ...prev, [field]: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-violet-400 text-gray-800 resize-none" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={localFile?.status || 'validated'} onChange={e => setLocalFile(prev => ({ ...prev, status: e.target.value as ExternalizationStatus }))}
            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800">
            {EXTERNALIZATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Route</label>
          <select value={localFile?.recommendedRoute || 'explore'} onChange={e => setLocalFile(prev => ({ ...prev, recommendedRoute: e.target.value as RecommendedRoute }))}
            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800">
            {RECOMMENDED_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <button onClick={() => { updateExt({ externalizationFile: localFile as any }); addToast('Externalization file saved!', 'success'); }}
        className="w-full py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700">
        Save File
      </button>
    </div>
  </div>
</div>

);
};

// ─── PROJECT DETAIL VIEW ──────────────────────────────────────────────────────

const AI_ACTION_ICONS: Record<AIAction, React.ElementType> = {
readme: FileText, description: TextCursorInput, tags: BarChart, marketingIdeas: Lightbulb,
improvements: TrendingUp, seoMetadata: Search, featureList: CheckCircle, useCases: BrainCircuit,
marketAnalysis: Activity, competitorAnalysis: Shield, monetizationSuggestions: DollarSign,
};

const ProjectDetailView: React.FC<{
project: Project; onClose: () => void; onEdit: (p: Project) => void;
onDelete: (id: string) => void; onToggleHeart: (id: string) => void;
onExportProject: (p: Project) => void;
onUpdateAIGenerated: (id: string, field: AIAction, content: string | string[]) => void;
onUpdateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => void;
settings: AISettings; addToast: (msg: string, type: 'success' | 'error') => void;
onUpdateImage: (p: Project) => void; isGeneratingImage: boolean;
}> = ({ project, onClose, onEdit, onDelete, onToggleHeart, onExportProject, onUpdateAIGenerated, onUpdateProject, settings, addToast, onUpdateImage, isGeneratingImage,userId  }) => {
const [detailTab, setDetailTab] = useState<'ai' | 'docs' | 'strategy' | 'openspec' | 'externalizer' | 'systemcard' | 'relvanta' | 'handoff' | 'intel' | 'media'>('ai');
const [aiTab, setAITab] = useState<'generate' | 'chat'>('generate');
const [isGenerating, setIsGenerating] = useState<AIAction | null>(null);
const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
const [selectedExpert, setSelectedExpert] = useState<AIExpert>(AI_EXPERT_ROLES[0]);
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
const [chatInput, setChatInput] = useState('');
const [isChatting, setIsChatting] = useState(false);
const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
const [proposalGoal, setProposalGoal] = useState('');
const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
const [viewingProposal, setViewingProposal] = useState<OpenSpecChange | null>(null);
// Docs tab state — was missing, causing runtime errors
const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
const [editingDoc, setEditingDoc] = useState<string | null>(null);
const [editingDocValue, setEditingDocValue] = useState('');
const chatContainerRef = useRef<HTMLDivElement>(null);

const isExternalizerEligible = project.intent ? EXTERNALIZER_ELIGIBLE_INTENTS.includes(project.intent) : false;

useEffect(() => { chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight); }, [chatHistory]);

const handleExportContent = (content: string, filename: string) =>
downloadFile(content, `${filename}.md`, 'text/plain');

const handleGenerateContent = async (action: AIAction) => {
setIsGenerating(action);
try {
const result = await generateContent(AI_PROMPT_TEMPLATES[action](project), settings, 'Content Generation');
if (action === 'tags') {
const cleanedTags = result.replace(/`[\s\S]*?`/g, '').replace(/^[-*•]\s*/gm, '').replace(/\n/g, ',').split(',')
.map(t => t.trim().replace(/^["'`]|["'`]$/g, '')).filter(t => t.length > 0 && t.length < 40);
onUpdateAIGenerated(project.id, action, cleanedTags);
onUpdateProject(project.id, { tags: [...new Set([...project.tags, ...cleanedTags])] });
addToast('Tags generated and applied!', 'success');
} else {
onUpdateAIGenerated(project.id, action, result);
addToast(`${action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} generated!`, 'success');
if (Object.keys(project.aiGenerated).includes(action)) setDetailTab('docs');
}
} catch (e) { addToast(`Error generating ${action}: ${(e as Error).message}`, 'error'); }
finally { setIsGenerating(null); }
};

const handleChatSubmit = async (e?: React.FormEvent, suggestion?: string) => {
e?.preventDefault();
const input = suggestion || chatInput;
if (!input) return;
const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: input }];
setChatHistory(newHistory);
setChatInput('');
setIsChatting(true);
try {
const result = await generateContent(`Project: ${project.name}\n${project.description}\n\nRequest: ${input}`, settings, `Chat_${selectedExpert.name}` as AITask, { systemPrompt: selectedExpert.prompt });
setChatHistory([...newHistory, { role: 'model', content: result }]);
} catch (e) {
setChatHistory([...newHistory, { role: 'model', content: `Error: ${(e as Error).message}` }]);
} finally { setIsChatting(false); }
};

const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); addToast('Copied!', 'success'); };

// OpenSpec handlers
const handleInitializeOpenSpec = () => {
onUpdateProject(project.id, { openSpec: { ...INITIAL_OPEN_SPEC, spec_md: OPEN_SPEC_FROM_PROJECT_TEMPLATE(project), changes: [] } });
addToast('OpenSpec initialized!', 'success');
};

const handleGenerateProposal = async () => {
if (!project.openSpec?.spec_md || !proposalGoal) return addToast('Need spec and goal.', 'error');
setIsGeneratingProposal(true);
try {
const result = await generateContent(OPEN_SPEC_PROPOSAL_GENERATION_TEMPLATE(project.openSpec.spec_md, proposalGoal), settings, 'OpenSpec Proposal Generation', { responseMimeType: 'application/json' });
const parsed = JSON.parse(result.replace(/`json\n?/, '').replace(/`$/, '').trim());
const slug = proposalGoal.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
const newChange: OpenSpecChange = { name: `${new Date().toISOString().split('T')[0]}-${slug}`, status: OpenSpecStatus.Proposed, ...parsed, createdAt: new Date().toISOString() };
onUpdateProject(project.id, { openSpec: { ...project.openSpec, changes: [...(project.openSpec.changes || []), newChange] } });
addToast('Proposal generated!', 'success');
setIsProposalModalOpen(false);
setProposalGoal('');
} catch (e) { addToast(`Proposal failed: ${(e as Error).message}`, 'error'); }
finally { setIsGeneratingProposal(false); }
};

const handleApplyChange = (change: OpenSpecChange) => {
if (!project.openSpec) return;
let spec = project.openSpec.spec_md;
const added = change.delta_md.split('\n').filter(l => l.trim().startsWith('- [ADDED]')).map(l => l.replace('- [ADDED]', '-').trim());
if (added.length) {
const idx = spec.indexOf('## 2. Requirements');
if (idx !== -1) {
const end = spec.indexOf('##', idx + 1);
const section = spec.substring(idx, end > -1 ? end : spec.length);
spec = spec.replace(section, section + '\n' + added.join('\n'));
} else {
spec += '\n\n## 2. Requirements\n' + added.join('\n');
}
}
const updatedChanges = project.openSpec.changes.map(c => c.name === change.name ? { ...c, status: OpenSpecStatus.Merged } : c);
onUpdateProject(project.id, { openSpec: { ...project.openSpec, spec_md: spec, changes: updatedChanges } });
addToast(`Change "${change.name}" applied.`, 'success');
};

const statusColors: Record<OpenSpecStatus, string> = {
[OpenSpecStatus.Proposed]: 'bg-blue-100 text-blue-800',
[OpenSpecStatus.Active]: 'bg-yellow-100 text-yellow-800',
[OpenSpecStatus.Merged]: 'bg-green-100 text-green-800',
[OpenSpecStatus.Archived]: 'bg-gray-100 text-gray-800',
};

const StrategyGauge: React.FC<{ label: string; value: number }> = ({ label, value }) => (
<div className="bg-white p-4 rounded-lg border text-center">
<h5 className="text-sm font-semibold text-gray-600">{label}</h5>
<p className="text-3xl font-bold text-gray-800">{value}/10</p>
<div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${value * 10}%` }} /></div>
</div>
);

return (
<>
<div className="min-h-screen bg-white">
<div className="max-w-7xl mx-auto">
{/* Top bar */}
<div className="sticky top-0 bg-white/80 backdrop-blur-lg z-20 p-4 border-b border-gray-100 flex items-center justify-between">
<button onClick={onClose} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"><ArrowLeft size={16} /> Back</button>
<div className="flex items-center gap-2">
<button onClick={() => onToggleHeart(project.id)} className="p-2.5 rounded-lg hover:bg-gray-100"><Heart size={20} className={project.isHearted ? 'text-red-500 fill-current' : 'text-gray-500'} /></button>
<button onClick={() => onExportProject(project)} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600"><Download size={20} /></button>
<button onClick={() => onEdit(project)} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600"><Pencil size={20} /></button>
<button onClick={() => onDelete(project.id)} className="p-2.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 size={20} /></button>
</div>
</div>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
        {/* Left: project info */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_BADGE[project.status]}`}>{project.status}</span>
              {project.intent && <span className={`px-3 py-1 text-sm font-semibold rounded-full ${INTENT_COLORS[project.intent]}`}>{PROJECT_INTENT_LABELS[project.intent]}</span>}
              {project.externalizer?.stage && <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STAGE_COLORS[project.externalizer.stage]}`}>{ITEM_STAGE_LABELS[project.externalizer.stage]}</span>}
              {project.externalizer?.externalized && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">Externalized</span>}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
          </div>
          <div className="relative">
            <div className="w-full aspect-video rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {isGeneratingImage ? <ImageLoadingSpinner size={32} /> : <img src={project.images[0] || getPlaceholderImageUrl(project.name)} alt={project.name} className="w-full h-full object-cover" />}
            </div>
            <button onClick={() => onUpdateImage(project)} className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-800 shadow-sm"><Sparkles size={20} /></button>
          </div>
          <div><h2 className="text-xl font-bold text-gray-800 mb-2">About</h2><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p></div>
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div><strong className="block text-sm text-gray-500">Category</strong><span>{project.category}</span></div>
            <div><strong className="block text-sm text-gray-500">Type</strong><span>{project.type}</span></div>
            <div><strong className="block text-sm text-gray-500">Created</strong><span>{formatDate(project.createdAt)}</span></div>
            <div><strong className="block text-sm text-gray-500">Updated</strong><span>{formatDate(project.updatedAt)}</span></div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">{tag}</span>)}</div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
            {project.repository && <a href={project.repository} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900"><Github size={18} /> GitHub</a>}
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"><ExternalLink size={18} /> Live URL</a>}
          </div>
        </div>

        {/* Right: tabs panel */}
        <div className="lg:col-span-2 sticky top-24 h-[calc(100vh-8rem)]">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 h-full flex flex-col">
            {/* Tab bar */}
            <div className="flex items-center p-2 bg-gray-100 rounded-t-2xl flex-wrap gap-1">
              {([
                { id: 'ai', icon: BrainCircuit, label: 'AI' },
                { id: 'openspec', icon: FileCode, label: 'OpenSpec' },
                { id: 'strategy', icon: BarChart3, label: 'Strategy' },
                { id: 'docs', icon: FileText, label: 'Docs' },
                ...(isExternalizerEligible ? [{ id: 'externalizer', icon: Zap, label: 'Externalizer' }] : []),
                { id: 'handoff', icon: Package, label: 'Handoff' },
                { id: 'intel', icon: ShieldCheck, label: 'Intel' },
                { id: 'media', icon: Wand2, label: 'Media' },
              ] as { id: string; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setDetailTab(id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${detailTab === id ? `bg-white ${id === 'externalizer' ? 'text-violet-700' : id === 'handoff' ? 'text-indigo-700' : 'text-gray-800'} shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* AI Tab */}
            {detailTab === 'ai' && (
              <div className="flex flex-col flex-grow overflow-hidden">
                <div className="flex items-center p-2 border-b border-gray-200">
                  <button onClick={() => setAITab('generate')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${aiTab === 'generate' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Generate</button>
                  <button onClick={() => setAITab('chat')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${aiTab === 'chat' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Chat</button>
                </div>

                {aiTab === 'generate' && (
                  <div className="p-4 space-y-4 overflow-y-auto">
                    <h3 className="font-bold text-gray-800">Content Generation</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(AI_PROMPT_TEMPLATES) as AIAction[]).filter(k => !['marketAnalysis', 'competitorAnalysis', 'monetizationSuggestions'].includes(k)).map(action => {
                        const Icon = AI_ACTION_ICONS[action];
                        return (
                          <button key={action} onClick={() => handleGenerateContent(action)} disabled={!!isGenerating}
                            className={`flex items-center gap-2 p-3 text-left bg-white border rounded-lg transition-all ${isGenerating === action ? 'bg-gray-100 text-gray-400' : 'hover:bg-indigo-50 hover:border-indigo-200'}`}>
                            {isGenerating === action ? <Sparkles size={16} className="animate-spin text-indigo-500" /> : <Icon size={16} className="text-gray-500" />}
                            <span className="text-sm font-medium text-gray-700 flex-grow">{action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                            {project.aiGenerated[action] && <CheckCircle size={16} className="text-green-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {aiTab === 'chat' && (
                  <div className="p-4 flex flex-col h-full overflow-hidden">
                    <select value={selectedExpert.name} onChange={e => setSelectedExpert(AI_EXPERT_ROLES.find(r => r.name === e.target.value)!)}
                      className="w-full p-2 mb-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                      {AI_EXPERT_ROLES.map(r => <option key={r.name}>{r.name}</option>)}
                    </select>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4" ref={chatContainerRef}>
                      <div className="p-4 bg-white rounded-lg border text-center">
                        <selectedExpert.icon size={24} className="mx-auto text-indigo-500 mb-2" />
                        <p className="text-sm text-gray-600">{selectedExpert.description}</p>
                      </div>
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white border'}`}>
                            <p className="text-sm whitespace-pre-wrap p-3">{msg.content}</p>
                            {msg.role === 'model' && !msg.content.startsWith('Error') && (
                              <div className="border-t border-gray-100 p-1 flex items-center justify-end gap-1">
                                <button onClick={() => copyToClipboard(msg.content)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><Copy size={14} /></button>
                                <button onClick={() => onUpdateProject(project.id, { description: project.description + `\n\n---\nAI Suggestion:\n${msg.content}` })} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><FilePlus size={14} /></button>
                                <button onClick={() => { setProposalGoal(msg.content); setDetailTab('openspec'); setIsProposalModalOpen(true); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><GitBranchPlus size={14} /></button>
                                <button onClick={() => handleExportContent(msg.content, `${project.name}-ai-chat`)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><Download size={14} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isChatting && <div className="flex justify-start"><div className="p-3 rounded-2xl bg-white border"><Sparkles size={16} className="animate-spin text-indigo-500" /></div></div>}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedExpert.suggestions.map(s => (
                          <button key={s} onClick={() => handleChatSubmit(undefined, s)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-300">{s}</button>
                        ))}
                      </div>
                      <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={`Ask ${selectedExpert.name}...`}
                          className="flex-grow px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" disabled={isChatting} />
                        <button type="submit" disabled={isChatting || !chatInput} className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"><Send size={20} /></button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OpenSpec Tab */}
            {detailTab === 'openspec' && (
              <div className="p-4 space-y-4 overflow-y-auto flex flex-col h-full">
                {!project.openSpec?.initialized ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border flex-grow">
                    <FileCode size={40} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">OpenSpec Not Initialized</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4 max-w-xs">Enable structured AI-driven development workflows for this project.</p>
                    <PrimaryButton onClick={handleInitializeOpenSpec}>Initialize OpenSpec</PrimaryButton>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">spec.md</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleExportContent(project.openSpec!.spec_md, `${project.name}-spec`)} className="text-xs font-semibold text-gray-600 hover:text-indigo-600">Export</button>
                          <button onClick={() => { onUpdateProject(project.id, { openSpec: { ...project.openSpec!, spec_md: OPEN_SPEC_FROM_PROJECT_TEMPLATE(project) } }); addToast('spec.md updated.', 'success'); }} className="text-xs font-semibold text-gray-600 hover:text-indigo-600">Update</button>
                        </div>
                      </div>
                      <pre className="text-xs text-gray-700 bg-white p-3 rounded-md border whitespace-pre-wrap font-sans h-40 overflow-y-auto">{project.openSpec.spec_md}</pre>
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-2 pt-3 border-t border-gray-200">
                        <h3 className="font-bold text-gray-800">Change Proposals</h3>
                        <button onClick={() => setIsProposalModalOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"><Plus size={12} /> New</button>
                      </div>
                      <div className="space-y-2 flex-grow overflow-y-auto pr-1">
                        {(project.openSpec.changes?.length ?? 0) > 0
                          ? [...project.openSpec.changes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(change => (
                            <div key={change.name} className="bg-white border rounded-lg p-2 flex justify-between items-center">
                              <div><p className="text-sm font-semibold text-gray-800 truncate">{change.name}</p><p className="text-xs text-gray-500">{formatDate(change.createdAt)}</p></div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[change.status]}`}>{change.status}</span>
                                <button onClick={() => setViewingProposal(change)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Eye size={14} /></button>
                                {change.status === OpenSpecStatus.Proposed && <button onClick={() => handleApplyChange(change)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><GitMerge size={14} /></button>}
                              </div>
                            </div>
                          ))
                          : <div className="text-center py-6"><p className="text-sm text-gray-500">No proposals yet.</p></div>
                        }
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Strategy Tab */}
            {detailTab === 'strategy' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="p-4 bg-white rounded-lg border text-center">
                  <h4 className="text-sm font-bold text-indigo-800">Strategy Score</h4>
                  <p className="text-6xl font-extrabold text-indigo-600 tracking-tighter">{calculateStrategyScore(project.strategy)}</p>
                  <p className="text-xs text-gray-500 mt-1">({project.strategy?.model || 'N/A'})</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">(Revenue×1.5 + Validation×1.2) × Ease · max ≈ 270</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StrategyGauge label="Revenue Potential" value={project.strategy?.revenuePotential || 0} />
                  <StrategyGauge label="Ease of Build" value={project.strategy?.easeOfBuild || 0} />
                  <StrategyGauge label="Market Validation" value={project.strategy?.marketValidation || 0} />
                </div>
                <div className="p-4 bg-white rounded-lg border"><h4 className="font-semibold text-gray-800 mb-2">Notes</h4><p className="text-sm text-gray-600 whitespace-pre-wrap">{project.strategy?.notes || 'No notes.'}</p></div>
                <h3 className="font-bold text-gray-800 pt-3 border-t border-gray-200">AI Strategy Analysis</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(['marketAnalysis', 'competitorAnalysis', 'monetizationSuggestions'] as AIAction[]).map(action => {
                    const Icon = AI_ACTION_ICONS[action];
                    return (
                      <button key={action} onClick={() => handleGenerateContent(action)} disabled={!!isGenerating}
                        className={`flex items-center gap-3 p-3 text-left bg-white border rounded-lg transition-all ${isGenerating === action ? 'bg-gray-100' : 'hover:bg-indigo-50 hover:border-indigo-200'}`}>
                        {isGenerating === action ? <Sparkles size={18} className="animate-spin text-indigo-500" /> : <Icon size={18} className="text-indigo-600" />}
                        <div>
                          <span className="text-sm font-semibold text-gray-800">{action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                          {project.aiGenerated[action] && <p className="text-xs text-green-600">Available in Docs</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Docs Tab */}
            {detailTab === 'docs' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
                  <h3 className="font-bold text-gray-800 text-sm">Documents & Assets</h3>
                  <button onClick={async () => {
                    setIsGeneratingPackage(true);
                    try {
                      const prompt = `You are a senior technical writer. Generate a comprehensive production package as a single markdown document.


# ${project.name} — Production Package

## 1. Product Overview

## 2. Technical Architecture

## 3. API / Interface Reference

## 4. Deployment Guide

## 5. Environment Variables

## 6. Changelog Template

## 7. Known Limitations

## 8. Handoff Notes

Project: ${project.name} | Type: ${project.type}
Description: ${project.description}
Tags: ${project.tags.join(', ')}
Repo: ${project.repository || 'N/A'} | Live: ${project.liveUrl || 'N/A'}
${project.openSpec?.spec_md ? 'OpenSpec:\n' + project.openSpec.spec_md.slice(0, 800) : ''}

Write as if handing off to another developer.`;
const result = await generateContent(prompt, settings, 'Content Generation');
onUpdateAIGenerated(project.id, 'readme', result);
addToast('Production package generated!', 'success');
setDetailTab('docs');
} catch (e) { addToast('Package failed: ' + (e as Error).message, 'error'); }
finally { setIsGeneratingPackage(false); }
}} disabled={isGeneratingPackage} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
{isGeneratingPackage ? <Sparkles size={12} className="animate-spin" /> : <Boxes size={12} />} Prod Package
</button>
</div>

                {/* Pipeline docs from project.docs — saved by Handoff and other pipelines */}
                {project.docs && Object.entries(project.docs).some(([, v]) => v && (typeof v === 'string' ? (v as string).trim().length > 0 : Object.keys(v as object).length > 0)) && (
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-2 px-1">Pipeline Documents</p>
                    <div className="space-y-1.5">
                      {Object.entries(project.docs).map(([key, value]) => {
                        if (!value) return null;
                        const isEmpty = typeof value === 'string' ? !(value as string).trim() : Object.keys(value as object).length === 0;
                        if (isEmpty) return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase());
                        const displayValue = typeof value === 'string' ? value as string : JSON.stringify(value, null, 2);
                        const expandKey = `docs_${key}`;
                        const isExpanded = expandedDoc === expandKey;
                        return (
                          <div key={expandKey} className="bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2">
                              <FileText size={13} className="text-indigo-400 flex-shrink-0" />
                              <span className="text-xs font-semibold text-indigo-700 flex-grow truncate">{label}</span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => setExpandedDoc(isExpanded ? null : expandKey)} className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-400 hover:text-indigo-700"><Eye size={13} /></button>
                                <button onClick={() => copyToClipboard(displayValue)} className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-400 hover:text-indigo-700"><Copy size={13} /></button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="border-t border-indigo-100 bg-white p-3">
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{displayValue}</pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state — only if BOTH stores are empty */}
                {Object.values(project.aiGenerated).every(v => !v || (Array.isArray(v) && v.length === 0)) &&
                  (!project.docs || !Object.entries(project.docs).some(([, v]) => v && (typeof v === 'string' ? (v as string).trim().length > 0 : Object.keys(v as object).length > 0))) && (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center py-8 px-4">
                      <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No documents yet.</p>
                      <button onClick={() => { setDetailTab('ai'); setAITab('generate'); }} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500">Generate from AI tab →</button>
                    </div>
                  </div>
                )}

                <div className="overflow-y-auto flex-grow p-3 space-y-1.5">
                  {Object.entries(project.aiGenerated).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                    const isEditing = editingDoc === key;
                    const isExpanded = expandedDoc === key;
                    return (
                      <div key={key} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <FileText size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 flex-grow truncate">{label}</span>
                          {key === 'tags' && Array.isArray(value) && (
                            <button onClick={() => { onUpdateProject(project.id, { tags: [...new Set([...project.tags, ...(value as string[])])] }); addToast('Tags applied!', 'success'); }}
                              className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 mr-1">Apply</button>
                          )}
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => { setExpandedDoc(isExpanded ? null : key); setEditingDoc(null); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Eye size={13} /></button>
                            <button onClick={() => { if (isEditing) { setEditingDoc(null); } else { setEditingDoc(key); setEditingDocValue(displayValue); setExpandedDoc(null); } }}
                              className={`p-1.5 rounded-md hover:bg-gray-100 ${isEditing ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-700'}`}><Pencil size={13} /></button>
                            {isEditing && (
                              <button onClick={() => {
                                const saved = key === 'tags' ? editingDocValue.split(',').map(t => t.trim()).filter(Boolean) : editingDocValue;
                                onUpdateAIGenerated(project.id, key as AIAction, saved as any);
                                if (key === 'tags') onUpdateProject(project.id, { tags: saved as string[] });
                                setEditingDoc(null);
                                addToast('Saved!', 'success');
                              }} className="p-1.5 rounded-md hover:bg-green-50 text-green-600"><CheckCircle size={13} /></button>
                            )}
                            <button onClick={() => copyToClipboard(displayValue)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Copy size={13} /></button>
                            <button onClick={() => { onUpdateAIGenerated(project.id, key as AIAction, Array.isArray(value) ? [] : ''); addToast('Deleted.', 'success'); }}
                              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {isExpanded && !isEditing && <div className="border-t border-gray-100 bg-gray-50 p-3"><pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">{displayValue}</pre></div>}
                        {isEditing && (
                          <div className="border-t border-indigo-100 bg-indigo-50/30 p-3">
                            <textarea value={editingDocValue} onChange={e => setEditingDocValue(e.target.value)} rows={key === 'tags' ? 2 : 8}
                              className="w-full text-xs text-gray-800 bg-white border border-indigo-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-400 resize-none font-sans" />
                            {key === 'tags' && <p className="text-[10px] text-gray-400 mt-1">Comma-separated</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Externalizer Tab */}
            {detailTab === 'externalizer' && isExternalizerEligible && (
              <ExternalizerOSPanel project={project} onUpdateProject={onUpdateProject} addToast={addToast} settings={settings} handleExportContent={handleExportContent} />
            )}
            {/* System Card Tab */}
{detailTab === 'systemcard' && (
  <SystemCardPanel
    project={project}
    onUpdateProject={onUpdateProject}
    addToast={addToast}
    settings={settings}
    onSwitchToExport={() => setDetailTab('relvanta')}
  />
)}

{/* Relvanta Export Tab */}
{detailTab === 'relvanta' && (
  <RelvantaExportPanel
    project={project}
    onUpdateProject={onUpdateProject}
    addToast={addToast}
    onSwitchToCard={() => setDetailTab('systemcard')}
  />
)}

{/* Handoff Pipeline Tab */}
{detailTab === 'handoff' && (
  <HandoffPipelinePanel
    project={project}
    onUpdateProject={onUpdateProject}
    addToast={addToast}
    settings={settings}
    userId={userId}
  />
)}

{/* Intelligence Tab — replaces Validator + Score */}
{detailTab === 'intel' && (
  <div className="p-4 overflow-y-auto h-full">
    <IntelligencePanel
      project={project}
      settings={settings}
      onUpdateProject={onUpdateProject}
      addToast={addToast}
    />
  </div>
)}

{/* Media Prompts Tab */}
{detailTab === 'media' && (
  <div className="p-4 overflow-y-auto h-full">
    <MediaPromptsPanel
      project={project}
      settings={settings}
      addToast={addToast}
    />
  </div>
)}

          </div>
        </div>
      </main>
    </div>
  </div>

  {/* Proposal modal */}
  <Modal isOpen={isProposalModalOpen} onClose={() => setIsProposalModalOpen(false)} title="New OpenSpec Proposal">
    <div className="p-6 space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Proposal Goal</label>
        <textarea value={proposalGoal} onChange={e => setProposalGoal(e.target.value)} rows={4} placeholder="e.g., Add Passkeys authentication..." className={inputCls} /></div>
      <div className="flex justify-end">
        <PrimaryButton onClick={handleGenerateProposal} disabled={isGeneratingProposal || !proposalGoal} loading={isGeneratingProposal}>Generate with AI</PrimaryButton>
      </div>
    </div>
  </Modal>

  {/* View proposal modal */}
  <Modal isOpen={!!viewingProposal} onClose={() => setViewingProposal(null)} title={`Proposal: ${viewingProposal?.name}`} size="2xl">
    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
      {(['proposal_md', 'tasks_md', 'delta_md'] as const).map(field => (
        <div key={field}>
          <h3 className="font-bold text-gray-800 mb-2 capitalize">{field.replace('_md', '.md')}</h3>
          <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded-md border whitespace-pre-wrap font-sans">{viewingProposal?.[field]}</pre>
        </div>
      ))}
    </div>
  </Modal>
</>

);
};

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────

const SettingsModal: React.FC<{
isOpen: boolean; onClose: () => void; settings: AISettings;
onSave: (s: AISettings) => void; onExport: () => void;
onOpenExportManager: () => void;
}> = ({ isOpen, onClose, settings, onSave, onExport, onOpenExportManager }) => {
const [local, setLocal] = useState(settings);
const [keys, setKeys] = useState<RuntimeApiKeys>(() => loadRuntimeKeys());
const [showGroqKey, setShowGroqKey] = useState(false);
const [showGeminiKey, setShowGeminiKey] = useState(false);
const [groqModels, setGroqModels] = useState<{ id: string; owned_by: string }[]>([]);
const [loadingModels, setLoadingModels] = useState(false);
useEffect(() => { setLocal(settings); setKeys(loadRuntimeKeys()); }, [settings, isOpen]);

// Fetch Groq model list whenever key changes
const handleGroqKeyChange = async (val: string) => {
  setKeys(k => ({ ...k, groqApiKey: val }));
  if (val.length > 10) {
    setLoadingModels(true);
    // Save key temporarily so fetchGroqModels can pick it up
    saveRuntimeKeys({ ...keys, groqApiKey: val });
    const models = await fetchGroqModels();
    setGroqModels(models);
    setLoadingModels(false);
  } else {
    setGroqModels([]);
  }
};

// Also fetch on open if key already set
useEffect(() => {
  const stored = loadRuntimeKeys();
  if (stored.groqApiKey && stored.groqApiKey.length > 10) {
    setLoadingModels(true);
    fetchGroqModels().then(m => { setGroqModels(m); setLoadingModels(false); });
  }
}, [isOpen]);

const handleSaveAll = () => {
  saveRuntimeKeys(keys);
  onSave(local);
  onClose();
};

const groqTasks = Object.keys(local.tasks).filter(
  t => local.tasks[t as AITask].provider === AIProvider.Groq
) as AITask[];

return (
<Modal isOpen={isOpen} onClose={onClose} title="Settings" size="2xl">
<div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">

{/* ── API Keys ── */}
<div>
<h3 className="text-lg font-semibold text-gray-800 mb-1">API Keys</h3>
<p className="text-xs text-gray-400 mb-4">Stored locally in your browser. Never sent anywhere except the respective AI provider.</p>
<div className="space-y-4">
  {/* Groq */}
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-gray-700">Groq API Key <span className="text-xs font-normal text-gray-400">(fast inference)</span></label>
      <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">console.groq.com →</a>
    </div>
    <div className="flex gap-2">
      <input
        type={showGroqKey ? 'text' : 'password'}
        value={keys.groqApiKey || ''}
        onChange={e => handleGroqKeyChange(e.target.value)}
        placeholder="gsk_..."
        className={inputCls + ' flex-1'}
      />
      <button onClick={() => setShowGroqKey(v => !v)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100">
        {showGroqKey ? 'Hide' : 'Show'}
      </button>
    </div>
    {/* Live model list */}
    {(keys.groqApiKey?.length ?? 0) > 10 && (
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">
          {loadingModels ? 'Fetching available models…' : `${groqModels.length} models available`}
        </p>
        {!loadingModels && groqModels.length > 0 && (
          <div className="space-y-2">
            {groqTasks.length === 0 && (
              <p className="text-xs text-gray-400 italic">Switch any task below to Groq provider to assign a model.</p>
            )}
            {groqTasks.map(task => (
              <div key={task} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-40 truncate flex-shrink-0">{task}</span>
                <select
                  value={local.tasks[task]?.model}
                  onChange={e => setLocal(p => ({ ...p, tasks: { ...p.tasks, [task]: { ...p.tasks[task], model: e.target.value } } }))}
                  className="flex-1 text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400"
                >
                  {groqModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
                </select>
              </div>
            ))}
            {groqTasks.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {groqModels.slice(0, 8).map(m => (
                  <span key={m.id} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600 font-mono">{m.id}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>

  {/* Gemini */}
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-gray-700">Gemini API Key <span className="text-xs font-normal text-gray-400">(overrides env var)</span></label>
      <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">aistudio.google.com →</a>
    </div>
    <div className="flex gap-2">
      <input
        type={showGeminiKey ? 'text' : 'password'}
        value={keys.geminiApiKey || ''}
        onChange={e => setKeys(k => ({ ...k, geminiApiKey: e.target.value }))}
        placeholder="AIza..."
        className={inputCls + ' flex-1'}
      />
      <button onClick={() => setShowGeminiKey(v => !v)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100">
        {showGeminiKey ? 'Hide' : 'Show'}
      </button>
    </div>
  </div>
</div>
</div>

{/* ── Global params ── */}
<div>
<h3 className="text-lg font-semibold text-gray-800 mb-4">Global Parameters</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div><label className="block text-sm font-medium text-gray-700 mb-1">Temperature: {local.temperature}</label><input type="range" min="0" max="1" step="0.1" value={local.temperature} onChange={e => setLocal(p => ({ ...p, temperature: parseFloat(e.target.value) }))} className="w-full" /></div>
<div><label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label><input type="number" value={local.maxTokens} onChange={e => setLocal(p => ({ ...p, maxTokens: parseInt(e.target.value) }))} className={inputCls} /></div>
</div>
<div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label><textarea value={local.systemPrompt} onChange={e => setLocal(p => ({ ...p, systemPrompt: e.target.value }))} rows={3} className={inputCls} /></div>
</div>

{/* ── Task Models ── */}
<div>
<h3 className="text-lg font-semibold text-gray-800 mb-4">Task Models</h3>
<div className="space-y-4">
{CONFIGURABLE_AI_TASKS.map(task => (
<div key={task} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
<h4 className="font-semibold text-gray-700 mb-3 text-sm">{task}</h4>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
  <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
  <select
    value={local.tasks[task]?.provider}
    onChange={e => setLocal(p => ({ ...p, tasks: { ...p.tasks, [task]: { ...p.tasks[task], provider: e.target.value as AIProvider } } }))}
    className={inputCls}
    disabled={task === 'Image Generation'}
  >
    {AI_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
  </select>
</div>
<div>
  <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
  {local.tasks[task]?.provider === AIProvider.Groq && groqModels.length > 0 ? (
    <select
      value={local.tasks[task]?.model}
      onChange={e => setLocal(p => ({ ...p, tasks: { ...p.tasks, [task]: { ...p.tasks[task], model: e.target.value } } }))}
      className={inputCls}
    >
      {groqModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
    </select>
  ) : (
    <input
      type="text"
      value={local.tasks[task]?.model}
      onChange={e => setLocal(p => ({ ...p, tasks: { ...p.tasks, [task]: { ...p.tasks[task], model: e.target.value } } }))}
      className={inputCls}
      placeholder={local.tasks[task]?.provider === AIProvider.Groq ? 'Add Groq key above to pick from list' : 'e.g. gemini-2.5-flash'}
    />
  )}
</div>
</div>
</div>
))}
</div>
</div>

{/* ── Data ── */}
<div>
<h3 className="text-lg font-semibold text-gray-800 mb-3">Data</h3>
<div className="flex flex-wrap gap-3">
<button onClick={onOpenExportManager} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 shadow-sm text-sm"><Download size={15} /> Export Manager</button>
<button onClick={onExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-50 text-sm"><Download size={15} /> Quick Export All</button>
</div>
</div>

</div>
<div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
<button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
<PrimaryButton onClick={handleSaveAll}>Save Settings</PrimaryButton>
</div>
</Modal>
);
};

// ─── IMAGE UPDATE MODAL ───────────────────────────────────────────────────────

const ImageUpdateModal: React.FC<{
isOpen: boolean; onClose: () => void; project: Project | null;
onUpdate: (id: string, url?: string) => void; isGenerating: boolean;
}> = ({ isOpen, onClose, project, onUpdate, isGenerating }) => {
const [imageUrl, setImageUrl] = useState('');
useEffect(() => { if (project) setImageUrl(project.images[0] || ''); }, [project]);
if (!project) return null;
return (
<Modal isOpen={isOpen} onClose={onClose} title="Update Project Image">
<div className="p-6 space-y-4">
<div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls} /></div>
<div className="flex justify-end"><button onClick={() => onUpdate(project.id, imageUrl)} className="px-4 py-2 bg-white border border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-50">Save URL</button></div>
<div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-200" /><span className="mx-4 text-gray-400 text-sm">Or</span><div className="flex-grow border-t border-gray-200" /></div>
<PrimaryButton onClick={() => onUpdate(project.id)} disabled={isGenerating} loading={isGenerating} className="w-full">Generate with AI</PrimaryButton>
</div>
</Modal>
);
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

const LoginScreen: React.FC = () => (

  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center p-8">
      <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6"><BrainCircuit size={40} className="text-white" /></div>
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome to PersonaLinea</h1>
      <p className="text-lg text-gray-600 mt-2">Where your projects live and evolve.</p>
      <button onClick={signInWithGoogle} className="mt-8 flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md font-semibold text-gray-800">
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.9-6.9C35.9 2.5 30.5 0 24 0 14.5 0 6.5 5.5 2.7 13.5l8.1 6.3C12.5 13.5 17.9 9.5 24 9.5z" />
          <path fill="#34A853" d="M46.2 25.4c0-1.7-.2-3.4-.5-5H24v9.5h12.5c-.5 3.1-2.9 6.2-5.7 8.1l7.8 6C43.5 39.5 46.2 33 46.2 25.4z" />
          <path fill="#FBBC05" d="M10.8 28.1c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-8.1-6.3C.9 16.5 0 20.1 0 24s.9 7.5 2.7 11.2l8.1-6.1z" />
          <path fill="#EA4335" d="M24 48c6.5 0 11.9-2.2 15.9-5.9l-7.8-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.5-4-13.2-9.7l-8.1 6.3C6.5 42.5 14.5 48 24 48z" />
        </svg>
        Sign in with Google
      </button>
    </div>
  </div>
);

// ─── PIPELINE VIEW ────────────────────────────────────────────────────────────

const ProjectPipelineView: React.FC<{
projects: Project[]; onSelect: (p: Project) => void;
onToggleHeart: (id: string) => void; isGeneratingImage: string | null;
}> = ({ projects, onSelect }) => {
const columns = PROJECT_STATUSES.map(status => ({
status,
projects: projects.filter(p => p.status === status).sort((a, b) =>
status === ProjectStatus.Idea ? calculateStrategyScore(b.strategy) - calculateStrategyScore(a.strategy) : 0
),
}));
return (
<div className="flex space-x-4 overflow-x-auto p-4 pb-8 w-full bg-gray-50">
{columns.map(({ status, projects: col }) => (
<div key={status} className="w-80 flex-shrink-0 bg-gray-100 rounded-2xl flex flex-col">
<h3 className="font-bold p-3 border-b border-gray-200 text-gray-700 sticky top-0 bg-gray-100 rounded-t-2xl">{status} <span className="font-normal text-gray-500">({col.length})</span></h3>
<div className="p-2 space-y-2 flex-grow overflow-y-auto">
{col.length > 0 ? col.map(p => (
<div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200 p-3 cursor-pointer" onClick={() => onSelect(p)}>
<div className="flex justify-between items-start">
<h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{p.name}</h4>
<div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full"><BarChart3 size={12} /><span>{calculateStrategyScore(p.strategy)}</span></div>
</div>
<p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>
<div className="flex flex-wrap gap-1">{p.tags.slice(0, 2).map(tag => <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{tag}</span>)}</div>
</div>
)) : <div className="p-4 text-center text-sm text-gray-500">No projects</div>}
</div>
</div>
))}
</div>
);
};

// ─── REGISTRY VIEW ────────────────────────────────────────────────────────────

type RegistryFilter = 'validated' | 'ready_for_outreach' | 'dead' | 'all_externalized';

const REGISTRY_VIEWS: { key: RegistryFilter; label: string; description: string; color: string; icon: React.ElementType }[] = [
{ key: 'validated', label: 'Validated', description: 'stage = validated', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
{ key: 'ready_for_outreach', label: 'Ready for Outreach', description: 'validated + not yet externalized', color: 'text-violet-700 bg-violet-50 border-violet-200', icon: ArrowRight },
{ key: 'dead', label: 'Dead Ideas', description: 'archived + externalized', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle },
{ key: 'all_externalized', label: 'All Externalized', description: 'externalized = true', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Layers },
];

const applyRegistryFilter = (projects: Project[], filter: RegistryFilter) => {
const eligible = projects.filter(p =>
  p.intent === ProjectIntent.ZeroToOne ||
  p.intent === ProjectIntent.Product ||
  (p as any).inventoryIntent === 'monetize'
);
switch (filter) {
case 'validated': return eligible.filter(p => p.externalizer?.stage === ItemStage.Validated);
case 'ready_for_outreach': return eligible.filter(p => p.externalizer?.stage === ItemStage.Validated && !p.externalizer?.externalized);
case 'dead': return eligible.filter(p => p.externalizer?.stage === ItemStage.Archived && p.externalizer?.externalized);
case 'all_externalized': return eligible.filter(p => p.externalizer?.externalized);
default: return eligible;
}
};

const RegistryView: React.FC<{
projects: Project[]; onSelect: (p: Project) => void;
onToggleHeart: (id: string) => void; isGeneratingImage: string | null;
}> = ({ projects, onSelect, onToggleHeart, isGeneratingImage }) => {
const [activeFilter, setActiveFilter] = useState<RegistryFilter>('validated');
const filtered = applyRegistryFilter(projects, activeFilter);
return (
<div className="flex flex-col h-full">
<div className="px-4 pt-4 pb-2 flex flex-wrap gap-2">
{REGISTRY_VIEWS.map(view => {
const count = applyRegistryFilter(projects, view.key).length;
const Icon = view.icon;
return (
<button key={view.key} onClick={() => setActiveFilter(view.key)}
className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${activeFilter === view.key ? view.color : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
<Icon size={13} /> {view.label}
<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === view.key ? 'bg-white/60' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
</button>
);
})}
</div>
<p className="px-4 pb-3 text-xs text-gray-400 font-mono">
query: {REGISTRY_VIEWS.find(v => v.key === activeFilter)?.description} — {filtered.length} result{filtered.length !== 1 ? 's' : ''}
</p>
{filtered.length === 0 ? (
<div className="flex-grow flex items-center justify-center">
<div className="text-center py-16 px-8">
<Database size={40} className="mx-auto text-gray-300 mb-3" />
<p className="font-semibold text-gray-500">No projects match this filter</p>
<p className="text-sm text-gray-400 mt-1">Assign intent and set Externalizer stage to populate registry views</p>
</div>
</div>
) : (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
{filtered.map(project => {
const ext = project.externalizer;
const computed = computeExternalizerScore(ext?.score || {});
const scorePct = Math.round((computed / EXTERNALIZER_SCORE_MAX) * 100);
return (
<div key={project.id} onClick={() => onSelect(project)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
<div className="relative h-28 bg-gray-100">
{isGeneratingImage === project.id ? <ImageLoadingSpinner /> : <img src={project.images[0] || getPlaceholderImageUrl(project.name)} alt={project.name} className="w-full h-full object-cover" />}
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
<div className="absolute bottom-2 left-3 right-3"><h3 className="font-bold text-white text-sm truncate">{project.name}</h3></div>
<button onClick={e => { e.stopPropagation(); onToggleHeart(project.id); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/70">
<Heart size={14} className={project.isHearted ? 'text-red-500 fill-current' : 'text-white'} />
</button>
</div>
<div className="p-3 space-y-2">
<div className="flex items-center gap-1.5 flex-wrap">
{project.intent && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${INTENT_COLORS[project.intent]}`}>{PROJECT_INTENT_LABELS[project.intent]}</span>}
{ext?.stage && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[ext.stage]}`}>{ITEM_STAGE_LABELS[ext.stage]}</span>}
{ext?.externalized && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Externalized</span>}
</div>
<p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
{computed > 0 && (
<div>
<div className="flex justify-between items-center mb-1">
<span className="text-[10px] text-gray-400">Externalizer score</span>
<span className="text-[10px] font-bold text-violet-700">{computed}/{EXTERNALIZER_SCORE_MAX}</span>
</div>
<div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-violet-500 h-1 rounded-full" style={{ width: `${scorePct}%` }} /></div>
</div>
)}
{ext?.externalizationFile?.status && (
<div className="flex items-center gap-1">
<Target size={10} className="text-gray-400" />
<span className="text-[10px] text-gray-500 capitalize">{ext.externalizationFile.status}</span>
{ext.externalizationFile.recommendedRoute && <span className="text-[10px] text-gray-400">· {ext.externalizationFile.recommendedRoute}</span>}
</div>
)}
</div>
</div>
);
})}
</div>
</div>
)}
</div>
);
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {
const { user, loading } = useAuth();
const [projects, setProjects] = useState<Project[]>([]);
const [aiSettings, setAiSettings] = useLocalStorage<AISettings>(LOCAL_STORAGE_SETTINGS_KEY, INITIAL_AI_SETTINGS);
const [toasts, setToasts] = useState<ToastMessage[]>([]);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [isFormModalOpen, setIsFormModalOpen] = useState(false);
const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
const [isExportManagerOpen, setIsExportManagerOpen] = useState(false);
const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
const [activeFilters, setActiveFilters] = useState<{ types: string[]; statuses: string[]; tags: string[] }>({ types: [], statuses: [], tags: [] });
const [stagedFilters, setStagedFilters] = useState<{ types: string[]; statuses: string[]; tags: string[] }>({ types: [], statuses: [], tags: [] });
const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
const [isImageModalOpen, setIsImageModalOpen] = useState(false);
const [projectForImageUpdate, setProjectForImageUpdate] = useState<Project | null>(null);
const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'grid' | 'pipeline' | 'registry'>('grid');

useEffect(() => {
if (!user) { setProjects([]); setSelectedProject(null); return; }
return subscribeToProjects(user.uid, setProjects);
}, [user]);

const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
setToasts(prev => [...prev, { id: Date.now(), message, type }]);
}, []);

const handleUpdateProject = useCallback(async (id: string, data: Partial<Omit<Project, 'id'>>) => {
if (!user) return addToast('Must be logged in.', 'error');
const ts = { updatedAt: new Date().toISOString() };
setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, ...ts } : p));
setSelectedProject(prev => prev?.id === id ? { ...prev, ...data, ...ts } : prev);
try { await updateProject(id, data); }
catch (e) { addToast(`Update failed: ${(e as Error).message}`, 'error'); }
}, [user, addToast]);

const handleSaveProject = async (data: CreateProjectData, id: string | null) => {
if (!user) return addToast('Must be logged in.', 'error');
const payload = { ...data, strategy: { ...data.strategy, score: calculateStrategyScore(data.strategy) } };
if (id) {
try { await updateProject(id, payload); addToast('Project updated!', 'success'); }
catch (e) { addToast(`Update failed: ${(e as Error).message}`, 'error'); }
return;
}
try {
const ref = await addProject({ ...payload, userId: user.uid, aiGenerated: {}, isHearted: false });
const newProject: Project = { id: ref.id, ...payload, userId: user.uid, aiGenerated: {}, isHearted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
setProjects(prev => [newProject, ...prev]);
addToast('Project created!', 'success');
if (!payload.images[0]) {
setIsGeneratingImage(newProject.id);
try {
const url = await generateImage(IMAGE_GENERATION_PROMPT_TEMPLATE(newProject), aiSettings);
await handleUpdateProject(newProject.id, { images: [url] });
} catch (e) {
await handleUpdateProject(newProject.id, { images: [getPlaceholderImageUrl(newProject.name)] });
} finally { setIsGeneratingImage(null); }
}
} catch (e) { addToast(`Create failed: ${(e as Error).message}`, 'error'); }
};

const handleDeleteProject = async (id: string) => {
if (!user || !window.confirm('Delete this project?')) return;
setProjects(prev => prev.filter(p => p.id !== id));
setSelectedProject(null);
try { await deleteProject(id); addToast('Deleted.', 'success'); }
catch (e) { addToast(`Delete failed: ${(e as Error).message}`, 'error'); }
};

const handleUpdateAIGenerated = (projectId: string, field: AIAction, content: string | string[]) => {
const p = projects.find(p => p.id === projectId);
if (p) handleUpdateProject(projectId, { aiGenerated: { ...p.aiGenerated, [field]: content } });
};

const handleToggleHeart = (id: string) => {
const p = projects.find(p => p.id === id);
if (p) handleUpdateProject(id, { isHearted: !p.isHearted });
};

const handleBulkImport = (file: File) => {
if (!user) return addToast('Must be logged in.', 'error');
const reader = new FileReader();
reader.onload = async e => {
try {
const imported = JSON.parse(e.target?.result as string) as Omit<Project, 'id'>[];
if (!Array.isArray(imported) || imported.some(p => !p.name)) throw new Error('Invalid format.');
await Promise.all(imported.map(p => addProject({ ...p, strategy: { ...p.strategy, score: calculateStrategyScore(p.strategy) }, userId: user.uid, aiGenerated: p.aiGenerated ?? {}, isHearted: p.isHearted ?? false })));
addToast(`${imported.length} projects imported!`, 'success');
} catch (e) { addToast('Import failed.', 'error'); }
};
reader.readAsText(file);
};

const handleExport = () => {
downloadFile(JSON.stringify(projects.map(({ id, userId, ...p }) => p), null, 2), 'persona_linea_export_all.json', 'application/json');
addToast('Exported!', 'success');
};

const handleExportSingleProject = (project: Project) => {
const { id, userId, ...p } = project;
downloadFile(JSON.stringify(p, null, 2), `persona_linea_${project.name.toLowerCase().replace(/\s+/g, '_')}_export.json`, 'application/json');
addToast(`'${project.name}' exported!`, 'success');
};

const handleUpdateImage = async (projectId: string, url?: string) => {
setIsImageModalOpen(false);
if (url) { handleUpdateProject(projectId, { images: [url] }); addToast('Image updated!', 'success'); return; }
const p = projects.find(p => p.id === projectId);
if (!p) return addToast('Project not found.', 'error');
setIsGeneratingImage(projectId);
try {
const imgUrl = await generateImage(IMAGE_GENERATION_PROMPT_TEMPLATE(p), aiSettings);
await handleUpdateProject(projectId, { images: [imgUrl] });
addToast('Image generated!', 'success');
} catch (e) { addToast(`Image failed: ${(e as Error).message}`, 'error'); }
finally { setIsGeneratingImage(null); }
};

const filteredProjects = useMemo(() => {
const q = searchTerm.toLowerCase();
const filtered = projects.filter(p => {
const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
const matchType = !activeFilters.types.length || activeFilters.types.includes(p.type);
const matchStatus = !activeFilters.statuses.length || activeFilters.statuses.includes(p.status);
const matchTags = !activeFilters.tags.length || activeFilters.tags.some(t => p.tags.includes(t));
return matchSearch && matchType && matchStatus && matchTags;
});
return [...filtered].sort((a, b) => {
let cmp = 0;
if (sortBy === 'name') {
  cmp = a.name.localeCompare(b.name);
} else if (sortBy === 'createdAt') {
  cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
} else {
  cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
}
return sortDir === 'asc' ? cmp : -cmp;
});
}, [projects, searchTerm, activeFilters, sortBy, sortDir]);

const handleFilterChange = (type: 'types' | 'statuses' | 'tags', value: string) => {
setStagedFilters(prev => ({ ...prev, [type]: prev[type].includes(value) ? prev[type].filter(v => v !== value) : [...prev[type], value] }));
};

const handleApplyFilters = () => {
  setActiveFilters(stagedFilters);
  setIsFilterPanelOpen(false);
};

const handleClearFilters = () => {
  setStagedFilters({ types: [], statuses: [], tags: [] });
  setActiveFilters({ types: [], statuses: [], tags: [] });
};

const topTags = useMemo(() => {
const counts = projects.flatMap(p => p.tags).reduce((acc, tag) => { if (tag) acc[tag] = (acc[tag] || 0) + 1; return acc; }, {} as Record<string, number>);
return Object.entries(counts).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 10).map(([tag]) => tag);
}, [projects]);

const heartedProjects = useMemo(() => projects.filter(p => p.isHearted), [projects]);

if (loading) return <div className="flex items-center justify-center min-h-screen"><Sparkles className="animate-spin text-indigo-500" size={48} /></div>;
if (!user) return <LoginScreen />;

return (
<div className="bg-gray-50 min-h-screen font-sans">
<div className="fixed top-4 right-4 z-[100] space-y-2 w-full max-w-sm">
{toasts.map(t => <Toast key={t.id} toast={t} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />)}
</div>

  {selectedProject ? (
    <ProjectDetailView
      project={selectedProject} onClose={() => setSelectedProject(null)}
      onEdit={p => { setProjectToEdit(p); setIsFormModalOpen(true); }}
      onDelete={handleDeleteProject} onToggleHeart={handleToggleHeart}
      onExportProject={handleExportSingleProject} onUpdateAIGenerated={handleUpdateAIGenerated}
      onUpdateProject={handleUpdateProject} settings={aiSettings} addToast={addToast}
      onUpdateImage={p => { setProjectForImageUpdate(p); setIsImageModalOpen(true); }}
      isGeneratingImage={isGeneratingImage === selectedProject.id}
    />
  ) : (
    <div className="flex flex-col h-screen">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md"><BrainCircuit size={24} className="text-white" /></div>
            <div className="hidden sm:block"><h1 className="text-2xl font-bold text-gray-900 tracking-tight">PersonaLinea</h1><p className="text-xs text-gray-500">Where your projects live and evolve.</p></div>
          </div>
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => { setProjectToEdit(null); setIsFormModalOpen(true); }}><Plus size={18} /><span className="hidden md:block">New Project</span></PrimaryButton>
            <button onClick={() => setIsInfoModalOpen(true)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100" title="Help & Info"><Info size={20} /></button>
            <button onClick={() => setIsExportManagerOpen(true)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100" title="Export Manager"><Download size={20} /></button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100"><Settings size={20} /></button>
            <button onClick={() => signOutUser().catch(e => addToast(`Sign out failed: ${e.message}`, 'error'))} className="p-2.5 bg-white border border-gray-200 rounded-xl text-red-500 hover:bg-red-50"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {heartedProjects.length > 0 && viewMode === 'grid' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Heart size={20} className="text-red-500" /> Hearted</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {heartedProjects.map(p => (
                <div key={p.id} className="w-80 flex-shrink-0 cursor-pointer" onClick={() => setSelectedProject(p)}>
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">{isGeneratingImage === p.id ? <ImageLoadingSpinner size={16} /> : <img src={p.images[0] || getPlaceholderImageUrl(p.name)} alt={p.name} className="w-full h-full object-cover" />}</div>
                    <div className="overflow-hidden"><h3 className="font-bold text-gray-900 truncate">{p.name}</h3><p className="text-sm text-gray-500 truncate">{p.description}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 w-full flex-wrap">
          <h2 className="text-sm font-bold text-gray-700 whitespace-nowrap mr-auto">All Projects ({filteredProjects.length})</h2>
          {/* Sort controls */}
          <div className="flex items-center gap-1.5">
            {([
              { key: 'updatedAt', label: 'Updated' },
              { key: 'createdAt', label: 'Created' },
              { key: 'name',      label: 'A–Z' },
            ] as const).map(s => (
              <button
                key={s.key}
                onClick={() => {
                  if (sortBy === s.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                  else { setSortBy(s.key); setSortDir(s.key === 'name' ? 'asc' : 'desc'); }
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${sortBy === s.key ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                {s.label}{sortBy === s.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="p-1 bg-gray-200 rounded-lg flex items-center gap-1">
              {([
                { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
                { mode: 'pipeline', icon: Trello, label: 'Pipeline' },
                { mode: 'registry', icon: Zap, label: 'Registry' },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === mode ? `bg-white shadow ${mode === 'registry' ? 'text-violet-700' : 'text-gray-800'}` : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <button onClick={() => { setStagedFilters(activeFilters); setIsFilterPanelOpen(p => !p); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"><Filter size={16} /> Filter <ChevronDown size={16} /></button>
              {isFilterPanelOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 p-4">
                  <div className="mb-4"><h3 className="text-sm font-semibold text-gray-800 mb-2">By Type</h3><div className="flex flex-wrap gap-2">{PROJECT_TYPES.map(t => <button key={t} onClick={() => handleFilterChange('types', t)} className={`px-2 py-1 text-xs font-medium rounded-full border ${stagedFilters.types.includes(t) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{t}</button>)}</div></div>
                  <div className="mb-4"><h3 className="text-sm font-semibold text-gray-800 mb-2">By Status</h3><div className="flex flex-wrap gap-2">{PROJECT_STATUSES.map(s => <button key={s} onClick={() => handleFilterChange('statuses', s)} className={`px-2 py-1 text-xs font-medium rounded-full border ${stagedFilters.statuses.includes(s) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{s}</button>)}</div></div>
                  <div className="mb-4"><h3 className="text-sm font-semibold text-gray-800 mb-2">By Tags</h3><div className="flex flex-wrap gap-2">{topTags.map(t => <button key={t} onClick={() => handleFilterChange('tags', t)} className={`px-2 py-1 text-xs font-medium rounded-full border ${stagedFilters.tags.includes(t) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{t}</button>)}</div></div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={handleClearFilters} className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
                    <button onClick={handleApplyFilters} className="flex-2 px-6 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Apply Filters</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map(p => <ProjectCard key={p.id} project={p} onSelect={setSelectedProject} onToggleHeart={handleToggleHeart} isGeneratingImage={isGeneratingImage === p.id} />)}
            </div>
            {!filteredProjects.length && <div className="text-center py-16"><p className="text-gray-500">No projects found.</p></div>}
          </div>
        ) : viewMode === 'pipeline' ? (
          <ProjectPipelineView projects={filteredProjects} onSelect={setSelectedProject} onToggleHeart={handleToggleHeart} isGeneratingImage={isGeneratingImage} />
        ) : (
          <RegistryView projects={projects} onSelect={setSelectedProject} onToggleHeart={handleToggleHeart} isGeneratingImage={isGeneratingImage} />
        )}
      </main>
    </div>
  )}

  <ProjectFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveProject} projectToEdit={projectToEdit} onBulkImport={handleBulkImport} addToast={addToast} settings={aiSettings} />
  <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={aiSettings} onSave={setAiSettings} onExport={handleExport} onOpenExportManager={() => { setIsSettingsModalOpen(false); setIsExportManagerOpen(true); }} />
  <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
  <ImageUpdateModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} project={projectForImageUpdate} onUpdate={handleUpdateImage} isGenerating={!!isGeneratingImage} />
  <ExportManagerModal isOpen={isExportManagerOpen} onClose={() => setIsExportManagerOpen(false)} projects={projects} addToast={addToast} />
</div>

);
};

export default App;

function getExternalizerRecommendation(computed: number): string {
  if (computed >= 45) return 'Highly Externalizeable';
  if (computed >= 35) return 'Ready to Externalize';
  if (computed >= 25) return 'Potentially Viable';
  if (computed >= 15) return 'Needs Work';
  return 'Not Ready';
}
