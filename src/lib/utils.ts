import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Prompt } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function escapeJsString(str: string | undefined | null): string {
  if (str === undefined || str === null) {
    return '';
  }
  return String(str)
    .replace(/\\/g, '\\\\') // Must be first
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f');
}

function objectToJsString(prompt: Prompt): string {
  // Ensure consistent key order if necessary, though not strictly required for JS objects
  const id = `id:      '${escapeJsString(prompt.id)}'`;
  const type = `type:    '${escapeJsString(prompt.type)}'`;
  const title = `title:   '${escapeJsString(prompt.title)}'`;
  const content = `content: \`${escapeJsString(prompt.content).replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\``; // Use backticks for content for multiline

  return `{
    ${id},
    ${type},
    ${title},
    ${content}
}`;
}


export function promptsToScriptArrayString(prompts: Prompt[]): string {
  if (!prompts || prompts.length === 0) {
    return `const initialPrompts = [];`;
  }
  const promptsString = prompts.map(p => `        ${objectToJsString(p).replace(/\n/g, '\n        ')}`).join(',\n');
  return `const initialPrompts = [\n${promptsString}\n    ];`;
}

export function copyToClipboard(text: string, successMessage: string, failureMessage: string, toastFn: (options: any) => void) {
  navigator.clipboard.writeText(text).then(() => {
    toastFn({
      title: "Copied!",
      description: successMessage,
      duration: 3000,
    });
  }).catch(err => {
    console.error(failureMessage, err);
    toastFn({
      title: "Error",
      description: failureMessage,
      variant: "destructive",
      duration: 3000,
    });
  });
}
