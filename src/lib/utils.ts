
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Prompt, PromptType } from "@/types";
import type { ToastProps } from "@/components/ui/toast"; // Assuming this is for the web app's toast

// This function is for the main web application
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function is for the main web application
export function copyToClipboard(
  text: string,
  successMessage: string,
  errorMessage: string,
  toastFn: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
) {
  if (!navigator.clipboard) {
    toastFn({
      title: 'Clipboard Error',
      description: 'Clipboard API not available in this browser.',
      variant: 'destructive',
    });
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => {
      toastFn({
        title: 'Copied!',
        description: successMessage,
      });
    },
    (err) => {
      console.error('Failed to copy: ', err);
      toastFn({
        title: 'Copy Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  );
}


// Helper function for Tampermonkey script generation
function escapePromptContentForScript(str: string | undefined | null): string {
  if (str === undefined || str === null) {
    return '';
  }
  return String(str)
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/`/g, '\\`')   // Escape backticks
    .replace(/\$\{/g, '\\${'); // Escape ${ for template literals
}

// Helper function for Tampermonkey script generation
function objectToJsStringForScript(prompt: Prompt): string {
  const id = `    id:      '${escapePromptContentForScript(prompt.id)}'`;
  const type = `    type:    '${escapePromptContentForScript(prompt.type)}'`;
  const title = `    title:   '${escapePromptContentForScript(prompt.title)}'`;
  // Ensure category is always a string, even if empty, in the generated script object
  const category = `    category: '${escapePromptContentForScript(prompt.category || '')}'`;
  const content = `    content: \`${escapePromptContentForScript(prompt.content)}\``;
  return `{\n${id},\n${type},\n${title},\n${category},\n${content}\n}`;
}

const TAMPERMONKEY_EDIT_URL_FOR_SCRIPT = 'extension://iikmkjmpaadaobahmlepeloendndfphd/options.html#nav=0e53e7d4-cc80-45d0-83b4-8036d8f440a3+editor';

// This is the full function definition, not minified, as per user's script.
const escapeFunctionForEmbeddingInScript = function escapeForTemplateLiteral(str: string | undefined | null) {
    if (str === undefined || str === null) {
        return '';
    }
    return String(str).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
};


export function generateTampermonkeyScript(prompts: Prompt[]): string {
  const promptsArrayString = prompts.length > 0
    ? prompts.map(p => `        ${objectToJsStringForScript(p).replace(/\n/g, '\n        ')}`).join(',\n')
    : '        // No prompts defined. Add some in Prompt Amplifier or edit this script!';

  const scriptVersion = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const lastUpdated = new Date().toLocaleString();

  // User-provided header, maintained from previous interactions
  const userScriptHeader = `
// ==UserScript==
// @name         Prompt Amplifier Enhanced Prompts
// @namespace    http://tampermonkey.net/
// @version      ${scriptVersion}
// @description  Enhanced prompt helper with UI, managed by Prompt Amplifier. Last updated: ${lastUpdated}
// @author       Prompt Amplifier User
// @match        https://aistudio.google.com/*
// @match        https://*.gemini.google.com/app*
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @match        https://m365.cloud.microsoft/chat*
// @match        https://zebra-ai-web-prd.ait.microsoft.com/*
// @match        https://onesupport.crm.dynamics.com/*
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==
`;

  return `
${userScriptHeader.trim()}

(function() {
    'use strict';

    const PROMPT_TEMPLATES = {
        SYSTEM_PROMPT: \`{
    id:      'new_system_prompt_id',
    type:    'SYSTEM_PROMPT',
    title:   '⚙️ - (新しいシステムプロンプト名)',
    category: '',
    content: \\\`（ここにシステムプロンプトの内容を記述します）\\\`
},\`,
        APP_STARTER_PROMPT: \`{
    id:      'new_app_starter_id',
    type:    'APP_STARTER_PROMPT',
    title:   '(新しいアプリスターター名)',
    category: '',
    content: \\\`（ここにアプリスタータープロンプトの内容を記述します）\\\`
},\`
    };

    const PROMPT_AMPLIFIER_DATA = {
        initialPrompts: [
${promptsArrayString}
        ],

        getPrompts: function() {
            // Ensure category exists on prompts from GM_getValue
            const storedPrompts = GM_getValue('promptAmplifierEnhancedPrompts_v1', this.initialPrompts.map(p => ({...p, id: p.id || this.generateId(), category: p.category || ''})));
            return storedPrompts.map(p => ({...p, category: p.category || ''}));
        },

        savePrompts: function(currentPrompts) {
            // Ensure category exists when saving
            const promptsToSave = currentPrompts.map(p => ({...p, category: p.category || ''}));
            GM_setValue('promptAmplifierEnhancedPrompts_v1', promptsToSave);
            this.showNotification('[Prompt Amplifier] Prompts saved to local storage.', false);
        },

        resetPrompts: function() {
            const scriptInitialPrompts = this.initialPrompts.map(p => ({...p, id: p.id || this.generateId(), category: p.category || ''}));
            GM_setValue('promptAmplifierEnhancedPrompts_v1', scriptInitialPrompts);
            this.showNotification('[Prompt Amplifier] Prompts reset to initial values from script.', false, true);
            if (typeof unsafeWindow !== 'undefined' && unsafeWindow.location && typeof unsafeWindow.location.reload === 'function') {
                unsafeWindow.location.reload();
            } else if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
                window.location.reload();
            }
        },

        generateId: function() {
            return 'prompt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        },

        escapeForTemplateLiteral: ${escapeFunctionForEmbeddingInScript.toString()},

        copyToClipboard: function(text, rawTitle, fromModalId = 'prompt-list-modal', isTemplate = false) {
            const titleForNotification = this.escapeForTemplateLiteral(String(rawTitle || ''));
            navigator.clipboard.writeText(text).then(() => {
                let message = 'Copied \`' + titleForNotification + '\` to clipboard!';
                if (isTemplate) {
                    message = 'Template \`' + titleForNotification + '\` copied.\\nPaste into initialPrompts array and edit.';
                }
                this.showNotification(message, false, isTemplate);
                if (fromModalId.startsWith('prompt-preview-modal-') || fromModalId === 'prompt-list-modal') {
                    const mainListModal = document.getElementById('prompt-list-modal-overlay');
                    if (!isTemplate && mainListModal && mainListModal.style.display === 'flex') {
                        this.hideModal('prompt-list-modal');
                    }
                    if (fromModalId.startsWith('prompt-preview-modal-')) {
                        this.hideModal(fromModalId);
                    }
                }
            }).catch(err => { console.error('[Prompt Amplifier] Failed to copy to clipboard: ', err); this.showNotification('Copy failed.', true); });
        },

        notificationTimeout: null,
        showNotification: function(message, isError = false, isWarning = false) {
            if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
            let n = document.getElementById('prompt-helper-notification');
            if (!n) { n = document.createElement('div'); n.id = 'prompt-helper-notification'; document.body.appendChild(n); }
            n.textContent = message;
            let className = 'prompt-helper-toast';
            if (isError) {
                className += ' error';
            } else if (isWarning) {
                className += ' warning';
            } else {
                className += ' success';
            }
            n.className = className;
            n.style.display = 'block';
            this.notificationTimeout = setTimeout(() => { if(n) n.style.display = 'none'; }, 5500);
        },

        openModalsStack: [],
        currentOpenModal: null,
        createModal: function(modalId, title, contentHTML, footerButtons = [], options = {}) {
            let o = document.getElementById(modalId + '-overlay'); if (o) o.remove();
            o = document.createElement('div'); o.id = modalId + '-overlay'; o.className = 'prompt-helper-modal-overlay';
            const baseZ = parseInt(getComputedStyle(document.body).getPropertyValue('--ph-modal-z-index') || '10001', 10);
            o.style.zIndex = options.isSubModal ? (baseZ + this.openModalsStack.length + 1).toString() : (getComputedStyle(document.body).getPropertyValue('--ph-modal-z-index') || '10001');
            const d = document.createElement('div'); d.className = 'prompt-helper-modal-dialog'; if (options.customClass) d.classList.add(options.customClass);
            d.addEventListener('click', e => e.stopPropagation());
            const h = document.createElement('div'); h.className = 'prompt-helper-modal-header';
            const t = document.createElement('h3'); t.textContent = title;
            const cBtn = document.createElement('button'); cBtn.innerHTML = 'X'; cBtn.className = 'prompt-helper-modal-close';
            cBtn.onclick = () => this.hideModal(modalId);
            h.appendChild(t); h.appendChild(cBtn);
            const c = document.createElement('div'); c.className = 'prompt-helper-modal-content';
            if (typeof contentHTML === 'string') c.innerHTML = contentHTML; else c.appendChild(contentHTML);
            d.appendChild(h); d.appendChild(c);
            if (footerButtons.length > 0) {
                const f = document.createElement('div'); f.className = 'prompt-helper-modal-footer';
                footerButtons.forEach(bC => {
                    const b = document.createElement('button'); b.textContent = bC.text;
                    b.className = 'prompt-helper-button ' + (bC.className || '');
                    b.onclick = e => bC.handler(e); if(bC.innerHTML) b.innerHTML = bC.innerHTML;
                    f.appendChild(b);
                });
                d.appendChild(f);
            }
            o.appendChild(d); document.body.appendChild(o);
            if (!options.isSubModal) o.onclick = () => this.hideModal(modalId);
            return o;
        },

        showModal: function(modalId) {
            if (this.openModalsStack.length > 0 && !document.getElementById(modalId + '-overlay').style.zIndex.endsWith('2') && modalId !== this.openModalsStack[this.openModalsStack.length -1] && !document.getElementById(this.openModalsStack[this.openModalsStack.length -1] + '-overlay').style.zIndex.endsWith('2')) {
                const mTC = this.openModalsStack.find(id => !document.getElementById(id + '-overlay').style.zIndex.endsWith('2'));
                if(mTC && mTC !== modalId) this.hideModal(mTC);
            }
            const m = document.getElementById(modalId + '-overlay');
            if (m) {
                m.style.display = 'flex';
                if (!this.openModalsStack.includes(modalId)) this.openModalsStack.push(modalId);
                this.currentOpenModal = modalId;
                const fF = m.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (fF) fF.focus();
            }
        },
        hideModal: function(modalId) {
            const m = document.getElementById(modalId + '-overlay');
            if (m) {
                m.style.display = 'none';
                const i = this.openModalsStack.indexOf(modalId);
                if (i > -1) this.openModalsStack.splice(i, 1);
                this.currentOpenModal = this.openModalsStack.length > 0 ? this.openModalsStack[this.openModalsStack.length - 1] : null;
            }
        },

        createMainUI: function() {
            const mainButtonContainer = document.createElement('div'); mainButtonContainer.id = 'prompt-helper-button-container'; document.body.appendChild(mainButtonContainer);
            const createPromptButton = (id, text, title, promptType) => {
                const button = document.createElement('button'); button.id = id; button.textContent = text; button.title = title;
                button.dataset.promptType = promptType; button.dataset.modalTitlePrefix = text;
                mainButtonContainer.appendChild(button);
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const modalId = 'prompt-list-modal';
                    const mE = document.getElementById(modalId + '-overlay');
                    if (this.currentOpenModal === modalId && mE && mE.style.display === 'flex' && mE.dataset.activeType === promptType) {
                        this.hideModal(modalId);
                    } else {
                        if (this.currentOpenModal === modalId && mE && mE.style.display === 'flex' && mE.dataset.activeType !== promptType) {
                            this.hideModal(modalId);
                        }
                        this.renderPromptListModal(promptType, text);
                    }
                });
                return button;
            };
            createPromptButton('prompt-helper-system-button', 'S-Prompts', 'Open System Prompt List', 'SYSTEM_PROMPT');
            createPromptButton('prompt-helper-app-starter-button', 'A-Prompts', 'Open App Starter Prompt List', 'APP_STARTER_PROMPT');

            const scriptInstructionsButton = document.createElement('button');
            scriptInstructionsButton.id = 'prompt-helper-edit-script-button';
            scriptInstructionsButton.innerHTML = 'E<span class="ph-btn-text"> Edit URL</span>';
            scriptInstructionsButton.title = 'Copy Tampermonkey script edit URL';
            mainButtonContainer.appendChild(scriptInstructionsButton);
            scriptInstructionsButton.addEventListener('click', () => {
                const fixedUrlToCopy = '${TAMPERMONKEY_EDIT_URL_FOR_SCRIPT}';
                navigator.clipboard.writeText(fixedUrlToCopy).then(() => {
                    this.showNotification('Tampermonkey script edit URL copied!', false, false);
                }).catch(err => { this.showNotification('Failed to copy Edit URL.', true); });
            });

            const copyPageUrlButton = document.createElement('button');
            copyPageUrlButton.id = 'prompt-helper-copy-page-url-button';
            copyPageUrlButton.innerHTML = 'P<span class="ph-btn-text"> Copy URL</span>';
            copyPageUrlButton.title = 'Copy current page URL to clipboard';
            mainButtonContainer.appendChild(copyPageUrlButton);
            copyPageUrlButton.addEventListener('click', () => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl).then(() => {
                    this.showNotification('Current page URL copied!', false);
                }).catch(err => { this.showNotification('Failed to copy page URL.', true); });
            });
        },

        renderPromptListModal: function(promptType, modalTitlePrefix) {
            const fP = this.getPrompts().filter(p => p.type === promptType);
            const cD = document.createElement('div');
            cD.className = 'prompt-list-items-container';
            if (fP.length === 0) {
                const nPM = document.createElement('p'); nPM.textContent = 'No prompts available. Please edit script or use Prompt Amplifier app to add prompts.';
                nPM.className = 'prompt-helper-empty-message'; cD.appendChild(nPM);
            } else {
                fP.forEach(p => {
                    const lIW = document.createElement('div'); lIW.className = 'prompt-helper-modal-list-item-wrapper';
                    const lI = document.createElement('div'); lI.className = 'prompt-helper-modal-list-item';

                    let displayHTML = this.escapeForTemplateLiteral(p.title);
                    if (p.category && p.category !== '') { // Check if category is not empty
                        displayHTML += \` <span class="prompt-category-badge">\${this.escapeForTemplateLiteral(p.category)}</span>\`;
                    }
                    lI.innerHTML = displayHTML;

                    const titleAttrContent = String(p.content || '').replace(/'/g, "\\\\'").substring(0, 100) + (String(p.content || '').length > 100 ? '...' : '');
                    lI.title = 'Click to copy: ' + titleAttrContent;
                    const pB = document.createElement('button'); pB.className = 'prompt-helper-preview-button';
                    pB.innerHTML = 'PV'; pB.title = 'Preview content';
                    lIW.appendChild(lI); lIW.appendChild(pB); cD.appendChild(lIW);
                    pB.addEventListener('click', e => { e.stopPropagation(); this.showPromptPreviewModal(p); });
                    lIW.addEventListener('click', (e) => {
                        if (e.target !== pB && !pB.contains(e.target)) {
                           this.copyToClipboard(p.content, p.title, 'prompt-list-modal');
                        }
                    });
                });
            }
            const mId = 'prompt-list-modal';
            const footerButtons = [];
            const templateKey = promptType === 'SYSTEM_PROMPT' ? 'SYSTEM_PROMPT' : 'APP_STARTER_PROMPT';
            const templateString = PROMPT_TEMPLATES[templateKey];
            const templateTitle = promptType === 'SYSTEM_PROMPT' ? 'System Prompt Template' : 'App Starter Prompt Template';

            footerButtons.push({ text: 'Copy Template', innerHTML: 'T<span class="ph-btn-text"> Copy Template</span>', className: 'prompt-helper-preset-button', handler: () => { this.copyToClipboard(templateString, templateTitle, mId, true); } });
            footerButtons.push({ text: 'Close', className: 'secondary', handler: () => this.hideModal(mId) });
            const m = this.createModal(mId, modalTitlePrefix + ' List', cD, footerButtons);
            m.dataset.activeType = promptType;
            const mBC = document.getElementById('prompt-helper-button-container');
            const mD = m.querySelector('.prompt-helper-modal-dialog');
            if (mBC && mD) {
                const cR = mBC.getBoundingClientRect();
                mD.style.position = 'fixed'; mD.style.top = (cR.bottom + 10) + 'px';
                mD.style.left = '50%'; mD.style.transform = 'translateX(-50%)';
                mD.style.right = 'auto'; mD.style.bottom = 'auto'; mD.style.margin = '0';
            }
            this.showModal(mId);
        },

        showPromptPreviewModal: function(prompt) {
            const pCD = document.createElement('div'); pCD.className = 'prompt-preview-content';
            const cP = document.createElement('pre'); cP.textContent = prompt.content; pCD.appendChild(cP);
            const mId = 'prompt-preview-modal-' + String(prompt.id || '').replace(/[^a-zA-Z0-9-_]/g, '');
            const previewTitle = 'Preview: ' + String(prompt.title || '');
            this.createModal(mId, previewTitle, pCD,
                [{ text: 'Copy', className: 'primary', handler: () => this.copyToClipboard(prompt.content, prompt.title, mId) },
                 { text: 'Close', className: 'secondary', handler: () => this.hideModal(mId) }],
                { isSubModal: true, customClass: 'prompt-helper-preview-dialog' }
            );
            const pMD = document.getElementById(mId + '-overlay').querySelector('.prompt-helper-modal-dialog');
            if (pMD) {
                pMD.style.position = 'fixed'; pMD.style.top = '50%'; pMD.style.left = '50%';
                pMD.style.transform = 'translate(-50%, -50%)';
            }
            this.showModal(mId);
        },

        init: function() {
            GM_addStyle(\`
                :root {
                    --ph-modal-z-index: 10001;
                    --ph-button-bg-color: #4682B4; /* Moderate Blue - S-Prompts */
                    --ph-button-hover-bg-color: #3b6b92; /* Darker Moderate Blue */
                    --ph-app-starter-bg-color: #9C27B0; /* Vibrant Purple - A-Prompts */
                    --ph-app-starter-hover-bg-color: #7B1FA2; /* Darker Vibrant Purple */
                    --ph-edit-button-bg-color: #A9A9A9; /* Dark Gray - E Edit URL */
                    --ph-edit-button-hover-bg-color: #8c8c8c; /* Darker Gray */
                    --ph-copy-url-button-bg-color: #4CAF50; /* Green - P Copy URL */
                    --ph-copy-url-button-hover-bg-color: #45a049; /* Darker Green */
                    --ph-toast-warning-bg-color: #ffeb3b; /* Yellow */
                    --ph-toast-warning-text-color: #202124;
                    --ph-preset-button-bg-color: #F0F8FF; /* Alice Blue */
                    --ph-preset-button-text-color: var(--ph-button-bg-color);
                    --ph-preset-button-border-color: #d1e0ec; /* Lighter Moderate Blue */
                    --ph-preset-button-hover-bg-color: #d1e0ec;
                }
                #prompt-helper-button-container {
                    position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
                    z-index: 9999; display: flex; gap: 10px; margin-left: 30px;
                }
                #prompt-helper-button-container button {
                    color: white; border: none; border-radius: 6px; padding: 9px 14px;
                    font-size: 13.5px; font-weight: 500; cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.18);
                    transition: all 0.2s ease-in-out; display: flex; align-items: center;
                    justify-content: center; line-height: 1.2;
                }
                #prompt-helper-button-container button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.15), 0 2px 5px rgba(0,0,0,0.22);
                }
                #prompt-helper-button-container button .ph-btn-text { margin-left: 6px; }
                #prompt-helper-system-button { background-color: var(--ph-button-bg-color); }
                #prompt-helper-system-button:hover { background-color: var(--ph-button-hover-bg-color); }
                #prompt-helper-app-starter-button { background-color: var(--ph-app-starter-bg-color); color: white; }
                #prompt-helper-app-starter-button:hover { background-color: var(--ph-app-starter-hover-bg-color); }
                #prompt-helper-edit-script-button { background-color: var(--ph-edit-button-bg-color); }
                #prompt-helper-edit-script-button:hover { background-color: var(--ph-edit-button-hover-bg-color); }
                #prompt-helper-copy-page-url-button { background-color: var(--ph-copy-url-button-bg-color); }
                #prompt-helper-copy-page-url-button:hover { background-color: var(--ph-copy-url-button-hover-bg-color); }

                .prompt-helper-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 12px 22px; color: white; border-radius: 6px; z-index: calc(var(--ph-modal-z-index) + 100); box-shadow: 0 3px 8px rgba(0,0,0,0.25); font-size: 14.5px; display: none; white-space: pre-wrap; text-align: center; max-width: 85%;}
                .prompt-helper-toast.success { background-color: #4CAF50; }
                .prompt-helper-toast.error { background-color: #f44336; }
                .prompt-helper-toast.warning { background-color: var(--ph-toast-warning-bg-color); color: var(--ph-toast-warning-text-color); }

                .prompt-helper-modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.4); align-items: flex-start; justify-content: center; }
                .prompt-helper-modal-dialog { background-color: #F0F8FF; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); width: 450px; max-height: calc(85vh - 60px); display: flex; flex-direction: column; color: #000; }
                .prompt-helper-preview-dialog { width: 90% !important; max-width: 700px !important; max-height: 80vh !important; }
                .prompt-helper-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #d1e0ec; }
                .prompt-helper-modal-header h3 { margin: 0; font-size: 17px; color: var(--ph-button-bg-color); font-weight: 600; }
                .prompt-helper-modal-close { background: none; border: none; font-size: 24px; font-weight: normal; color: #555; cursor: pointer; padding: 0 5px; line-height: 1; }
                .prompt-helper-modal-close:hover { color: #000; }
                .prompt-helper-modal-content { padding: 20px; overflow-y: auto; flex-grow: 1; }
                .prompt-helper-modal-footer { padding: 14px 20px; border-top: 1px solid #d1e0ec; text-align: right; background-color: #e6f2ff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; display: flex; justify-content: flex-end; gap: 8px; }
                .prompt-helper-button { padding: 8px 16px; border: 1px solid #b8d2e6; border-radius: 5px; cursor: pointer; font-size: 13.5px; font-weight: 500; display: flex; align-items: center; }

                .prompt-helper-button.primary { background-color: var(--ph-button-bg-color); color: white; border-color: var(--ph-button-bg-color); }
                .prompt-helper-button.primary:hover { background-color: var(--ph-button-hover-bg-color); border-color: var(--ph-button-hover-bg-color); }
                .prompt-helper-button.secondary { background-color: #fff; color: var(--ph-button-bg-color); border-color: #b8d2e6; }
                .prompt-helper-button.secondary:hover { background-color: #e6f2ff; border-color: var(--ph-button-hover-bg-color); }

                .prompt-helper-preset-button {
                    background-color: var(--ph-preset-button-bg-color); color: var(--ph-preset-button-text-color);
                    border: 1px solid var(--ph-preset-button-border-color);
                }
                .prompt-helper-preset-button:hover {
                    background-color: var(--ph-preset-button-hover-bg-color); border-color: var(--ph-preset-button-text-color);
                }

                .prompt-list-items-container { max-height: 320px; }
                .prompt-helper-modal-list-item-wrapper { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #d1e0ec; transition: background-color 0.15s; cursor: pointer; }
                .prompt-helper-modal-list-item-wrapper:last-child { border-bottom: none; }
                .prompt-helper-modal-list-item-wrapper:hover { background-color: #e6f2ff; }
                .prompt-helper-modal-list-item { flex-grow: 1; padding: 13px 12px; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .prompt-category-badge { /* Style for the category badge in Tampermonkey */
                    font-size: 0.8em;
                    padding: 2px 5px;
                    background-color: #e0e0e0; /* Default badge color */
                    color: #333;
                    border-radius: 4px;
                    margin-left: 8px;
                    font-weight: normal;
                    vertical-align: middle;
                }

                .prompt-helper-preview-button { background: none; border: none; color: #555; cursor: pointer; padding: 8px 12px; font-size: 18px; border-radius: 4px; transition: background-color 0.2s, color 0.2s; }
                .prompt-helper-preview-button:hover { color: var(--ph-button-bg-color); background-color: #d1e0ec; }
                .prompt-helper-empty-message { color: #555; text-align: center; padding: 25px 0; font-style: italic;}
                .prompt-preview-content { background-color: #e6f2ff; padding: 20px; border: 1px solid #b8d2e6; border-radius: 6px; max-height: calc(80vh - 160px); overflow-y: auto; }
                .prompt-preview-content pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: 'Source Code Pro', Consolas, "Courier New", monospace, "Noto Sans JP", sans-serif; font-size: 13.5px; line-height: 1.65; color: #111; }
            \`);
            GM_registerMenuCommand("Reset Prompts (Prompt Amplifier)", this.resetPrompts.bind(this));
            console.log('[Prompt Amplifier] Enhanced script initialized. Access prompts via PROMPT_AMPLIFIER_DATA.getPrompts()');

            // Ensure initialPrompts have IDs and category
            this.initialPrompts = this.initialPrompts.map(p => ({...p, id: p.id || this.generateId(), category: p.category || ''}));
            // Always overwrite storage with script's initialPrompts on init
            GM_setValue('promptAmplifierEnhancedPrompts_v1', this.initialPrompts);

            setTimeout(() => this.createMainUI(), 800);
        }
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => PROMPT_AMPLIFIER_DATA.init());
    } else {
        PROMPT_AMPLIFIER_DATA.init();
    }

})();
```