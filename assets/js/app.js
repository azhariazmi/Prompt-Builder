import { templates } from "./prompts.js";
import { enhancePrompt } from "./api.js";

const $ = selector => document.querySelector(selector);

const templateList = $("#template-list");
const promptInput = $("#prompt-input");
const resultOutput = $("#result-output");
const styleSelect = $("#style-select");
const generateButton = $("#generate-button");
const generateLabel = $("#generate-label");
const statusMessage = $("#status-message");
const characterCount = $("#character-count");

let activeTemplate = "couple";

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message visible ${type}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

function renderTemplates() {
  templateList.innerHTML = templates.map(template => `
    <button
      type="button"
      class="template-card ${template.id === activeTemplate ? "active" : ""}"
      data-template="${template.id}"
    >
      <span class="template-icon">${template.icon}</span>
      <span>
        <span class="template-name">${template.name}</span>
        <span class="template-description">${template.description}</span>
      </span>
    </button>
  `).join("");
}

function selectTemplate(id) {
  const template = templates.find(item => item.id === id);

  if (!template) return;

  activeTemplate = id;
  promptInput.value = template.prompt;

  updateCharacterCount();
  renderTemplates();
  clearStatus();
}

function updateCharacterCount() {
  characterCount.textContent =
    `${promptInput.value.length} / 6000`;
}

async function generatePrompt() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    showStatus("Please enter your idea first.", "error");
    promptInput.focus();
    return;
  }

  if (prompt.length > 6000) {
    showStatus("Your prompt is too long.", "error");
    return;
  }

  generateButton.disabled = true;
  generateLabel.textContent = "Creating your prompt...";
  showStatus("✦ ChatGPT is enhancing your creative idea...", "loading");

  try {
    const result = await enhancePrompt(
      prompt,
      styleSelect.value
    );

    if (!result) {
      throw new Error("The AI returned an empty result.");
    }

    resultOutput.value = result;

    showStatus(
      "Your enhanced prompt is ready! ✨",
      "success"
    );

    resultOutput.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  } catch (error) {
    console.error(error);

    showStatus(
      error.message || "Something went wrong. Please try again.",
      "error"
    );

  } finally {
    generateButton.disabled = false;
    generateLabel.textContent = "Enhance with ChatGPT";
  }
}

async function copyText(text) {
  if (!text.trim()) {
    showStatus("Nothing to copy yet.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus("Copied to clipboard! ✨", "success");
  } catch {
    showStatus("Unable to access clipboard.", "error");
  }
}

function downloadPrompt() {
  const text = resultOutput.value.trim();

  if (!text) {
    showStatus("Generate a prompt before downloading.", "error");
    return;
  }

  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "my-ai-prompt.txt";
  link.click();

  URL.revokeObjectURL(url);

  showStatus("Prompt downloaded successfully!", "success");
}

templateList.addEventListener("click", event => {
  const button = event.target.closest("[data-template]");

  if (!button) return;

  selectTemplate(button.dataset.template);
});

promptInput.addEventListener("input", () => {
  updateCharacterCount();
  clearStatus();
});

generateButton.addEventListener("click", generatePrompt);

$("#clear-button").addEventListener("click", () => {
  promptInput.value = "";
  resultOutput.value = "";
  updateCharacterCount();
  clearStatus();
  promptInput.focus();
});

$("#copy-button").addEventListener("click", () => {
  copyText(resultOutput.value);
});

$("#download-button").addEventListener("click", downloadPrompt);

$("#year").textContent = new Date().getFullYear();

renderTemplates();
selectTemplate("couple");