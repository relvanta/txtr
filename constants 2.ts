import { Project, ProjectType, ProjectStatus, AIAction, AIExpert, AISettings, AIProvider, AITask, MonetizationModel, OpenSpec, CommercialDisposition, AssetArchetype, type TechnicalAudit, type ExecutiveBrief, type CommercialNotes, TargetProfile, type CompletenessCheck, type CompletenessReport, type ExportConfig, type ExportField } from './types';
import { TrendingUp, Wrench, Eye, Bot } from 'lucide-react';

export const LOCAL_STORAGE_PROJECTS_KEY = 'projectLibrary_projects';
export const LOCAL_STORAGE_SETTINGS_KEY = 'projectLibrary_ai_settings';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'PersonaLinea',
    description: 'An AI-powered form builder that creates beautiful, responsive forms from a simple text description. Features advanced analytics and integration capabilities.',
    type: ProjectType.Website,
    category: 'Productivity',
    status: ProjectStatus.Shipped,
    isPublic: true,
    tags: ['React', 'AI', 'SaaS', 'Forms'],
    repository: 'https://github.com/user/persona-linea',
    liveUrl: '',
    images: ['https://placehold.co/800x450/6366f1/ffffff?text=PersonaLinea'],
    createdAt: new Date('2023-10-01T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: {},
    isHearted: true,
    strategy: {
      model: MonetizationModel.Subscription,
      revenuePotential: 8,
      easeOfBuild: 6,
      marketValidation: 9,
      score: 114,
      notes: 'High demand for user-friendly form builders with AI capabilities. Strong competition from Typeform, Jotform.',
    },
  },
  {
    id: '2',
    name: 'Gradient UI Kit',
    description: 'A comprehensive Tailwind CSS UI kit for building modern, gradient-heavy interfaces. Includes hundreds of components and templates.',
    type: ProjectType.Tool,
    category: 'Design System',
    status: ProjectStatus.NearlyThere,
    isPublic: true,
    tags: ['TailwindCSS', 'UI Kit', 'Frontend'],
    repository: 'https://github.com/user/gradient-ui',
    liveUrl: 'https://gradient-ui.dev',
    images: ['https://placehold.co/800x450/a78bfa/ffffff?text=Gradient+UI'],
    createdAt: new Date('2023-08-15T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: {},
    isHearted: false,
     strategy: {
      model: MonetizationModel.OneTime,
      revenuePotential: 5,
      easeOfBuild: 9,
      marketValidation: 7,
      score: 143,
      notes: 'One-time purchase model is common for UI kits. Market is saturated but good niche potential.',
    },
  },
  {
    id: '3',
    name: 'Code-Pilot Assistant',
    description: 'A Chrome Extension that provides contextual code suggestions and documentation lookup directly in your browser-based IDEs.',
    type: ProjectType.ChromeExtension,
    category: 'Developer Tool',
    status: ProjectStatus.Ongoing,
    isPublic: false,
    tags: ['Chrome', 'AI', 'Productivity'],
    repository: 'https://github.com/user/codepilot',
    liveUrl: 'https://chrome.google.com/webstore',
    images: ['https://placehold.co/800x450/34d399/ffffff?text=Code-Pilot'],
    createdAt: new Date('2024-01-20T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: {},
    isHearted: true,
    strategy: {
      model: MonetizationModel.Freemium,
      revenuePotential: 7,
      easeOfBuild: 5,
      marketValidation: 8,
      score: 100,
      notes: 'Freemium model can attract a large user base. Pro features could include advanced suggestions and team collaboration.',
    },
  },
  {
    id: '4',
    name: 'Project Phoenix',
    description: 'A native mobile application for project management, designed with a focus on simplicity and team collaboration.',
    type: ProjectType.App,
    category: 'Productivity',
    status: ProjectStatus.Idea,
    isPublic: false,
    tags: ['Mobile', 'React Native', 'Collaboration'],
    repository: '',
    liveUrl: '',
    images: ['https://placehold.co/800x450/f59e0b/ffffff?text=Phoenix'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: {},
    isHearted: false,
    strategy: {
      model: MonetizationModel.NotMonetized,
      revenuePotential: 6,
      easeOfBuild: 7,
      marketValidation: 6,
      score: 113,
      notes: 'Initial idea phase. Monetization strategy to be defined.',
    },
  },
];

export const PROJECT_TYPES = Object.values(ProjectType);
export const PROJECT_STATUSES = Object.values(ProjectStatus);
export const MONETIZATION_MODELS = Object.values(MonetizationModel);

export const AI_PROVIDERS = Object.values(AIProvider);

export const CONFIGURABLE_AI_TASKS: AITask[] = [
    'Image Generation',
    'Content Generation',
    'Content Parsing',
    'Chat_Marketing Guru',
    'Chat_Technical Architect',
    'Chat_UX Specialist',
    'Chat_General Assistant',
    'OpenSpec Proposal Generation'
];

export const INITIAL_AI_SETTINGS: AISettings = {
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: 'You are a helpful assistant for a project management application.',
    tasks: {
        'Image Generation': { provider: AIProvider.Gemini, model: 'gemini-2.5-flash-image' },
        'Content Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Content Parsing': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Chat_Marketing Guru': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Chat_Technical Architect': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Chat_UX Specialist': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Chat_General Assistant': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'OpenSpec Proposal Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Externalizer Score Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Externalization File Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Technical Audit Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Executive Brief Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Commercial Notes Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Outreach Templates Generation': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Expert Lab Commercialization Architect': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Expert Lab Technical Auditor': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Expert Lab Commercial Strategist': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
        'Expert Lab Lifecycle Advisor': { provider: AIProvider.Groq, model: 'llama-3.3-70b-versatile' },
    }
};

export const INITIAL_OPEN_SPEC: Omit<OpenSpec, 'spec_md' | 'changes'> = {
  initialized: true,
  readme_md: '# OpenSpec Project\n\nThis project is managed using the OpenSpec standard. For more details, visit https://github.com/Fission-AI/OpenSpec.',
  agents_md: '# AGENTS\n\nThis file defines the AI agents that can work on this project.\n\n- **DeveloperAgent**: Responsible for implementing code changes based on tasks.\n- **ReviewerAgent**: Responsible for reviewing code and providing feedback.',
};

export const AI_EXPERT_ROLES: AIExpert[] = [
  {
    name: "Marketing Guru",
    description: "Get advice on branding, strategy, and social media presence.",
    icon: TrendingUp,
    prompt: "You are a world-class marketing expert and brand strategist. Your goal is to provide creative, actionable marketing advice for the given project. Be concise, inspiring, and focus on modern digital strategies.",
    suggestions: [
      "Write a tweet to announce the launch.",
      "Suggest 5 blog post ideas.",
      "Who is the target audience for this?",
      "Brainstorm a catchy tagline."
    ]
  },
  {
    name: "Technical Architect",
    description: "Discuss technology stacks, scalability, and improvements.",
    icon: Wrench,
    prompt: "You are a seasoned technical architect and senior software engineer. Your goal is to provide technical advice, suggest improvements, and analyze the project from a technology perspective. Be clear, logical, and provide code examples where helpful.",
    suggestions: [
      "Suggest 3 technical improvements.",
      "What are potential scalability bottlenecks?",
      "How could I improve performance?",
      "Write a basic API endpoint for a key feature."
    ]
  },
  {
    name: "UX Specialist",
    description: "Improve user flows, accessibility, and overall experience.",
    icon: Eye,
    prompt: "You are a user experience (UX) and user interface (UI) design expert. Your goal is to identify pain points, suggest UI/UX improvements, and champion the user's needs. Be empathetic, user-focused, and provide practical design advice.",
    suggestions: [
      "Identify 3 potential UX pain points.",
      "How can I improve the onboarding flow?",
      "Suggest a new feature to increase engagement.",
      "Critique the project description from a user's perspective."
    ]
  },
  {
    name: "General Assistant",
    description: "Ask anything! Get help with descriptions, ideas, and more.",
    icon: Bot,
    prompt: "You are a helpful, general-purpose AI assistant. Your goal is to answer questions and perform tasks related to the project. Be versatile, friendly, and helpful.",
    suggestions: [
      "Summarize this project in one sentence.",
      "Generate a short description.",
      "What are some potential use cases?",
      "Suggest 5 relevant tags."
    ]
  },
];


export const AI_PROMPT_TEMPLATES: Record<AIAction, (p: Project) => string> = {
  readme: (p) => {
    let prompt = `Create a professional, comprehensive, and well-structured README.md for a project with the following details. Format it in GitHub-flavored markdown.
- Project Name: "${p.name}"
- Project Type: ${p.type}
- Description: "${p.description}"
- Core Technologies/Tags: ${p.tags.join(', ')}

The README should include these standard sections:
1.  **Overview**: A brief, engaging introduction.
2.  **Key Features**: A bulleted list of the most important features.
3.  **Tech Stack**: A list of the technologies used.
4.  **Getting Started**: Simple instructions for installation and setup.
5.  **Usage**: A quick example of how to use the project.
`;

    if (p.strategy && p.strategy.model !== MonetizationModel.NotMonetized) {
        prompt += `
6.  **Strategy**:
    - **Monetization Model**: ${p.strategy.model}
`;
    }

    if (p.openSpec?.initialized) {
        prompt += `
7.  **Project Management**: This project is managed using the OpenSpec standard for AI-driven development.
`;
    }

    prompt += `
8.  **Contributing**: Guidelines for contributing to the project.
9.  **License**: Mention it's under MIT License (or a common default).`;

    return prompt;
  },

  description: (p) =>
    `Write a compelling, marketing-focused 2-3 paragraph description for the project "${p.name}".
    - It's a ${p.type}.
    - Core functionality: "${p.description}"
    - Target Audience: Developers, Designers, Project Managers (infer from project type and description).
    The tone should be professional yet exciting. Highlight the key benefits for the user. Avoid overly technical jargon.`,

  tags: (p) =>
    `Analyze the following project and suggest 8-12 relevant, single-word or two-word tags.
    - Name: "${p.name}"
    - Type: ${p.type}
    - Description: "${p.description}"
    - Existing Tags: ${p.tags.join(', ')}
    
    Provide a diverse mix of tags covering technology, features, domain, and use case.
    Return the response as a single, comma-separated string (e.g., "react,typescript,ai,saas,productivity").`,
  
  marketingIdeas: (p) =>
    `Generate 5 creative and actionable marketing strategies for the project "${p.name}".
    - It's a ${p.type}.
    - Description: "${p.description}"
    
    For each strategy, provide a brief explanation. Consider channels like social media (Twitter/X, LinkedIn), content marketing (blog posts), developer communities (Hacker News, Dev.to), and product launch platforms (Product Hunt). Format as a bulleted list.`,

  improvements: (p) =>
    `Based on the project details below, suggest 5-7 technical and user experience (UX) improvements.
    - Project Name: "${p.name}"
    - Type: ${p.type}
    - Description: "${p.description}"
    
    Focus on areas like performance, accessibility, user engagement, scalability, and potential new features. Format as a bulleted list.`,
    
  seoMetadata: (p) => 
    `Generate SEO metadata for the project "${p.name}".
    - Description: "${p.description}"
    
    Return a JSON object with three keys:
    1. "title": A concise, catchy title tag (under 60 characters).
    2. "metaDescription": An engaging meta description (under 160 characters).
    3. "keywords": A comma-separated string of 5-7 relevant keywords.
    
    Example format:
    {
      "title": "Project Name | A Brief Tagline",
      "metaDescription": "A short, compelling summary of what the project does and its benefits.",
      "keywords": "keyword1, keyword2, keyword3"
    }`,

  featureList: (p) =>
    `From the project description, extract and list the key features of "${p.name}".
    - Description: "${p.description}"
    
    Format the response as a clean, bulleted list. If the description is sparse, infer logical features based on the project type and name.`,
  
  useCases: (p) => 
    `Describe 3-4 real-world use case scenarios for the project "${p.name}".
    - Type: ${p.type}
    - Description: "${p.description}"
    
    For each use case, describe a user persona and how they would benefit from using the project. Format as a bulleted list with bold headings for each scenario.`,
    
  marketAnalysis: (p) =>
    `Perform a market analysis for the project "${p.name}".
    - Type: ${p.type}
    - Description: "${p.description}"
    - Target Audience (inferred): Developers, Designers, PMs

    Provide a concise analysis covering:
    1.  **Target Market Size & Opportunity**: Briefly estimate the potential market.
    2.  **Key Market Trends**: What are the current trends in this space?
    3.  **Potential Challenges**: What hurdles might this project face?
    
    Format as a bulleted list with bold headings.`,
    
  competitorAnalysis: (p) =>
    `Identify 2-3 key competitors for the project "${p.name}".
    - Type: ${p.type}
    - Description: "${p.description}"

    For each competitor, provide:
    1.  **Name**: The competitor's name.
    2.  **Strengths**: What are they good at?
    3.  **Weaknesses**: Where do they fall short?
    4.  **Unique Selling Proposition (USP)**: What makes our project different or better?

    Format as a bulleted list with bold headings for each competitor.`,
    
  monetizationSuggestions: (p) =>
    `Suggest three potential monetization models for the project "${p.name}".
    - Type: ${p.type}
    - Description: "${p.description}"
    - Current suggested model: ${p.strategy?.model || 'Not set'}

    For each suggestion (e.g., Subscription, One-Time Purchase, Freemium, Usage-Based), provide a brief rationale explaining why it might be a good fit for this specific project. Format as a bulleted list.`,
};

export const AI_PARSE_PROMPT_TEMPLATE = (context: string, projectTypes: string[]) => 
`You are an expert project analyst. Analyze the provided context (from a URL or a file) for a software project. Your task is to extract key information and return it as a valid JSON object.

The JSON object MUST have the following keys and value types:
- "name": string (The project's name)
- "description": string (A concise 2-3 sentence summary)
- "category": string (A single, general category, e.g., "Productivity", "Developer Tool", "Design System")
- "tags": string[] (An array of 5-8 relevant technology or concept keywords)
- "type": string (The project type. Must be ONE of these exact values: ${projectTypes.join(', ')})

Analyze the following context:
---
${context}
---

IMPORTANT: Respond ONLY with the raw JSON object. Do not include any explanatory text, markdown formatting like \`\`\`json, or any other characters before or after the JSON object.`;


export const IMAGE_GENERATION_PROMPT_TEMPLATE = (p: Project) => 
`Generate a visually stunning, high-resolution hero image for a project. The image should be abstract and artistic, reflecting a premium, high-tech aesthetic. Use a palette of indigo, purple, and subtle gradients. The image should be suitable as a background or showcase image.

Project Details:
- Name: "${p.name}"
- Type: ${p.type}
- Description: "${p.description}"

Do not include any text or logos in the image. Focus on creating a beautiful, modern, and clean visual that captures the essence of the project.`;

export const OPEN_SPEC_FROM_PROJECT_TEMPLATE = (p: Project): string => `
# ${p.name} - Specification

## 1. Purpose

${p.description}

## 2. Requirements

### 2.1. Core Functionality
- **Type**: The project is a ${p.type}.
- **Category**: It falls under the ${p.category} category.

### 2.2. Technology Stack
- **Tags**: The project utilizes the following technologies: ${p.tags.join(', ')}.

### 2.3. Links
- **Repository**: ${p.repository || 'Not specified'}
- **Live URL**: ${p.liveUrl || 'Not specified'}
`;

export const OPEN_SPEC_PROPOSAL_GENERATION_TEMPLATE = (spec: string, goal: string) => `
You are an expert project manager who understands the OpenSpec standard for AI development. Your task is to generate a change proposal based on a user's goal and the current project specification.

You must return a valid JSON object containing three keys: "proposal_md", "tasks_md", and "delta_md".

**Current Project Specification (spec.md):**
---
${spec}
---

**User's Goal for the Change:**
---
"${goal}"
---

**Instructions:**

1.  **proposal_md**: Write a clear, concise proposal in Markdown. It should include:
    - A "Goal" section explaining what the change aims to achieve.
    - A "Justification" section explaining why this change is valuable.
    - An "Impact" section outlining the expected outcomes.

2.  **tasks_md**: Break down the goal into a series of concrete, actionable tasks in Markdown. Each task should be a checklist item (\`- [ ]\`). The tasks should be logical and cover the work needed to implement the proposal.

3.  **delta_md**: Create a delta specification file in Markdown. This file should only describe the *changes* to the main specification. Use the following format for requirements:
    - For new requirements, use \`- [ADDED] A clear description of the new requirement.\`
    - For modified requirements, use \`- [MODIFIED] A clear description of the modified requirement.\`
    - For removed requirements, use \`- [REMOVED] A clear description of the requirement being removed.\`
    - Base your changes on the "Requirements" section of the current spec. If the goal is to add a new feature, you should add new requirements under a relevant subsection or a new one.

**IMPORTANT:** Respond ONLY with the raw JSON object. Do not include any explanatory text, markdown formatting like \`\`\`json, or any other characters before or after the JSON object.
`;

// --- PROJECT INTENTS ---

export const PROJECT_INTENTS = [
  'explore',
  'build',
  'monetize',
  'learn',
  'experiment',
] as const;

export type ProjectIntent = typeof PROJECT_INTENTS[number];


// --- ITEM STAGES ---

export const ITEM_STAGES = [
  'idea',
  'planning',
  'building',
  'testing',
  'shipped',
] as const;

export type ItemStage = typeof ITEM_STAGES[number];


// --- EXTERNALIZATION ---

export const EXTERNALIZATION_STATUSES = [
  'draft',
  'validated',
  'archived',
] as const;

export const RECOMMENDED_ROUTES = [
  'handoff',
  'open-source',
  'explore',
] as const;


// --- EXTERNALIZER SCORE ---

export const EXTERNALIZER_SCORE_FIELDS = [
  'pain',
  'clarity',
  'speed',
  'leverage',
  'transferability',
  'obsession',
] as const;

export const EXTERNALIZER_SCORE_MAX = 115;

// Weighted scoring function (important)
export const computeExternalizerScore = (scores: Record<string, number>): number => {
  const weights: Record<string, number> = {
    pain: 3,
    clarity: 2,
    speed: 1.5,
    leverage: 2,
    transferability: 2,
    obsession: 1,
  };

  let total = 0;

  for (const key of EXTERNALIZER_SCORE_FIELDS) {
    const value = scores[key] ?? 0;
    total += value * (weights[key] || 1);
  }

  return Math.round(total);
};
export const getExternalizerRecommendation = (score: number): string => {
  if (score >= 90) return 'BUILD';
  if (score >= 70) return 'VALIDATE';
  if (score >= 50) return 'EXPLORE';
  return 'DROP';
};
// --- Add color mappings (used for UI badges) ---

export const STAGE_COLORS: Record<string, string> = {
  idea: 'bg-gray-100 text-gray-600',
  planning: 'bg-blue-100 text-blue-600',
  building: 'bg-yellow-100 text-yellow-700',
  testing: 'bg-purple-100 text-purple-600',
  shipped: 'bg-green-100 text-green-600',
};

export const INTENT_COLORS: Record<string, string> = {
  explore: 'bg-gray-100 text-gray-600',
  build: 'bg-blue-100 text-blue-600',
  monetize: 'bg-green-100 text-green-600',
  learn: 'bg-purple-100 text-purple-600',
  experiment: 'bg-yellow-100 text-yellow-700',
};

// --- EXTERNALIZER OS PROMPT TEMPLATES ---

export const EXTERNALIZER_SCORE_GENERATION_TEMPLATE = (p: Project): string => `
You are an expert product scout and idea validator. Evaluate the following project/idea and score it across 6 dimensions, each on a scale of 1–10.

Project Name: "${p.name}"
Type: ${p.type}
Description: "${p.description}"
Tags: ${p.tags.join(', ')}
Stage: ${p.externalizer?.stage || 'unknown'}

Scoring dimensions (be honest and critical, not generous):
- pain (1-10): How acute and widespread is the problem being solved? Is this a real hairon-fire problem or a nice-to-have?
- clarity (1-10): How clearly defined and demonstrable is the solution? Can it be explained in under 10 minutes?
- speed (1-10): How fast could this realistically be built, shipped, or handed off?
- leverage (1-10): Does solving this unlock other opportunities, markets, or derivative products?
- transferability (1-10): How easily can this be handed off, replicated, or adopted by someone else?
- obsession (1-10): Based on the description and tags, how personally driven does the creator seem about this?

Return ONLY a valid JSON object with these exact keys (numbers, not strings):
{
  "pain": 0,
  "clarity": 0,
  "speed": 0,
  "leverage": 0,
  "transferability": 0,
  "obsession": 0,
  "reasoning": "A brief 2-3 sentence explanation of the scores."
}
`;

export const EXTERNALIZATION_FILE_GENERATION_TEMPLATE = (p: Project): string => `
You are an expert at distilling ideas into structured, transferable artifacts. Based on the project below, generate a complete externalization document.

Project Name: "${p.name}"
Type: ${p.type}
Description: "${p.description}"
Tags: ${p.tags.join(', ')}
Repository: ${p.repository || 'not provided'}
Live URL: ${p.liveUrl || 'not provided'}

Generate a structured externalization file. Return ONLY a valid JSON object:
{
  "problem": "Clear 1-3 sentence problem statement. What is broken or missing? Who suffers from it?",
  "insight": "The key non-obvious insight that makes this solution possible or better than existing approaches.",
  "solution": "Concise description of the solution. What does it do? How does it work at a high level?",
  "proof": "${p.repository || p.liveUrl || 'Describe what evidence exists that this works (demo, repo, users, etc.)'}",
  "status": "validated",
  "recommendedRoute": "handoff",
  "notes": "Any caveats, context, or next steps relevant to handing this off or sharing it."
}

For recommendedRoute, choose the most appropriate:
- "handoff": Ready to be given to another team, client, or developer
- "open-source": Best value as a public, community-owned project
- "explore": Needs more validation before deciding

For status, use "validated" unless context suggests otherwise.
`;

export const GENERATE_EXTERNALIZATION_MD = (p: Project): string => {
  const ext = p.externalizer?.externalizationFile;
  if (!ext) return '';
  return `# Externalization: ${p.name}

## Problem
${ext.problem || '...'}

## Insight
${ext.insight || '...'}

## Solution
${ext.solution || '...'}

## Proof
${ext.proof || '...'}

## Status
${ext.status || 'validated'}

## Recommended Route
${ext.recommendedRoute || 'explore'}

## Notes
${ext.notes || '...'}
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// HANDOFF PIPELINE — CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// --- Strategy Score → Commercial Disposition ---

export const getCommercialDisposition = (score: number): CommercialDisposition => {
  if (score >= 150) return CommercialDisposition.Sell;
  if (score >= 80)  return CommercialDisposition.License;
  return CommercialDisposition.Keep;
};

export const DISPOSITION_CONFIG: Record<CommercialDisposition, {
  label: string;
  color: string;
  bg: string;
  description: string;
}> = {
  [CommercialDisposition.Sell]: {
    label: 'Sell',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    description: 'High validation + revenue signal. Asset is ready for exclusive license or outright acquisition.',
  },
  [CommercialDisposition.License]: {
    label: 'License',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    description: 'Moderate validation. Non-exclusive licensing is the recommended route.',
  },
  [CommercialDisposition.Keep]: {
    label: 'Keep',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    description: 'Low commercial signal. Continue development before attempting transfer.',
  },
};

// --- Document Library — AI Prompt Templates ---

export const TECH_AUDIT_GENERATION_TEMPLATE = (p: Project): string => `
You are a senior technical architect performing a pre-sale technical audit.
Analyze the project below and generate a complete TechnicalAudit document.

Project Name: "${p.name}"
Type: ${p.type}
Description: "${p.description}"
Tags: ${p.tags.join(', ')}
Repository: ${p.repository || 'not provided'}
Live URL: ${p.liveUrl || 'not provided'}
Strategy Notes: ${p.strategy?.notes || 'none'}

Return ONLY a valid JSON object with this exact shape:
{
  "stack": [
    { "layer": "Frontend", "tech": "...", "version": "...", "notes": "..." },
    { "layer": "Backend", "tech": "..." },
    { "layer": "Database", "tech": "..." },
    { "layer": "Auth", "tech": "..." },
    { "layer": "Infra / Deploy", "tech": "..." }
  ],
  "debt": [
    {
      "id": "d1",
      "title": "Short title",
      "description": "What the issue is and why it matters for transfer",
      "severity": "Medium",
      "effortDays": 3,
      "category": "Architecture"
    }
  ],
  "deploymentEnv": "e.g. Netlify + Firebase",
  "testCoverage": 20,
  "documentationLevel": 6,
  "maintainabilityScore": 7,
  "assetArchetype": "Not Decided",
  "notes": "Any additional transfer-readiness context"
}

severity must be one of: Low, Medium, High, Critical
category must be one of: Architecture, Security, Performance, Testing, Documentation, Legacy
assetArchetype must be one of: Non-Exclusive License, Exclusive with Buyout, Outright Sale, Open Source, Not Decided
All numeric scores are integers 0-10 except effortDays (integer days) and testCoverage (0-100).
Be honest and critical — this is a due diligence document, not marketing.
`;

export const EXECUTIVE_BRIEF_GENERATION_TEMPLATE = (p: Project): string => `
You are a Commercialization Architect generating an executive brief for a software asset being prepared for transfer.
Write for a buyer or operator who needs to understand the asset in under 5 minutes.
Avoid marketing language. Be factual, specific, and operator-focused.

Project Name: "${p.name}"
Type: ${p.type}
Description: "${p.description}"
Tags: ${p.tags.join(', ')}
Problem (from system card): ${p.systemCard?.problem || 'not defined'}
Solution: ${p.systemCard?.solution || 'not defined'}
Market Signal: ${p.systemCard?.marketSignal || 'not defined'}
What works: ${p.systemCard?.worksWell || 'not specified'}
What doesn't: ${p.systemCard?.doesntWork || 'not specified'}
Externalizer insight: ${p.externalizer?.externalizationFile?.insight || 'not specified'}
Strategy notes: ${p.strategy?.notes || 'not specified'}

Return ONLY a valid JSON object:
{
  "problem": "2-3 sentence problem statement. What is broken, who suffers, and what it costs them.",
  "solution": "2-3 sentences. What this asset does, how it solves the problem at a technical level.",
  "nonGoals": "What this asset explicitly does NOT do. Be specific — this builds buyer trust.",
  "keyMetrics": "Evidence of validation: users, deployments, revenue, demo, repo activity, etc. If none, say so.",
  "targetBuyer": "The ideal operator, licensee, or acquirer profile. Be specific about their context and needs."
}
`;

export const COMMERCIAL_NOTES_GENERATION_TEMPLATE = (p: Project, disposition: string): string => `
You are a Commercial Strategist drafting transfer terms for a software asset.
The asset has been evaluated and the recommended disposition is: ${disposition}.

Project Name: "${p.name}"
Type: ${p.type}
Revenue Potential: ${p.strategy?.revenuePotential ?? 'unknown'}/10
Market Validation: ${p.strategy?.marketValidation ?? 'unknown'}/10
Monetization Model: ${p.strategy?.model ?? 'not set'}
Strategy Notes: ${p.strategy?.notes || 'none'}
Handoff Readiness: ${p.systemCard?.handoffReadiness ?? 'unknown'}/10
Current State: ${p.systemCard?.currentState ?? 'unknown'}

Return ONLY a valid JSON object:
{
  "disposition": "${disposition}",
  "assetArchetype": "Non-Exclusive License",
  "askingPrice": "Optional free-text price range or 'Open to offers'",
  "revenueShareTerms": "e.g. 20% rev share for 24 months, or N/A",
  "exclusivityTerms": "e.g. Exclusive for 12 months then open, or N/A",
  "supportLevel": "Async Email",
  "targetBuyerProfiles": ["profile 1", "profile 2"],
  "licensingNotes": "2-3 sentences on licensing constraints, IP ownership, and transfer scope.",
  "valuationRationale": "Why this asset is priced/valued the way it is. Reference the score, market, and competition."
}

assetArchetype must be one of: Non-Exclusive License, Exclusive with Buyout, Outright Sale, Open Source, Not Decided
supportLevel must be one of: None, Async Email, Onboarding Call, Full Handoff Sprint
Be specific and professional. No marketing language.
`;

export const OUTREACH_TEMPLATES_GENERATION_TEMPLATE = (p: Project, commercialNotes: Partial<CommercialNotes>): string => `
You are generating three factual, professional outreach email templates for a software asset.
The templates must be operator-ready: no hype, no vision statements, just facts and structure.
Use the "Product Factory" framing — this asset was built systematically and is transfer-ready.

Asset: "${p.name}"
Type: ${p.type}
Description: "${p.description}"
Disposition: ${commercialNotes.disposition || 'License'}
Asset Archetype: ${commercialNotes.assetArchetype || 'Non-Exclusive License'}
Support Level: ${commercialNotes.supportLevel || 'Async Email'}
Stack: ${p.tags.join(', ')}
Target Buyers: ${(commercialNotes.targetBuyerProfiles || []).join(', ') || 'operators, agencies'}

Return ONLY a valid JSON object with three keys. Each value is a complete email as a string (use \\n for line breaks):
{
  "initialContact": "Subject: [Asset Name] — Operator-Ready [Type] Available\\n\\n[Body...]",
  "followUp": "Subject: Re: [Asset Name] — Technical Brief\\n\\n[Body...]",
  "dueDiligence": "Subject: Re: [Asset Name] — Handoff Bundle + Verification\\n\\n[Body...]"
}

Template A (initialContact): Cold outreach. State what the asset does in 1 sentence. Mention it was built in a product factory. State disposition and archetype. Invite response.
Template B (followUp): Technical brief delivery. Include stack, lifecycle stage, what works/what doesn't, and deal archetype. Reference the handoff bundle.
Template C (dueDiligence): Bundle delivery. Include verification statement (SHA-256 immutable bundle), support level, next steps, and how to proceed.
`;

// --- Expert Lab — Commercial Pipeline Experts ---

export const HANDOFF_EXPERT_ROLES = [
  {
    id: 'commercialization_architect' as const,
    name: 'Commercialization Architect',
    description: 'Enforces schema rigor, identifies information leaks (PII/secrets), and normalizes deal structures.',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    prompt: (p: Project) => `
You are the Commercialization Architect in a Product Factory pipeline.
Your role is to enforce schema discipline and commercial rigor on assets being prepared for transfer.
You are not a marketer. You are an operator-level quality gatekeeper.

Evaluate this asset:
${JSON.stringify({ name: p.name, type: p.type, description: p.description, strategy: p.strategy, systemCard: p.systemCard, externalizer: p.externalizer?.externalizationFile }, null, 2)}

Your analysis must cover:
1. **Schema Completeness**: What critical fields are missing or underspecified?
2. **Information Leaks**: Any PII, secrets, internal names, or internal URLs that must be scrubbed before handoff?
3. **Disposition Alignment**: Does the commercial framing match the actual asset maturity?
4. **Transfer Blockers**: List the top 3 things that would cause a deal to fail due diligence.
5. **Recommendation**: One concrete next action to improve transfer readiness.

Be direct and critical. This is a pre-sale QA review.`,
    suggestions: [
      'What fields are missing or underspecified?',
      'Are there any information leaks I should scrub?',
      'What are my top 3 transfer blockers?',
      'Is my commercial framing aligned with the asset maturity?',
    ],
  },
  {
    id: 'technical_auditor' as const,
    name: 'Technical Auditor',
    description: 'Analyzes transfer risk, critical dependencies, and handover requirements.',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    prompt: (p: Project) => `
You are a Technical Auditor conducting a pre-transfer review of a software asset.
Your job is to surface technical risks that would affect a buyer's ability to deploy, maintain, and extend this asset.

Asset:
${JSON.stringify({ name: p.name, type: p.type, description: p.description, tags: p.tags, repository: p.repository, liveUrl: p.liveUrl, docs: { technicalAudit: p.docs?.technicalAudit } }, null, 2)}

Your analysis must cover:
1. **Transfer Risk Score**: Rate the technical transfer risk 1-10 (10 = catastrophic, 1 = trivial).
2. **Critical Dependencies**: What third-party services, APIs, or keys does the buyer inherit? Any vendor lock-in?
3. **Setup Complexity**: How hard is it to spin this up in a new environment? What would break first?
4. **Security Surface**: Auth handling, secret exposure, data retention concerns.
5. **Maintenance Burden**: What ongoing technical work does the new operator inherit?
6. **Handover Requirements**: What must be provided at transfer (env vars, accounts, DNS, secrets)?

Be specific and engineering-level. No marketing.`,
    suggestions: [
      'What is the technical transfer risk score?',
      'What critical dependencies does the buyer inherit?',
      'What would break first when spinning up in a new environment?',
      'What must I provide at the point of handover?',
    ],
  },
  {
    id: 'commercial_strategist' as const,
    name: 'Commercial Strategist',
    description: 'Drafts licensing terms, valuation heuristics, and buyer positioning.',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    prompt: (p: Project) => `
You are a Commercial Strategist advising on the optimal transfer strategy for a software asset.
Focus on realistic valuation, buyer fit, and deal structure — not aspirational marketing.

Asset:
${JSON.stringify({ name: p.name, type: p.type, description: p.description, strategy: p.strategy, systemCard: { handoffReadiness: p.systemCard?.handoffReadiness, lookingFor: p.systemCard?.lookingFor, offer: p.systemCard?.offer, monetizationNotes: p.systemCard?.monetizationNotes } }, null, 2)}

Your analysis must cover:
1. **Valuation Range**: Provide a realistic price range with rationale (reference comparable SaaS multiples or tool sales if relevant).
2. **Optimal Deal Structure**: Which archetype fits best — Non-Exclusive License, Exclusive with Buyout, or Outright Sale? Why?
3. **Buyer Archetypes**: Describe 2-3 specific buyer types who would pay for this, what they want, and how to reach them.
4. **Revenue Model Alignment**: Is the current monetization model the best fit for the buyer's context?
5. **Negotiation Levers**: What aspects of the deal can be flexed to close faster?
6. **Red Flags for Buyers**: What would a sophisticated buyer push back on?

Be commercially precise. No hype.`,
    suggestions: [
      'What is a realistic valuation range?',
      'Which deal archetype fits best?',
      'What types of buyers should I target?',
      'What would a sophisticated buyer push back on?',
    ],
  },
  {
    id: 'lifecycle_advisor' as const,
    name: 'Lifecycle Advisor',
    description: 'Recommends next steps based on project maturity and market conditions.',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    prompt: (p: Project) => `
You are a Lifecycle Advisor who specializes in guiding software assets from creation through commercialization.
Assess where this asset currently sits in its lifecycle and prescribe the most efficient path forward.

Asset:
${JSON.stringify({ name: p.name, type: p.type, status: p.status, externalizer: { stage: p.externalizer?.stage, score: p.externalizer?.score }, systemCard: { currentState: p.systemCard?.currentState, handoffReadiness: p.systemCard?.handoffReadiness, missing: p.systemCard?.missing, nextSteps: p.systemCard?.nextSteps }, strategy: { score: p.strategy?.score, model: p.strategy?.model } }, null, 2)}

Your analysis must cover:
1. **Lifecycle Stage**: Where is this asset right now (0→1 Idea / Building / Validated / Transfer-Ready / Post-Transfer)?
2. **Blocking Issues**: What 2-3 things are preventing progression to the next stage?
3. **Fastest Path to Transfer-Ready**: If the goal is commercial transfer within 30 days, what specifically must happen?
4. **Alternative Routes**: If transfer isn't viable now, what alternative (open-source, build-to-sell, internal tool) makes sense?
5. **30/60/90 Day Roadmap**: Prescribe a concrete staged plan.

Be direct and time-aware. Assume the operator wants speed.`,
    suggestions: [
      'What lifecycle stage am I actually at?',
      'What is blocking my progression to the next stage?',
      'What is the fastest path to Transfer-Ready?',
      'Give me a 30/60/90 day roadmap.',
    ],
  },
] as const;

export type HandoffExpertId = typeof HANDOFF_EXPERT_ROLES[number]['id'];

// --- Pipeline Definition ---

export interface PipelineRequirement {
  docKey: string;
  label: string;
  description: string;
  check: (p: Project) => boolean; // returns true if satisfied
}

export const HANDOFF_PIPELINE_REQUIREMENTS: PipelineRequirement[] = [
  {
    docKey: 'strategy',
    label: 'Strategy Score',
    description: 'Revenue potential, market validation, and ease-of-build must be set.',
    check: (p) => !!(p.strategy?.revenuePotential && p.strategy?.marketValidation && p.strategy?.easeOfBuild),
  },
  {
    docKey: 'technicalAudit',
    label: 'Technical Audit',
    description: 'Stack mapping and debt registry must be completed.',
    check: (p) => !!(p.docs?.technicalAudit?.stack?.length),
  },
  {
    docKey: 'executiveBrief',
    label: 'Executive Brief',
    description: 'Problem, solution, and target buyer must be documented.',
    check: (p) => !!(p.docs?.executiveBrief?.problem),
  },
  {
    docKey: 'commercialNotes',
    label: 'Commercial Notes',
    description: 'Disposition and archetype must be defined.',
    check: (p) => !!(p.docs?.commercialNotes?.disposition),
  },
];

// --- Handoff Bundle Document Renderers ---

export const renderExecutiveBriefMd = (p: Project): string => {
  const eb = p.docs?.executiveBrief;
  const score = calculateStrategyScore(p.strategy);
  const disposition = getCommercialDisposition(score);
  return `# Executive Brief — ${p.name}

**Generated:** ${new Date().toLocaleString()}
**Disposition:** ${disposition}
**Asset Type:** ${p.type}
**Category:** ${p.category}

---

## Problem

${eb?.problem || p.systemCard?.problem || p.description}

## Solution

${eb?.solution || p.systemCard?.solution || '_Not specified_'}

## Non-Goals

${eb?.nonGoals || '_Not specified_'}

## Key Metrics & Validation

${eb?.keyMetrics || p.externalizer?.externalizationFile?.proof || '_Not specified_'}

## Target Buyer Profile

${eb?.targetBuyer || (p.systemCard?.lookingFor?.join(', ')) || '_Not specified_'}

---

*Tags: ${p.tags.join(', ')}*
`;
};

export const renderTechnicalOverviewMd = (p: Project): string => {
  const audit = p.docs?.technicalAudit;
  if (!audit) return `# Technical Overview — ${p.name}\n\n_Technical audit not yet completed._\n`;
  return `# Technical Overview — ${p.name}

**Audited:** ${audit.auditedAt ? new Date(audit.auditedAt).toLocaleString() : 'unknown'}
**Deployment:** ${audit.deploymentEnv}
**Asset Archetype:** ${audit.assetArchetype}

---

## Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
${audit.stack.map(s => `| ${s.layer} | ${s.tech} | ${s.version || '—'} | ${s.notes || '—'} |`).join('\n')}

---

## Code Health

| Metric | Score |
|--------|-------|
| Test Coverage | ${audit.testCoverage}% |
| Documentation | ${audit.documentationLevel}/10 |
| Maintainability | ${audit.maintainabilityScore}/10 |

---

## Technical Debt Registry

${audit.debt.length === 0
  ? '_No technical debt registered._'
  : audit.debt.map(d => `### ${d.title} — \`${d.severity}\`\n**Category:** ${d.category} · **Effort:** ~${d.effortDays}d\n\n${d.description}\n`).join('\n---\n\n')}

---

## Transfer Notes

${audit.notes || '_No additional notes._'}
`;
};

export const renderCommercialNotesMd = (p: Project): string => {
  const cn = p.docs?.commercialNotes;
  const score = calculateStrategyScore(p.strategy);
  if (!cn) return `# Commercial Notes — ${p.name}\n\n_Commercial notes not yet generated._\n`;
  return `# Commercial Notes — ${p.name}

**Strategy Score:** ${score}
**Disposition:** ${cn.disposition}
**Asset Archetype:** ${cn.assetArchetype}
**Support Level:** ${cn.supportLevel}

---

## Pricing

${cn.askingPrice ? `**Asking Price:** ${cn.askingPrice}` : '_Not specified_'}
${cn.revenueShareTerms ? `\n**Revenue Share:** ${cn.revenueShareTerms}` : ''}
${cn.exclusivityTerms ? `\n**Exclusivity:** ${cn.exclusivityTerms}` : ''}

## Target Buyer Profiles

${cn.targetBuyerProfiles.map(p => `- ${p}`).join('\n') || '_Not specified_'}

## Licensing Notes

${cn.licensingNotes}

## Valuation Rationale

${cn.valuationRationale}
`;
};

function calculateStrategyScore(strategy?: Partial<{ revenuePotential: number; marketValidation: number; easeOfBuild: number }>): number {
  if (!strategy) return 0;
  const { revenuePotential = 0, easeOfBuild = 0, marketValidation = 0 } = strategy;
  return Math.round(((revenuePotential * 1.5) + (marketValidation * 1.2)) * easeOfBuild);
}

// ─────────────────────────────────────────────────────────────────────────────
// TARGET PROFILE — HEURISTIC FINGERPRINT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infer a target profile from the project's tags, category, type, and description.
 * Used when no explicit targetProfile has been set.
 */
export function inferTargetProfile(project: Project): TargetProfile {
  const haystack = [
    ...(project.tags || []),
    project.category || '',
    project.description || '',
    project.type || '',
  ].join(' ').toLowerCase();

  // web_saas_mvp: Next.js, React, SaaS, auth, database, API
  if (/next\.?js|react|fastapi|express|postgres|supabase|firebase|auth|saas|web app|dashboard/i.test(haystack)) {
    return TargetProfile.WebSaasMvp;
  }
  // system_tool_cli: CLI, tool, script, automation, generator, utility
  if (/cli|command[\s-]?line|terminal|script|generator|utility|tool|meta[\s-]?tool|node\.?js tool/i.test(haystack)) {
    return TargetProfile.SystemToolCli;
  }
  // interactive_poc: game, canvas, three.js, phaser, demo, prototype, visual
  if (/game|canvas|three\.?js|phaser|gradio|demo|prototype|visual|sandbox|poc|experiment/i.test(haystack)) {
    return TargetProfile.InteractivePoc;
  }
  // automation_worker: cron, worker, daemon, webhook, pipeline, background
  if (/cron|worker|daemon|webhook|pipeline|background|scheduler|job|batch|automation/i.test(haystack)) {
    return TargetProfile.AutomationWorker;
  }

  return TargetProfile.Unknown;
}

// ─── Profile criteria maps ────────────────────────────────────────────────────

type ProfileCriteria = {
  critical: { label: string; check: (p: Project) => boolean }[];
  polish:   { label: string; check: (p: Project) => boolean }[];
};

const hasTag = (p: Project, ...terms: string[]) =>
  terms.some(t => (p.tags || []).some(tag => tag.toLowerCase().includes(t.toLowerCase())));

const hasDesc = (p: Project, ...terms: string[]) =>
  terms.some(t => (p.description || '').toLowerCase().includes(t.toLowerCase()));

export const PROFILE_CRITERIA: Record<TargetProfile, ProfileCriteria> = {
  [TargetProfile.WebSaasMvp]: {
    critical: [
      { label: 'Database connectivity', check: p => hasTag(p, 'database','postgres','mysql','mongo','supabase','firebase','prisma') || hasDesc(p, 'database','db','data store') },
      { label: 'User authentication', check: p => hasTag(p, 'auth','login','oauth','jwt') || hasDesc(p, 'authentication','login','sign in','user account') },
      { label: 'API / router layer', check: p => hasTag(p, 'api','rest','graphql','trpc','express','fastapi') || hasDesc(p, 'api','endpoint','route') },
      { label: 'Environment config (.env)', check: p => !!p.repository || hasDesc(p, '.env','environment variable','config') },
    ],
    polish: [
      { label: 'Production build script', check: p => hasTag(p, 'vite','webpack','next','build') || hasDesc(p, 'build','deploy','production') },
      { label: 'UI framework / CSS', check: p => hasTag(p, 'tailwind','css','ui','styled','material','chakra') || hasDesc(p, 'tailwind','css','ui kit','design') },
      { label: 'Error handling', check: p => hasDesc(p, 'error handling','error boundary','fallback','graceful') },
      { label: 'Live deployment', check: p => !!p.liveUrl },
    ],
  },
  [TargetProfile.SystemToolCli]: {
    critical: [
      { label: 'Input / argument parsing', check: p => hasTag(p, 'cli','commander','yargs','argparse','click') || hasDesc(p, 'command','argument','flag','parameter') },
      { label: 'Deterministic exit codes', check: p => hasDesc(p, 'exit code','error code','status code') || hasTag(p, 'cli','shell','bash') },
      { label: 'Error logging', check: p => hasDesc(p, 'log','error','verbose','debug') || hasTag(p, 'logging','winston','pino') },
      { label: 'Executable build command', check: p => !!p.repository || hasDesc(p, 'npm run','npx','python','install','build') },
    ],
    polish: [
      { label: 'Config file parser', check: p => hasTag(p, 'config','toml','yaml','json config') || hasDesc(p, 'config file','configuration') },
      { label: 'Usage documentation', check: p => !!p.aiGenerated?.readme || hasDesc(p, 'documentation','readme','usage','how to use') },
    ],
  },
  [TargetProfile.InteractivePoc]: {
    critical: [
      { label: 'Main render / game loop', check: p => hasTag(p, 'canvas','three.js','phaser','webgl','animation') || hasDesc(p, 'render','game loop','frame','animation loop') },
      { label: 'Input listener', check: p => hasDesc(p, 'keyboard','mouse','click','touch','input','event listener') || hasTag(p, 'input','controls','keyboard') },
      { label: 'Component / state management', check: p => hasTag(p, 'react','vue','svelte','state') || hasDesc(p, 'state','component','reactivity') },
    ],
    polish: [
      { label: 'Asset bundler / loader', check: p => hasTag(p, 'vite','webpack','parcel','assets') || hasDesc(p, 'asset','sprite','texture','bundle') },
      { label: 'Modular scene / view routing', check: p => hasDesc(p, 'scene','screen','view','route','level') || hasTag(p, 'routing','scene','level') },
    ],
  },
  [TargetProfile.AutomationWorker]: {
    critical: [
      { label: 'Process trigger (cron/webhook)', check: p => hasTag(p, 'cron','webhook','trigger','schedule') || hasDesc(p, 'cron','webhook','trigger','schedule','interval') },
      { label: 'Target API / SDK integration', check: p => !!p.repository || hasDesc(p, 'api','sdk','integration','http','fetch') },
      { label: 'Error catches / retry logic', check: p => hasDesc(p, 'error','retry','catch','fallback','resilient') || hasTag(p, 'resilience','retry') },
    ],
    polish: [
      { label: 'State / cursor persistence', check: p => hasDesc(p, 'state','cursor','persist','checkpoint','resume') || hasTag(p, 'persistence','state') },
      { label: 'Execution performance logs', check: p => hasDesc(p, 'log','metric','perf','performance','monitor') || hasTag(p, 'logging','monitoring') },
    ],
  },
  [TargetProfile.Unknown]: {
    critical: [
      { label: 'Has a description', check: p => (p.description || '').length > 20 },
      { label: 'Has category', check: p => (p.category || '').length > 0 },
      { label: 'Has tags', check: p => (p.tags || []).length > 0 },
    ],
    polish: [
      { label: 'Has repository URL', check: p => !!p.repository },
      { label: 'Has live URL', check: p => !!p.liveUrl },
    ],
  },
};

/** Run the completeness scoring engine for a project. */
export function computeCompleteness(project: Project): CompletenessReport {
  const profile = project.targetProfile || inferTargetProfile(project);
  const criteria = PROFILE_CRITERIA[profile];

  const criticalPts = 20;
  const polishPts = 10;
  const maxPossible = criteria.critical.length * criticalPts + criteria.polish.length * polishPts;

  let score = 0;
  const passedChecks: CompletenessCheck[] = [];
  const failedChecks: CompletenessCheck[] = [];

  for (const c of criteria.critical) {
    const passed = c.check(project);
    const entry: CompletenessCheck = { label: c.label, passed, weight: 'critical' };
    if (passed) { score += criticalPts; passedChecks.push(entry); }
    else failedChecks.push(entry);
  }
  for (const c of criteria.polish) {
    const passed = c.check(project);
    const entry: CompletenessCheck = { label: c.label, passed, weight: 'polish' };
    if (passed) { score += polishPts; passedChecks.push(entry); }
    else failedChecks.push(entry);
  }

  const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;

  return {
    targetProfile: profile,
    score: pct,
    maxPossible,
    passedChecks,
    failedChecks,
    scannedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS VALIDATOR AI PROMPT
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS_VALIDATION_PROMPT = (p: Project): string => `
You are performing a ruthlessly honest inventory review of a software project.
Your job is to assess whether its metadata is accurate AND assign the correct intent and stage.

Be conservative. Err on the side of lower stage. A project is NOT "shippable" unless
it could genuinely go live today with minimal effort. If there is no liveUrl and no
clear evidence of a working deployed system, it is at most "functional".
Do not be generous. The owner needs truth, not encouragement.

--- PROJECT DATA ---
Name: ${p.name}
Description: ${p.description || 'not set'}
Current Category: ${p.category || 'not set'}
Current Status: ${p.status}
Current Tags: ${(p.tags || []).join(', ') || 'none'}
Type: ${p.type}
Intent (existing): ${(p as any).intent || 'not set'}
Inventory Intent (existing): ${(p as any).inventoryIntent || 'not set'}
Inventory Stage (existing): ${(p as any).inventoryStage || 'not set'}
Repository: ${p.repository || 'none'}
Live URL: ${p.liveUrl || 'none — this is a strong signal the project is NOT shipped'}
Created: ${p.createdAt}
Has README: ${!!(p.aiGenerated?.readme || p.docs?.readme)}
Has Technical Audit: ${!!p.docs?.technicalAudit}
Has Executive Brief: ${!!p.docs?.executiveBrief}
--- END PROJECT DATA ---

INTENT OPTIONS (pick exactly one):
- "monetize"  → active revenue target: SaaS, license, or one-time sale
- "publish"   → public release: open source or portfolio display
- "research"  → exploration, PoC, or learning exercise
- "article"   → primary value is as written content: case study, tutorial, post
- "internal"  → personal workflow tool the owner uses themselves
- "archive"   → consciously shelved, done, reference only

STAGE OPTIONS (pick exactly one, BE CONSERVATIVE):
- "idea"       → concept only, no working code at all
- "scaffolded" → file structure exists but core loop is not functional
- "functional" → core loop works but has significant rough edges
- "shippable"  → could go live today with 1-2 days of work at most
- "shipped"    → deployed, accessible at a live URL, and stable
- "abandoned"  → started but will not be continued

STAGE RULES (apply strictly):
- No liveUrl = almost certainly NOT "shipped" unless description explicitly states it is deployed elsewhere
- No repository = harder to assess code state, be more conservative
- Short or vague description = "idea" or "scaffolded" until proven otherwise
- "Nearly There" or "Ongoing" legacy status does NOT mean "shippable" — assess independently

Respond ONLY with a valid JSON object, no markdown, no preamble:
{
  "isValid": boolean,
  "aiVerdict": "1-2 sentence plain English verdict on overall metadata accuracy",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedCategory": "string or null",
  "suggestedStatus": "Idea|Ongoing|Nearly There|Shipped|null",
  "suggestedIntent": "monetize|publish|research|article|internal|archive",
  "intentRationale": "1 sentence explaining why you chose this intent",
  "suggestedStage": "idea|scaffolded|functional|shippable|shipped|abandoned",
  "stageRationale": "1-2 sentences explaining WHY you chose this stage. Cite specific evidence from the project data, especially the absence of liveUrl if relevant."
}
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const EXPORT_FIELD_LABELS: Record<ExportField, string> = {
  core:         'Core info (name, desc, type, status, category)',
  tags:         'Tags',
  strategy:     'Monetization strategy & scores',
  aiGenerated:  'AI-generated content (readme, description, etc.)',
  openSpec:     'OpenSpec',
  externalizer: 'Externalizer OS',
  systemCard:   'System Card',
  docs:         'Handoff Documents (audit, brief, notes)',
  relvanta:     'Relvanta publish state',
  bundleHistory:'Bundle history',
  completeness: 'Completeness report',
};

export const ALL_EXPORT_FIELDS: ExportField[] = Object.keys(EXPORT_FIELD_LABELS) as ExportField[];

/** Strip a project down to the fields requested in the config. */
export function buildExportPayload(project: Project, fields: ExportField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (fields.includes('core')) {
    out.name = project.name;
    out.description = project.description;
    out.type = project.type;
    out.status = project.status;
    out.category = project.category;
    out.intent = project.intent;
    out.repository = project.repository;
    out.liveUrl = project.liveUrl;
    out.images = project.images;
    out.createdAt = project.createdAt;
    out.updatedAt = project.updatedAt;
  }
  if (fields.includes('tags'))         out.tags = project.tags;
  if (fields.includes('strategy'))     out.strategy = project.strategy;
  if (fields.includes('aiGenerated'))  out.aiGenerated = project.aiGenerated;
  if (fields.includes('openSpec'))     out.openSpec = project.openSpec;
  if (fields.includes('externalizer')) out.externalizer = project.externalizer;
  if (fields.includes('systemCard'))   out.systemCard = project.systemCard;
  if (fields.includes('docs'))         out.docs = project.docs;
  if (fields.includes('relvanta'))     out.relvanta = project.relvanta;
  if (fields.includes('bundleHistory'))out.bundleHistory = project.bundleHistory;
  if (fields.includes('completeness')) out.completeness = project.completeness;

  return out;
}

/** Build a minimal markdown summary (readme export mode). */
export function buildReadmeExport(project: Project): string {
  const lines: string[] = [];
  lines.push(`# ${project.name}`);
  lines.push('');
  lines.push(`**Status:** ${project.status} | **Type:** ${project.type} | **Category:** ${project.category}`);
  lines.push('');
  lines.push(project.description || '_No description._');
  lines.push('');
  if ((project.tags || []).length) lines.push(`**Tags:** ${project.tags.join(', ')}`);
  if (project.repository) lines.push(`**Repo:** ${project.repository}`);
  if (project.liveUrl)    lines.push(`**Live:** ${project.liveUrl}`);
  if (project.aiGenerated?.readme) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(project.aiGenerated.readme);
  }
  return lines.join('\n');
}

/** Build a simple CSV summary row. */
export function buildCsvRow(project: Project): string {
  const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
  return [
    esc(project.name),
    esc(project.status),
    esc(project.type),
    esc(project.category),
    esc((project.tags || []).join('; ')),
    esc(project.repository || ''),
    esc(project.liveUrl || ''),
    esc(project.description?.slice(0, 120) || ''),
  ].join(',');
}

export const CSV_HEADER = '"Name","Status","Type","Category","Tags","Repository","Live URL","Description"';
