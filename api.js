// ============================================================================
// QUICKNOTES - API CLIENT
// Demo client communicating with JSONPlaceholder mock REST API.
// Note: JSONPlaceholder is a demo service; POST and DELETE requests
// are simulated by the service and not persisted permanently on the server.
// ============================================================================

const API_URL = "https://jsonplaceholder.typicode.com/posts";

// DOM element references using required assessment IDs
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const formMessage = document.getElementById("form-message");
const notesList = document.getElementById("notes-list");
const notesStatus = document.getElementById("notes-status");
const loadButton = document.getElementById("load-btn");

// In-memory state for current browser session
let notes = [];

// Track simulated deletions during this browser session
const deletedNoteIds = new Set();

/**
 * Reusable HTTP request wrapper around fetch.
 * Wraps fetch, verifies HTTP response status codes, intercepts network errors,
 * and provides consistent, descriptive Error instances for all API interactions.
 *
 * @param {string} url - Target URL endpoint
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed JSON response, raw text, or null for 204
 */
async function request(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (networkError) {
        // Intercept DNS failures, offline states, CORS issues, etc.
        const error = new Error(
            `Network error: Unable to connect to server. Please check your internet connection.`
        );
        error.originalError = networkError;
        throw error;
    }

    if (!response.ok) {
        let errorDetails = "";
        try {
            const errorPayload = await response.json();
            if (errorPayload && typeof errorPayload === "object") {
                errorDetails = errorPayload.message || errorPayload.error || JSON.stringify(errorPayload);
            }
        } catch (_) {
            try {
                errorDetails = await response.text();
            } catch (_) {}
        }

        const message = errorDetails
            ? `Request failed with HTTP ${response.status}: ${errorDetails}`
            : `Request failed with HTTP ${response.status} (${response.statusText || "Error"}).`;

        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    // 204 No Content
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await response.json();
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (_) {
        return text;
    }
}

/**
 * Display status feedback beneath the note form.
 *
 * @param {string} message - Feedback text to display
 * @param {string} [type=""] - CSS class for styling ('success', 'error', or '')
 */
function showFormMessage(message, type = "") {
    formMessage.textContent = message;
    formMessage.className = type;
}

/**
 * Reset submit button state without innerHTML.
 */
function resetSubmitButton() {
    submitButton.disabled = false;
    submitButton.replaceChildren();

    const iconSpan = document.createElement("span");
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = "＋ ";

    submitButton.appendChild(iconSpan);
    submitButton.appendChild(document.createTextNode("Save note"));
}

/**
 * Render dynamic note content using safe DOM methods only.
 * Strictly avoids innerHTML to protect against XSS and adhere to DOM best practices.
 */
function renderNotes() {
    // Clear previous note cards safely
    notesList.replaceChildren();

    if (notes.length === 0) {
        notesStatus.textContent = "No notes to display. Create your first note above.";
        return;
    }

    notesStatus.textContent = `${notes.length} note(s) displayed`;

    notes.forEach(function (note) {
        const article = document.createElement("article");
        article.className = "note-card";

        const heading = document.createElement("h3");
        heading.textContent = note.title;

        const bodyParagraph = document.createElement("p");
        // Body is optional; fallback to empty string if missing
        bodyParagraph.textContent = note.body || "";

        const footer = document.createElement("div");
        footer.className = "note-card-footer";

        const tag = document.createElement("span");
        tag.className = "note-tag";
        tag.textContent = note.isNew ? "NEW NOTE" : "SAVED NOTE";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.dataset.noteId = String(note.id);
        deleteButton.setAttribute("aria-label", `Delete ${note.title}`);
        deleteButton.textContent = "Delete";

        footer.appendChild(tag);
        footer.appendChild(deleteButton);

        article.appendChild(heading);
        article.appendChild(bodyParagraph);
        article.appendChild(footer);

        notesList.appendChild(article);
    });
}

/**
 * GET: Fetch notes collection from the demo API using the reusable request wrapper.
 */
async function loadNotes() {
    notesStatus.textContent = "Loading notes...";
    loadButton.disabled = true;

    try {
        const data = await request(API_URL);

        // Show first 8 posts to keep layout clean and responsive
        notes = (Array.isArray(data) ? data : [])
            .filter(function (note) {
                return !deletedNoteIds.has(Number(note.id));
            })
            .slice(0, 8)
            .map(function (note) {
                return { ...note, isNew: false };
            });

        renderNotes();
    } catch (error) {
        notesStatus.textContent =
            "We couldn't load your notes. Check your internet connection and try again.";
        console.error("GET request failed:", error);
    } finally {
        loadButton.disabled = false;
    }
}

/**
 * POST: Submit a new note using the reusable request wrapper.
 * Validates that title is required and <= 100 chars; body is optional.
 *
 * @param {SubmitEvent} event
 */
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Note title is required and limited to 100 characters
    if (!title) {
        showFormMessage("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showFormMessage("Note title must not exceed 100 characters.", "error");
        titleInput.focus();
        return;
    }

    // Note body is optional; if provided, limit to 2,000 characters
    if (body.length > 2000) {
        showFormMessage("Note body must not exceed 2,000 characters.", "error");
        bodyInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
    showFormMessage("Sending your note...", "");

    try {
        const createdNote = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        // Generate session-unique ID for locally managed note
        const localId = Date.now();

        notes.unshift({
            id: localId,
            title: (createdNote && createdNote.title) || title,
            body: (createdNote && createdNote.body !== undefined) ? createdNote.body : body,
            userId: 1,
            isNew: true
        });

        renderNotes();
        noteForm.reset();

        showFormMessage(
            "Note created for this demo session. It is not permanently saved on the server.",
            "success"
        );
    } catch (error) {
        showFormMessage(
            "We couldn't create your note. Please check your connection and try again.",
            "error"
        );
        console.error("POST request failed:", error);
    } finally {
        resetSubmitButton();
    }
}

/**
 * DELETE: Remove a note via the demo API using the reusable request wrapper.
 *
 * @param {number} noteId
 * @param {HTMLButtonElement} button
 */
async function deleteNote(noteId, button) {
    const note = notes.find(function (item) {
        return Number(item.id) === noteId;
    });

    if (!note) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        await request(`${API_URL}/${noteId}`, {
            method: "DELETE"
        });

        // Update local interface only after confirmed response
        notes = notes.filter(function (item) {
            return Number(item.id) !== noteId;
        });

        deletedNoteIds.add(noteId);
        renderNotes();

        showFormMessage(
            "Note removed from this demo session. The server's data is not permanently changed.",
            "success"
        );
    } catch (error) {
        button.disabled = false;
        button.textContent = "Delete";

        showFormMessage(
            "We couldn't delete that note. Please try again.",
            "error"
        );
        console.error("DELETE request failed:", error);
    }
}

// Attach event listeners
noteForm.addEventListener("submit", createNote);

// Event delegation handles dynamically rendered Delete buttons
notesList.addEventListener("click", function (event) {
    const button = event.target.closest(".delete-button");
    if (!button) {
        return;
    }

    const noteId = Number(button.dataset.noteId);
    if (Number.isFinite(noteId)) {
        deleteNote(noteId, button);
    }
});

// Load button event listener
loadButton.addEventListener("click", loadNotes);

// Initial load on application start
loadNotes();
