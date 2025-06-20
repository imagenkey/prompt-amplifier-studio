
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Prompt, PromptType } from "@/types";
import type { ToastProps } from "@/components/ui/toast"; // For toast function type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to be used by the Next.js app (e.g., AppHeader)
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


function escapePromptContentForScript(str: string | undefined | null): string {
  if (str === undefined || str === null) {
    return '';
  }
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function objectToJsString(prompt: Prompt): string {
  const id = `    id:      '${escapePromptContentForScript(prompt.id)}'`;
  const type = `    type:    '${escapePromptContentForScript(prompt.type)}'`;
  const title = `    title:   '${escapePromptContentForScript(prompt.title)}'`;
  const content = `    content: \`${escapePromptContentForScript(prompt.content)}\``;
  return `{\n${id},\n${type},\n${title},\n${content}\n}`;
}

// This is the Tampermonkey edit URL used INSIDE the generated script
const TAMPERMONKEY_EDIT_URL_FOR_SCRIPT = 'extension://iikmkjmpaadaobahmlepeloendndfphd/options.html#nav=0e53e7d4-cc80-45d0-83b4-8036d8f440a3+editor';

// This is the helper function stringified and embedded in the Tampermonkey script
const escapeFunctionForEmbeddingInScript = function escapeForTemplateLiteral(str: string | undefined | null) {
    if (str === undefined || str === null) {
        return '';
    }
    return String(str).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
};


export function generateTampermonkeyScript(prompts: Prompt[]): string {
  const promptsArrayString = prompts.length > 0
    ? prompts.map(p => `        ${objectToJsString(p).replace(/\n/g, '\n        ')}`).join(',\n')
    : '        // No prompts defined. Add some in Prompt Amplifier or edit this script!';

  const scriptVersion = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const lastUpdated = new Date().toLocaleString();

  // Use the user-provided header, but keep version and lastUpdated dynamic
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
    content: \\\`（ここにシステムプロンプトの内容を記述します）\\\`
},\`,
        APP_STARTER_PROMPT: \`{
    id:      'new_app_starter_id',
    type:    'APP_STARTER_PROMPT',
    title:   '(新しいアプリスターター名)',
    content: \\\`（ここにアプリスタータープロンプトの内容を記述します）\\\`
},\`
    };

    const PROMPT_AMPLIFIER_DATA = {
        initialPrompts: [
${promptsArrayString}
        ],

        getPrompts: function() {
            return GM_getValue('promptAmplifierEnhancedPrompts_v1', this.initialPrompts.map(p => ({...p, id: p.id || this.generateId()})));
        },

        savePrompts: function(currentPrompts) {
            GM_setValue('promptAmplifierEnhancedPrompts_v1', currentPrompts);
            this.showNotification('[Prompt Amplifier] Prompts saved to local storage.', false);
        },

        resetPrompts: function() {
            // Always use the initialPrompts from *this script execution* for reset
            const scriptInitialPrompts = this.initialPrompts.map(p => ({...p, id: p.id || this.generateId()}));
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
                // Attempt to close the main modal if a non-template prompt is copied from it or its sub-preview
                if (fromModalId.startsWith('prompt-preview-modal-') || fromModalId === 'prompt-list-modal') {
                    const mainListModal = document.getElementById('prompt-list-modal-overlay');
                    if (!isTemplate && mainListModal && mainListModal.style.display === 'flex') {
                        this.hideModal('prompt-list-modal');
                    }
                    // Always close preview modal if copy happens from there
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
            this.notificationTimeout = setTimeout(() => { if(n) n.style.display = 'none'; }, 5500); // Increased duration slightly
        },

        openModalsStack: [],
        currentOpenModal: null, // Track the ID of the currently open main modal
        createModal: function(modalId, title, contentHTML, footerButtons = [], options = {}) {
            // options: { isSubModal: boolean, customClass: string }
            let overlay = document.getElementById(modalId + '-overlay');
            if (overlay) overlay.remove(); // Remove if exists to ensure fresh modal

            overlay = document.createElement('div');
            overlay.id = modalId + '-overlay';
            overlay.className = 'prompt-helper-modal-overlay';

            // Z-index management
            const baseZIndex = parseInt(getComputedStyle(document.body).getPropertyValue('--ph-modal-z-index') || '10001', 10);
            overlay.style.zIndex = options.isSubModal ? (baseZIndex + this.openModalsStack.length + 1).toString() : (getComputedStyle(document.body).getPropertyValue('--ph-modal-z-index') || '10001');


            const dialog = document.createElement('div');
            dialog.className = 'prompt-helper-modal-dialog';
            if (options.customClass) dialog.classList.add(options.customClass);
            dialog.addEventListener('click', e => e.stopPropagation()); // Prevent overlay click through

            const header = document.createElement('div');
            header.className = 'prompt-helper-modal-header';
            const titleElem = document.createElement('h3');
            titleElem.textContent = title;
            const closeButton = document.createElement('button');
            closeButton.innerHTML = 'X'; // Or use an SVG icon
            closeButton.className = 'prompt-helper-modal-close';
            closeButton.onclick = () => this.hideModal(modalId);
            header.appendChild(titleElem);
            header.appendChild(closeButton);

            const content = document.createElement('div');
            content.className = 'prompt-helper-modal-content';
            if (typeof contentHTML === 'string') {
                content.innerHTML = contentHTML;
            } else {
                content.appendChild(contentHTML);
            }

            dialog.appendChild(header);
            dialog.appendChild(content);

            if (footerButtons.length > 0) {
                const footer = document.createElement('div');
                footer.className = 'prompt-helper-modal-footer';
                footerButtons.forEach(btnConfig => {
                    const button = document.createElement('button');
                    button.textContent = btnConfig.text;
                    button.className = 'prompt-helper-button ' + (btnConfig.className || '');
                    button.onclick = (e) => btnConfig.handler(e); // Pass event object
                    if(btnConfig.innerHTML) button.innerHTML = btnConfig.innerHTML;
                    footer.appendChild(button);
                });
                dialog.appendChild(footer);
            }

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Click on overlay to close, only for main modals (not sub-modals)
            if (!options.isSubModal) {
                overlay.onclick = () => this.hideModal(modalId);
            }
            return overlay;
        },

        showModal: function(modalId) {
            // If a main modal is already open and we are trying to open another main modal, close the current one first.
            // This prevents multiple main modals from stacking awkwardly. Sub-modals (like preview) are exceptions.
            if (this.openModalsStack.length > 0 &&
                !document.getElementById(modalId + '-overlay').style.zIndex.endsWith('2') && // Target is a main modal
                modalId !== this.openModalsStack[this.openModalsStack.length -1] && // Target is not the current top modal
                !document.getElementById(this.openModalsStack[this.openModalsStack.length -1] + '-overlay').style.zIndex.endsWith('2') // Current top is a main modal
            ) {
                const modalToClose = this.openModalsStack.find(id => !document.getElementById(id + '-overlay').style.zIndex.endsWith('2'));
                if(modalToClose && modalToClose !== modalId) this.hideModal(modalToClose);
            }

            const modal = document.getElementById(modalId + '-overlay');
            if (modal) {
                modal.style.display = 'flex';
                if (!this.openModalsStack.includes(modalId)) {
                    this.openModalsStack.push(modalId);
                }
                this.currentOpenModal = modalId; // Update current open modal ID
                // Focus first focusable element
                const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) firstFocusable.focus();
            }
        },
        hideModal: function(modalId) {
            const modal = document.getElementById(modalId + '-overlay');
            if (modal) {
                modal.style.display = 'none';
                const index = this.openModalsStack.indexOf(modalId);
                if (index > -1) {
                    this.openModalsStack.splice(index, 1);
                }
                // Update currentOpenModal to the new top of the stack, or null if empty
                this.currentOpenModal = this.openModalsStack.length > 0 ? this.openModalsStack[this.openModalsStack.length - 1] : null;
            }
        },

        createMainUI: function() {
            const mainButtonContainer = document.createElement('div');
            mainButtonContainer.id = 'prompt-helper-button-container';
            document.body.appendChild(mainButtonContainer);

            const createPromptButton = (id, text, title, promptType) => {
                const button = document.createElement('button');
                button.id = id;
                button.textContent = text;
                button.title = title;
                button.dataset.promptType = promptType; // Store prompt type
                button.dataset.modalTitlePrefix = text; // Store prefix for modal title
                mainButtonContainer.appendChild(button);
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const modalId = 'prompt-list-modal';
                    const modalElement = document.getElementById(modalId + '-overlay');

                    // If the modal is already open and for the same type, close it (toggle behavior)
                    if (this.currentOpenModal === modalId && modalElement && modalElement.style.display === 'flex' && modalElement.dataset.activeType === promptType) {
                        this.hideModal(modalId);
                    } else {
                        // If a different main modal is open, or the same modal for a different type, hide it first
                        if (this.currentOpenModal === modalId && modalElement && modalElement.style.display === 'flex' && modalElement.dataset.activeType !== promptType) {
                           this.hideModal(modalId);
                        }
                        this.renderPromptListModal(promptType, text); // Pass text for modal title prefix
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
                // The URL is now a constant defined at the top of generateTampermonkeyScript
                const fixedUrlToCopy = '${TAMPERMONKEY_EDIT_URL_FOR_SCRIPT}';
                navigator.clipboard.writeText(fixedUrlToCopy).then(() => {
                    this.showNotification('Tampermonkey script edit URL copied!', false, false);
                }).catch(err => { this.showNotification('Failed to copy Edit URL.', true); });
            });

            const copyPageUrlButton = document.createElement('button'); // This is the button you wanted back
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
            const filteredPrompts = this.getPrompts().filter(p => p.type === promptType);
            const contentDiv = document.createElement('div');
            contentDiv.className = 'prompt-list-items-container';

            if (filteredPrompts.length === 0) {
                const noPromptsMessage = document.createElement('p');
                noPromptsMessage.textContent = 'No prompts available. Please edit script or use Prompt Amplifier app to add prompts.';
                noPromptsMessage.className = 'prompt-helper-empty-message';
                contentDiv.appendChild(noPromptsMessage);
            } else {
                filteredPrompts.forEach(prompt => {
                    const listItemWrapper = document.createElement('div');
                    listItemWrapper.className = 'prompt-helper-modal-list-item-wrapper';

                    const listItem = document.createElement('div');
                    listItem.className = 'prompt-helper-modal-list-item';
                    listItem.textContent = prompt.title;
                    // Tooltip for content preview on hover
                    const titleAttrContent = String(prompt.content || '').replace(/'/g, "\\\\'").substring(0, 100) + (String(prompt.content || '').length > 100 ? '...' : '');
                    listItem.title = 'Click to copy: ' + titleAttrContent;

                    const previewButton = document.createElement('button');
                    previewButton.className = 'prompt-helper-preview-button';
                    previewButton.innerHTML = 'PV'; // Preview icon or text
                    previewButton.title = 'Preview content';

                    listItemWrapper.appendChild(listItem);
                    listItemWrapper.appendChild(previewButton);
                    contentDiv.appendChild(listItemWrapper);

                    previewButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the wrapper's click event
                        this.showPromptPreviewModal(prompt);
                    });
                    // Copy content when the item (excluding preview button) is clicked
                    listItemWrapper.addEventListener('click', (e) => {
                        // Ensure the click is not on the preview button itself
                        if (e.target !== previewButton && !previewButton.contains(e.target)) {
                           this.copyToClipboard(prompt.content, prompt.title, 'prompt-list-modal');
                        }
                    });
                });
            }

            const modalId = 'prompt-list-modal';
            const footerButtons = [];

            // Use the globally defined PROMPT_TEMPLATES
            const templateKey = promptType === 'SYSTEM_PROMPT' ? 'SYSTEM_PROMPT' : 'APP_STARTER_PROMPT';
            const templateString = PROMPT_TEMPLATES[templateKey];
            const templateTitle = promptType === 'SYSTEM_PROMPT' ? 'System Prompt Template' : 'App Starter Prompt Template';

            footerButtons.push({
                text: 'Copy Template',
                innerHTML: 'T<span class="ph-btn-text"> Copy Template</span>',
                className: 'prompt-helper-preset-button',
                handler: () => { this.copyToClipboard(templateString, templateTitle, modalId, true); }
            });
            footerButtons.push({
                text: 'Close',
                className: 'secondary',
                handler: () => this.hideModal(modalId)
            });

            const modal = this.createModal(modalId, modalTitlePrefix + ' List', contentDiv, footerButtons);
            modal.dataset.activeType = promptType; // Store the active type for toggle logic

            // Position modal below the main button container
            const mainButtonContainer = document.getElementById('prompt-helper-button-container');
            const modalDialog = modal.querySelector('.prompt-helper-modal-dialog');
            if (mainButtonContainer && modalDialog) {
                const containerRect = mainButtonContainer.getBoundingClientRect();
                modalDialog.style.position = 'fixed'; // Use fixed for consistent positioning
                modalDialog.style.top = (containerRect.bottom + 10) + 'px'; // 10px below the buttons
                modalDialog.style.left = '50%';
                modalDialog.style.transform = 'translateX(-50%)';
                modalDialog.style.right = 'auto'; // Override any conflicting styles
                modalDialog.style.bottom = 'auto'; // Override any conflicting styles
                modalDialog.style.margin = '0'; // Reset margin
            }
            this.showModal(modalId);
        },

        showPromptPreviewModal: function(prompt) {
            const previewContentDiv = document.createElement('div');
            previewContentDiv.className = 'prompt-preview-content';
            const preElement = document.createElement('pre');
            preElement.textContent = prompt.content;
            previewContentDiv.appendChild(preElement);

            const modalId = 'prompt-preview-modal-' + String(prompt.id || '').replace(/[^a-zA-Z0-9-_]/g, ''); // Sanitize ID
            const previewTitle = 'Preview: ' + String(prompt.title || '');

            this.createModal(modalId, previewTitle, previewContentDiv,
                [
                    { text: 'Copy', className: 'primary', handler: () => this.copyToClipboard(prompt.content, prompt.title, modalId) },
                    { text: 'Close', className: 'secondary', handler: () => this.hideModal(modalId) }
                ],
                { isSubModal: true, customClass: 'prompt-helper-preview-dialog' } // Mark as sub-modal
            );
             // Center the preview modal specifically
            const previewModalDialog = document.getElementById(modalId + '-overlay').querySelector('.prompt-helper-modal-dialog');
            if (previewModalDialog) {
                previewModalDialog.style.position = 'fixed';
                previewModalDialog.style.top = '50%';
                previewModalDialog.style.left = '50%';
                previewModalDialog.style.transform = 'translate(-50%, -50%)';
            }
            this.showModal(modalId);
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
                    --ph-toast-warning-text-color: #202124; /* Dark text for yellow bg */
                    --ph-preset-button-bg-color: #F0F8FF; /* Alice Blue */
                    --ph-preset-button-text-color: var(--ph-button-bg-color); /* Use main button blue */
                    --ph-preset-button-border-color: #d1e0ec; /* Lighter Moderate Blue */
                    --ph-preset-button-hover-bg-color: #d1e0ec; /* Slightly darker Alice Blue */
                }
                #prompt-helper-button-container {
                    position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
                    z-index: 9999; display: flex; gap: 10px; margin-left: 30px; /* Offset for potential scrollbars */
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
                #prompt-helper-app-starter-button { background-color: var(--ph-app-starter-bg-color); color: white; } /* Ensure text is white */
                #prompt-helper-app-starter-button:hover { background-color: var(--ph-app-starter-hover-bg-color); }
                #prompt-helper-edit-script-button { background-color: var(--ph-edit-button-bg-color); }
                #prompt-helper-edit-script-button:hover { background-color: var(--ph-edit-button-hover-bg-color); }
                #prompt-helper-copy-page-url-button { background-color: var(--ph-copy-url-button-bg-color); } /* Styles for P Copy URL button */
                #prompt-helper-copy-page-url-button:hover { background-color: var(--ph-copy-url-button-hover-bg-color); }

                .prompt-helper-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 12px 22px; color: white; border-radius: 6px; z-index: calc(var(--ph-modal-z-index) + 100); box-shadow: 0 3px 8px rgba(0,0,0,0.25); font-size: 14.5px; display: none; white-space: pre-wrap; text-align: center; max-width: 85%;}
                .prompt-helper-toast.success { background-color: #4CAF50; }
                .prompt-helper-toast.error { background-color: #f44336; }
                .prompt-helper-toast.warning { background-color: var(--ph-toast-warning-bg-color); color: var(--ph-toast-warning-text-color); }

                .prompt-helper-modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.4); align-items: flex-start; /* Changed from center for top positioning */ justify-content: center; }
                .prompt-helper-modal-dialog { background-color: #F0F8FF; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); width: 450px; max-height: calc(85vh - 60px); /* Max height considering header/footer */ display: flex; flex-direction: column; color: #000; /* Text color for modal content */ }
                .prompt-helper-preview-dialog { width: 90% !important; max-width: 700px !important; max-height: 80vh !important; } /* Specific styles for preview dialog */
                .prompt-helper-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #d1e0ec; /* Alice Blue lighter shade */ }
                .prompt-helper-modal-header h3 { margin: 0; font-size: 17px; color: var(--ph-button-bg-color); font-weight: 600; }
                .prompt-helper-modal-close { background: none; border: none; font-size: 24px; font-weight: normal; color: #555; cursor: pointer; padding: 0 5px; line-height: 1; }
                .prompt-helper-modal-close:hover { color: #000; }
                .prompt-helper-modal-content { padding: 20px; overflow-y: auto; flex-grow: 1; }
                .prompt-helper-modal-footer { padding: 14px 20px; border-top: 1px solid #d1e0ec; text-align: right; background-color: #e6f2ff; /* Slightly darker than modal bg */ border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; display: flex; justify-content: flex-end; gap: 8px;}
                .prompt-helper-button { padding: 8px 16px; border: 1px solid #b8d2e6; border-radius: 5px; cursor: pointer; font-size: 13.5px; font-weight: 500; display: flex; align-items: center; /* For icon + text */ }

                .prompt-helper-button.primary { background-color: var(--ph-button-bg-color); color: white; border-color: var(--ph-button-bg-color); }
                .prompt-helper-button.primary:hover { background-color: var(--ph-button-hover-bg-color); border-color: var(--ph-button-hover-bg-color); }
                .prompt-helper-button.secondary { background-color: #fff; color: var(--ph-button-bg-color); border-color: #b8d2e6; }
                .prompt-helper-button.secondary:hover { background-color: #e6f2ff; border-color: var(--ph-button-hover-bg-color); }

                .prompt-helper-preset-button {
                    background-color: var(--ph-preset-button-bg-color); color: var(--ph-preset-button-text-color);
                    border: 1px solid var(--ph-preset-button-border-color);
                }
                .prompt-helper-preset-button:hover {
                    background-color: var(--ph-preset-button-hover-bg-color); border-color: var(--ph-preset-button-text-color); /* Border color matches text on hover */
                }

                /* List specific styles */
                .prompt-list-items-container { max-height: 320px; /* Adjust as needed */ }
                .prompt-helper-modal-list-item-wrapper { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #d1e0ec; transition: background-color 0.15s; cursor: pointer; }
                .prompt-helper-modal-list-item-wrapper:last-child { border-bottom: none; }
                .prompt-helper-modal-list-item-wrapper:hover { background-color: #e6f2ff; }
                .prompt-helper-modal-list-item { flex-grow: 1; padding: 13px 12px; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .prompt-helper-preview-button { background: none; border: none; color: #555; cursor: pointer; padding: 8px 12px; font-size: 18px; /* Adjust for icon size */ border-radius: 4px; transition: background-color 0.2s, color 0.2s; }
                .prompt-helper-preview-button:hover { color: var(--ph-button-bg-color); background-color: #d1e0ec; }
                .prompt-helper-empty-message { color: #555; text-align: center; padding: 25px 0; font-style: italic;}
                .prompt-preview-content { background-color: #e6f2ff; padding: 20px; border: 1px solid #b8d2e6; border-radius: 6px; max-height: calc(80vh - 160px); overflow-y: auto; }
                .prompt-preview-content pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: 'Source Code Pro', Consolas, "Courier New", monospace, "Noto Sans JP", sans-serif; font-size: 13.5px; line-height: 1.65; color: #111;}
            \`);
            GM_registerMenuCommand("Reset Prompts (Prompt Amplifier)", this.resetPrompts.bind(this));
            console.log('[Prompt Amplifier] Enhanced script initialized. Access prompts via PROMPT_AMPLIFIER_DATA.getPrompts()');

            // Ensure initialPrompts have IDs and are set as the base for GM_getValue fallback
            this.initialPrompts = this.initialPrompts.map(p => ({...p, id: p.id || this.generateId()}));
            // The behavior for overriding or merging with GM_getValue needs to be clear.
            // For now, this makes the script's initialPrompts the source of truth on each load if no GM_value exists.
            // If you always want to force script's prompts, then directly call GM_setValue here.
            // Let's adopt the "force script's prompts on init" as per your latest script modification
            GM_setValue('promptAmplifierEnhancedPrompts_v1', this.initialPrompts);

            // Delay UI creation to ensure page is fully loaded, especially for sites like Gemini
            setTimeout(() => this.createMainUI(), 800);
        }
    };

    // Wait for the DOM to be fully loaded before initializing
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => PROMPT_AMPLIFIER_DATA.init());
    } else {
        PROMPT_AMPLIFIER_DATA.init();
    }

})();
`.trim()
}
