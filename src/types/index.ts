
export type PromptType = 'SYSTEM_PROMPT' | 'APP_STARTER_PROMPT' | 'QUICK_ACTION';

export interface Prompt {
  id: string;
  type: PromptType;
  title: string;
  content: string;
  copyCount?: number;
  category?: string; // Added category field
  userId?: string; // Keep userId optional here for general type definition
}

export const PROMPT_TYPES: Record<string, PromptType> = {
  SYSTEM: 'SYSTEM_PROMPT',
  APP_STARTER: 'APP_STARTER_PROMPT',
  QUICK_ACTION: 'QUICK_ACTION'
};

export const PROMPT_TEMPLATES: Record<PromptType, string> = {
  SYSTEM_PROMPT: "{id: 'system_template_id_01', type: 'SYSTEM_PROMPT', title: '(New System Prompt Name)', category: '', content: '(Enter system prompt content here)'},",
  APP_STARTER_PROMPT: "{id: 'app_starter_template_id_01', type: 'APP_STARTER_PROMPT', title: 'Start: (New App Starter Prompt Name)', category: '', content: '(Enter app starter prompt content here)'},",
  QUICK_ACTION: "{id: 'quick_action_template_id_01', type: 'QUICK_ACTION', title: '(Button Text)', content: '(Text to copy)'},"
};

export const PROMPT_TYPE_NAMES: Record<PromptType, string> = {
  SYSTEM_PROMPT: 'System Prompts',
  APP_STARTER_PROMPT: 'App Starter Prompts',
  QUICK_ACTION: 'Quick Actions'
};
