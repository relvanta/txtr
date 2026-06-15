// MediaPromptsPanel.tsx
// Generates ready-to-use prompts for logo, product video, marketing images.
// No media is stored here — just prompts you paste into your tool of choice.

import React, { useState } from 'react';
import {
  Image, Video, Palette, Sparkles, Copy, Check,
  ChevronDown, ChevronUp, Wand2, Film, Target, Globe,
  Youtube, Code2, Megaphone, Info,
} from 'lucide-react';
import type { Project, AISettings } from './types';
import { generateContent } from './services/groqService';

// ─── types ────────────────────────────────────────────────────────────────────

type PromptCategory = 'logo' | 'product_image' | 'video';

interface VideoConfig {
  platform: 'github' | 'landing' | 'youtube' | 'x';
  tone: 'commercial' | 'informative' | 'technical' | 'demo';
}

interface GeneratedPrompt {
  id: string;
  category: PromptCategory;
  label: string;
  prompt: string;
  generatedAt: string;
  config?: VideoConfig;
}

// ─── copy button ─────────────────────────────────────────────────────────────

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors
        text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700">
      {copied ? <><Check size={10} className="text-green-500" /> Copied</> : <><Copy size={10} /> Copy</>}
    </button>
  );
};

// ─── prompt card ─────────────────────────────────────────────────────────────

