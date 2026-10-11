// ========================================
// QUICKNOTES - API CLIENT
// JSONPlaceholder is a demo/testing API.
// POST and DELETE requests are simulated.
// ========================================

const API_URL = "https://jsonplaceholder.typicode.com/posts";

// HTML elements
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const bodyInput = document.getElementById("note-body");
const submitButton = document.getElementById("submit-button");
const formMessage = document.getElementById("form-message");
const notesList = document.getElementById("notes-list");
const notesStatus = document.getElementById("notes-status");
const refreshButton = document.getElementById("refresh-button");

// Notes currently shown in the application.
let notes = [];

// Keep track of simulated deletions during this browser session.
const deletedNoteIds = new Set();

// Escape text before displaying API data as HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

// Display a message beneath the note form.
function showFormMessage(message, type = "") {
    formMessage.textContent = message;
    formMessage.className = type;
}

// Display the notes currently in memory.
function renderNotes() {
    if (notes.length === 0) {
        notesList.innerHTML = "";
        notesStatus.textContent =
            "No notes to display. Create your first note above.";
        return;
    }

    notesStatus.textContent = `${notes.length} note(s) displayed`;

    notesList.innerHTML = notes.map(function (note) {
        const title = escapeHTML(note.title);
        const body = escapeHTML(note.body);
        const id = Number(note.id);

        return `
            <article class="note-card">
                <h3>${title}</h3>
                <p>${body}</p>
                <div class="note-card-footer">
                    <span class="note-tag">
                        ${note.isNew ? "NEW NOTE" : "SAVED NOTE"}
                    </span>
                    <button
                        class="delete-button"
                        type="button"
                        data-note-id="${id}"
                        aria-label="Delete ${title}"
                    >
                        Delete
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// GET: Fetch notes from JSONPlaceholder.
async function loadNotes() {
    notesStatus.textContent = "Loading notes...";
    refreshButton.disabled = true;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Unable to load notes (HTTP ${response.status}).`);
        }

        const data = await response.json();

        // Show a manageable collection instead of all 100 demo posts.
        notes = data
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
        refreshButton.disabled = false;
    }
}

// POST: Submit a new note to the demo API.
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate user input before sending the request.
    if (!title || !body) {
        showFormMessage(
            "Please enter both a title and the note text.",
            "error"
        );
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
    showFormMessage("Sending your note...", "");

    try {
        const response = await fetch(API_URL, {
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

        if (!response.ok) {
            throw new Error(`Unable to create note (HTTP ${response.status}).`);
        }

        const createdNote = await response.json();

        // JSONPlaceholder returns a simulated ID, usually 101.
        // Generate a unique local ID for notes created in this session.
        const localId = Date.now();

        notes.unshift({
            id: localId,
            title: createdNote.title || title,
            body: createdNote.body || body,
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
        submitButton.disabled = false;
        submitButton.innerHTML = "<span aria-hidden=\"true\">＋</span> Save note";
    }
}

// DELETE: Send a delete request and remove the note from this session's view.
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
        const response = await fetch(`${API_URL}/${noteId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Unable to delete note (HTTP ${response.status}).`);
        }

        // Update the local interface only after a successful response.
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

// Listen for note form submissions.
noteForm.addEventListener("submit", createNote);

// Event delegation handles Delete buttons in every note card.
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

// Allow users to refresh the collection.
refreshButton.addEventListener("click", loadNotes);

// Load demo notes when the page starts.
loadNotes();
