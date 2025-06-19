export type PromptType = 'SYSTEM_PROMPT' | 'APP_STARTER_PROMPT';

export interface Prompt {
  id: string;
  type: PromptType;
  title: string;
  content: string;
}

export const PROMPT_TYPES: Record<string, PromptType> = {
  SYSTEM: 'SYSTEM_PROMPT',
  APP_STARTER: 'APP_STARTER_PROMPT'
};

export const PROMPT_TEMPLATES: Record<PromptType, string> = {
  SYSTEM_PROMPT: "{id: 'system_template_id_01', type: 'SYSTEM_PROMPT', title: '(New System Prompt Name)' , content: '(Enter system prompt content here)'},",
  APP_STARTER_PROMPT: "{id: 'app_starter_template_id_01', type: 'APP_STARTER_PROMPT', title: 'Start: (New App Starter Prompt Name)' , content: '(Enter app starter prompt content here)'},"
};

export const PROMPT_TYPE_NAMES: Record<PromptType, string> = {
  SYSTEM_PROMPT: 'System Prompt',
  APP_STARTER_PROMPT: 'App Starter Prompt',
};