const PromptCard: React.FC<{ p: GeneratedPrompt; onDelete: () => void }> = ({ p, onDelete }) => {
  const [expanded, setExpanded] = useState(true);

  const icons: Record<PromptCategory, React.ElementType> = {
    logo: Palette,
    product_image: Image,
    video: Film,
  };
  const Icon = icons[p.category];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-indigo-500" />
          <span className="text-xs font-bold text-gray-700">{p.label}</span>
          <span className="text-[10px] text-gray-400">
            {new Date(p.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyBtn text={p.prompt} />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-[10px] text-gray-300 hover:text-red-400 transition-colors px-1">✕</button>
          {expanded ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="p-3 bg-white">
          <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3 border border-gray-100">
            {p.prompt}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── section wrapper ──────────────────────────────────────────────────────────

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
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={13} className={iconCls} />
          <span className="text-xs font-bold text-gray-700">{title}</span>
          <span className="text-[10px] text-gray-400">{subtitle}</span>
        </div>
        {open ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
      </button>
      {open && <div className="p-3 space-y-3 bg-white">{children}</div>}
    </div>
  );
};

// ─── build prompts via AI ─────────────────────────────────────────────────────

function buildLogoPrompt(project: Project): string {
  return `You are a creative director generating an image generation prompt for a logo.

Project: ${project.name}
Category: ${project.category || 'technology'}
Description: ${project.description}
Tags: ${(project.tags || []).join(', ')}

Generate ONE ready-to-use image prompt (for Midjourney, DALL-E 3, or Ideogram) for a professional logo.

Requirements:
- Clean, minimal, modern logomark style
- Works on both light and dark backgrounds  
- No text in the image (logotype is separate)
- Capture the essence and domain of the product

Return ONLY the prompt text. No explanations, no prefix, no quotes. Just the prompt.`;
}

function buildProductImagePrompt(project: Project, purpose: string): string {
  const purposeMap: Record<string, string> = {
    github: 'GitHub repository social preview image (1280x640px), clean, developer-friendly, shows key feature or UI',
    landing: 'landing page hero image or feature illustration, modern SaaS style, light background',
    marketing: 'social media marketing image for LinkedIn/Twitter, eye-catching, professional, conveys value prop',
    og: 'Open Graph / meta preview image (1200x630px), clear product name and tagline visible, bold colors',
  };

  return `You are a product marketing art director generating an image generation prompt.

Product: ${project.name}
Description: ${project.description}
Category: ${project.category || 'technology'}
Tags: ${(project.tags || []).join(', ')}
Purpose: ${purposeMap[purpose] || purpose}

Generate ONE ready-to-use image prompt (for Midjourney, DALL-E 3, Firefly, or Ideogram).

Requirements:
- Photorealistic UI mockup or stylized product illustration as appropriate
- Conveys the product's core value visually
- Professional, modern aesthetic
- Specify aspect ratio in the prompt

Return ONLY the prompt text. No explanations, no prefix, no quotes. Just the prompt.`;
}

function buildVideoPrompt(project: Project, config: VideoConfig): string {
  const platformMap: Record<string, string> = {
    github: 'GitHub README embedded demo GIF or short MP4 (15-30 seconds), silent, shows core workflow',
    landing: 'landing page hero video (30-60 seconds), light background, smooth animations, no voiceover',
    youtube: 'YouTube product demo (2-4 minutes), narrated walkthrough, professional screen recording style',
    x: 'X/Twitter short demo video (under 60 seconds), attention-grabbing first 3 seconds, captions recommended',
  };

  const toneMap: Record<string, string> = {
    commercial: 'polished commercial tone — emotion-driven, focuses on transformation and outcome',
    informative: 'educational tone — clear step-by-step, focuses on how it works',
    technical: 'developer-focused tone — shows code, architecture, or technical depth',
    demo: 'product demo tone — click-by-click walkthrough, shows real UI in action',
  };

  return `You are a video producer and scriptwriter. Generate a complete video production brief and shot list prompt.

Product: ${project.name}
Description: ${project.description}
Category: ${project.category || 'technology'}
Key features/tags: ${(project.tags || []).join(', ')}

Platform: ${platformMap[config.platform]}
Tone: ${toneMap[config.tone]}

Generate a structured video brief that includes:
1. HOOK (first 3 seconds — what grabs attention)
2. PROBLEM (the pain being solved)
3. SOLUTION (the product in action — 3-5 key moments/shots)
4. CTA (what the viewer should do next)
5. STYLE NOTES (colors, music mood, pacing, transitions)
6. TOOLS RECOMMENDED (screen recording tool, editing tool, AI video tool if relevant)

This brief should be usable as a prompt for an AI video tool (Runway, Sora, Kling) OR as a human production brief.

Return the brief in clean structured text. No markdown headers — use ALL CAPS labels instead.`;
}

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  project: Project;
  settings: AISettings;
  addToast: (msg: string, type: 'success' | 'error') => void;
}

export const MediaPromptsPanel: React.FC<Props> = ({ project, settings, addToast }) => {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // video config state
  const [videoPlatform, setVideoPlatform] = useState<VideoConfig['platform']>('landing');
  const [videoTone, setVideoTone] = useState<VideoConfig['tone']>('demo');

  const run = async (
    category: PromptCategory,
    label: string,
    promptBuilder: () => string,
    config?: VideoConfig,
  ) => {
    setLoading(label);
    try {
      const result = await generateContent(promptBuilder(), settings, 'Content Generation');
      const newPrompt: GeneratedPrompt = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        category,
        label,
        prompt: result.trim(),
        generatedAt: new Date().toISOString(),
        config,
      };
      setPrompts(prev => [newPrompt, ...prev]);
      addToast(`${label} prompt ready`, 'success');
    } catch (e) {
      addToast(`Failed: ${(e as Error).message}`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const deletePrompt = (id: string) => setPrompts(prev => prev.filter(p => p.id !== id));

  const btnCls = (active: boolean) =>
    `px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
      active ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
    }`;

  const genBtn = (label: string, onClick: () => void, icon: React.ElementType) => {
    const Icon = icon;
    const isLoading = loading === label;
    return (
      <button onClick={onClick} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm w-full justify-center">
        {isLoading ? <Sparkles size={12} className="animate-spin" /> : <Icon size={12} />}
        {isLoading ? 'Generating…' : label}
      </button>
    );
  };

  const logoPrompts = prompts.filter(p => p.category === 'logo');
  const imagePrompts = prompts.filter(p => p.category === 'product_image');
  const videoPrompts = prompts.filter(p => p.category === 'video');

  return (
    <div className="space-y-3">

      {/* Header */}
      <div>
        <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <Wand2 size={14} className="text-purple-500" /> Media Prompts
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Generate prompts for logos, images, and videos — paste into your tool of choice.
        </p>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-purple-50 border border-purple-100 rounded-xl">
        <Info size={11} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-purple-600 leading-relaxed">
          Prompts are generated for <strong>{project.name}</strong> based on its description and tags.
          Media assets are not stored in PersonaLinea — use GitHub, Cloudinary, Uploadcare, or any CDN you choose.
        </p>
      </div>

      {/* ── LOGO ── */}
      <Section icon={Palette} title="Logo" subtitle="Logomark prompt for image generators" iconCls="text-pink-500">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Generates a Midjourney / DALL-E 3 / Ideogram prompt for a minimal, professional logomark.
          No text in the image — that's intentional (text is handled separately as a wordmark).
        </p>
        {genBtn('Generate Logo Prompt', () => run('logo', 'Logo — Logomark', () => buildLogoPrompt(project)), Palette)}
        {logoPrompts.map(p => <PromptCard key={p.id} p={p} onDelete={() => deletePrompt(p.id)} />)}
      </Section>

      {/* ── PRODUCT IMAGES ── */}
      <Section icon={Image} title="Product Images" subtitle="Marketing & preview images" iconCls="text-blue-500">
        <p className="text-[11px] text-gray-500">
          Choose a purpose — each generates a tailored prompt for that context.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {genBtn('GitHub Preview', () =>
            run('product_image', 'Image — GitHub Preview', () => buildProductImagePrompt(project, 'github')), Code2)}
          {genBtn('Landing Page Hero', () =>
            run('product_image', 'Image — Landing Hero', () => buildProductImagePrompt(project, 'landing')), Globe)}
          {genBtn('Social / Marketing', () =>
            run('product_image', 'Image — Social Marketing', () => buildProductImagePrompt(project, 'marketing')), Megaphone)}
          {genBtn('OG / Meta Preview', () =>
            run('product_image', 'Image — OG Preview', () => buildProductImagePrompt(project, 'og')), Target)}
        </div>
        {imagePrompts.map(p => <PromptCard key={p.id} p={p} onDelete={() => deletePrompt(p.id)} />)}
      </Section>

      {/* ── VIDEO ── */}
      <Section icon={Video} title="Video Brief" subtitle="Script & shot list for product videos" iconCls="text-violet-500">
        <p className="text-[11px] text-gray-500">
          Generates a complete video production brief — usable as an AI video prompt (Runway, Kling, Sora) or a human production guide.
        </p>

        {/* Platform selector */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-gray-600">Platform</p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'landing', label: 'Landing Page', icon: Globe },
              { key: 'github',  label: 'GitHub README', icon: Code2 },
              { key: 'youtube', label: 'YouTube', icon: Youtube },
              { key: 'x',       label: 'X / Twitter', icon: Megaphone },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setVideoPlatform(key)} className={btnCls(videoPlatform === key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone selector */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-gray-600">Tone</p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'demo',        label: 'Product Demo' },
              { key: 'commercial',  label: 'Commercial' },
              { key: 'informative', label: 'Informative' },
              { key: 'technical',   label: 'Technical' },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setVideoTone(key)} className={btnCls(videoTone === key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {genBtn(
          `Generate ${videoPlatform.charAt(0).toUpperCase() + videoPlatform.slice(1)} · ${videoTone} Brief`,
          () => {
            const config: VideoConfig = { platform: videoPlatform, tone: videoTone };
            run('video',
              `Video — ${videoPlatform} · ${videoTone}`,
              () => buildVideoPrompt(project, config),
              config,
            );
          },
          Film,
        )}
        {videoPrompts.map(p => <PromptCard key={p.id} p={p} onDelete={() => deletePrompt(p.id)} />)}
      </Section>

      {/* Media storage note */}
      <div className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
        <p className="text-[10px] text-gray-400 font-bold mb-1">💡 Media storage options</p>
        <div className="space-y-0.5">
          {[
            'GitHub repo /assets folder — free, version-controlled, works if project has a repo',
            'Cloudinary free tier — 25GB, URL-based transforms, good CDN',
            'Uploadcare — generous free tier, good for PWA/web projects',
            'Bunny.net storage — cheap, fast CDN, ~$0.01/GB',
            'R2 (Cloudflare) — free egress, S3-compatible, solid long-term option',
          ].map(o => (
            <p key={o} className="text-[10px] text-gray-500 flex items-start gap-1.5">
              <span className="shrink-0 text-gray-300 mt-0.5">·</span>{o}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MediaPromptsPanel;
