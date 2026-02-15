// Select DOM elements
const inputEl = document.querySelector("#input");
const typeEl = document.querySelector("#type");
const formatEl = document.querySelector("#format");
const lengthEl = document.querySelector("#length");
const expectedInputLanguagesEl = document.querySelector("#expected-input-languages");
const outputLanguageEl = document.querySelector("#output-language");
const sharedContextEl = document.querySelector("#shared-context");
const charCountEl = document.querySelector("#character-count");
const unsupportedEl = document.querySelector("#summarization-unsupported");
const unavailableEl = document.querySelector("#summarization-unavailable");
const outputEl = document.querySelector("#output");
const durationEl = document.querySelector("#duration");
const inputStatsEl = document.querySelector("#input-stats");
const throughputEl = document.querySelector("#throughput");

let debounceTimer;

/**
 * Checks if the Summarizer API is available and the model is ready.
 */
const checkAvailability = async () => {
    // Note: The API spec changes frequently.
    // Sometimes it is window.ai.summarizer, usually window.Summarizer in the trial.
    if (!window.Summarizer) return false;

    try {
        const available = await window.Summarizer.availability();
        // Returns "available", "readily", "after-download", or "no"
        return available === "available" || available === "readily" || available === "downloadable" || available === "after-download";
    } catch (e) {
        console.error("Error checking availability:", e);
        return false;
    }
};

/**
 * Creates a summarizer instance with current settings.
 */
/**
 * Returns array of selected BCP 47 codes from expected input language checkboxes.
 */
const getExpectedInputLanguages = () => {
    const checked = document.querySelectorAll("#expected-input-languages input[name=input-lang]:checked");
    return Array.from(checked).map((el) => el.value);
};

const createSession = async (type = "tldr", format = "plain-text", length = "medium", expectedInputLanguages = [], outputLanguage = "auto", sharedContext = "") => {
    const isAvailable = await checkAvailability();
    if (!isAvailable) throw new Error("AI Summarization is not supported");

    const options = {
        type: type,
        format: format,
        length: length,
    };
    if (expectedInputLanguages.length > 0) {
        options.expectedInputLanguages = expectedInputLanguages;
    }
    if (outputLanguage && outputLanguage !== "auto") {
        options.outputLanguage = outputLanguage;
    }
    if (sharedContext && sharedContext.trim()) {
        options.sharedContext = sharedContext.trim();
    }

    return await window.Summarizer.create(options);
};

/**
 * Main logic to generate the summary.
 */
const generateSummary = async () => {
    // Debounce: Clear previous timer
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = "Please enter text to summarize.";
            return;
        }

        outputEl.textContent = "Generating summary...";
        durationEl.textContent = "Duration: …";
        inputStatsEl.textContent = "Input: … chars (… tokens)";
        throughputEl.textContent = "Throughput: …";

        try {
            // 1. Create a session based on dropdowns
            const session = await createSession(typeEl.value, formatEl.value, lengthEl.value, getExpectedInputLanguages(), outputLanguageEl.value, sharedContextEl.value);

            // 2. Get token count from the browser's model tokenizer (measureInputUsage).
            const tokenCount = await session.measureInputUsage(text);
            const inputQuota = session.inputQuota;
            const inputChars = text.length;

            charCountEl.textContent = `${Math.round(tokenCount)} of ${inputQuota}`;

            // 3. Generate Summary (with timing)
            const startTime = performance.now();
            const result = await session.summarize(text);
            const endTime = performance.now();
            const durationSec = (endTime - startTime) / 1000;

            // 4. Update UI
            outputEl.textContent = result;
            durationEl.textContent = `Duration: ${durationSec.toFixed(2)}s`;
            inputStatsEl.textContent = `Input: ${inputChars} chars (${Math.round(tokenCount)} tokens)`;
            throughputEl.textContent = tokenCount > 0 && durationSec > 0
                ? `Throughput: ${(tokenCount / durationSec).toFixed(0)} tokens/s`
                : "Throughput: —";

            // 5. Cleanup to free memory
            session.destroy();

        } catch (error) {
            console.error(error);
            outputEl.textContent = "Error generating summary: " + error.message;
            charCountEl.textContent = "—";
            durationEl.textContent = "Duration: —";
            inputStatsEl.textContent = "Input: — chars (— tokens)";
            throughputEl.textContent = "Throughput: —";
        }

    }, 800); // 800ms delay to stop running on every single keystroke
};

/**
 * Initialization
 */
const init = async () => {
    // 1. Check if API exists in window
    if (self.Summarizer === undefined) {
        unavailableEl.style.display = "flex";
        charCountEl.textContent = "—";
        return;
    }

    // 2. Check if model is downloadable/available
    const isReady = await checkAvailability();
    if (!isReady) {
        unsupportedEl.style.display = "flex";
        charCountEl.textContent = "—";
        return;
    }

    // 3. Attach Event Listeners
    typeEl.addEventListener("change", generateSummary);
    formatEl.addEventListener("change", generateSummary);
    lengthEl.addEventListener("change", generateSummary);
    expectedInputLanguagesEl.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", generateSummary);
    });
    outputLanguageEl.addEventListener("change", generateSummary);
    sharedContextEl.addEventListener("input", generateSummary);
    inputEl.addEventListener("input", generateSummary);

    // 4. Initial Run
    if(inputEl.value) {
        generateSummary();
    }
};

init();
