class Note {
    constructor() {
        this.notesContainer = document.querySelector("#notes-container");
        this.noteInput = document.querySelector("#note-content");
        this.addNoteBtn = document.querySelector(".add-note");
        this.searchInput = document.querySelector("#search-input");
        this.exportBtn = document.querySelector("#export-notes");

        this.notes = this.getNotes() || [];

        this.displayNotes();
        this.addEventListeners();
    }

    getNotes() {
        return JSON.parse(localStorage.getItem("notes"));
    }

    saveNotes() {
        localStorage.setItem("notes", JSON.stringify(this.notes));
    }

    addNote(content) {
        const newNote = {
            id: this.generateId(),
            content: content,
            fixed: false,
        };

        this.notes.push(newNote);
        this.saveNotes();
        this.noteInput.value = "";
        this.displayNotes();
    }

    deleteNote(id) {
        this.notes = this.notes.filter((note) => note.id !== id);
        this.saveNotes();
        this.displayNotes();
    }

    duplicateNote(id) {
        const noteToDuplicate = this.notes.find((note) => note.id === id);
        this.addNote(noteToDuplicate.content);
    }

    toggleFixNote(id) {
        this.notes = this.notes.map((note) => {
            if (note.id === id) {
                note.fixed = !note.fixed;
            }
            return note;
        });
        this.saveNotes();
        this.displayNotes();
    }

    updateNote(id, newContent) {
        const noteToUpdate = this.notes.find((note) => note.id === id);
        if (noteToUpdate) {
            noteToUpdate.content = newContent;
            this.saveNotes();
        }
    }

    searchNotes(query) {
        const normalizedQuery = query.toLowerCase();
        return this.notes.filter((note) =>
            note.content.toLowerCase().includes(normalizedQuery)
        );
    }

    exportToCsv() {
        const notesToExport = this.notes.map(note => ({
            content: `"${note.content.replace(/"/g, '""')}"`,
            fixed: note.fixed,
        }));

        const csvHeader = "Content,Fixed\n";
        const csvBody = notesToExport.map(note => `${note.content},${note.fixed}`).join("\n");
        const csvString = csvHeader + csvBody;

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "notes.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    displayNotes(notesToDisplay = null) {
        this.cleanNotes();
        const notes = notesToDisplay || this.notes;

        const pinnedNotes = notes.filter((note) => note.fixed);
        const otherNotes = notes.filter((note) => !note.fixed);

        pinnedNotes.forEach((note) => this.createNoteElement(note));
        otherNotes.forEach((note) => this.createNoteElement(note));
    }

    createNoteElement({ id, content, fixed }) {
        const element = document.createElement("div");
        element.classList.add("note");
        if (fixed) {
            element.classList.add("fixed");
        }

        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.placeholder = "Write something...";

        textarea.addEventListener("input", () => {
            const newContent = textarea.value;
            this.updateNote(id, newContent);
        });

        element.appendChild(textarea);

        const iconsContainer = document.createElement("div");
        iconsContainer.classList.add("icons");

        const pinIcon = this.createIcon("bi-pin", () => this.toggleFixNote(id));
        if (fixed) pinIcon.classList.add("fixed");

        const deleteIcon = this.createIcon("bi-x-lg", () => this.deleteNote(id));

        const duplicateIcon = this.createIcon("bi-file-earmark-plus", () => this.duplicateNote(id));

        iconsContainer.append(pinIcon, deleteIcon, duplicateIcon);
        element.appendChild(iconsContainer);

        this.notesContainer.appendChild(element);
    }

    createIcon(className, eventCallback) {
        const icon = document.createElement("i");
        icon.classList.add("bi", className);
        icon.addEventListener("click", eventCallback);
        return icon;
    }

    cleanNotes() {
        this.notesContainer.innerHTML = "";
    }

    addEventListeners() {
        this.addNoteBtn.addEventListener("click", () => {
            const content = this.noteInput.value;
            if (content) {
                this.addNote(content);
            }
        });

        this.noteInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const content = this.noteInput.value;
                if (content) {
                    this.addNote(content);
                }
            }
        });

        this.searchInput.addEventListener("keyup", () => {
            const query = this.searchInput.value;
            const filteredNotes = this.searchNotes(query);
            this.displayNotes(filteredNotes);
        });

        this.exportBtn.addEventListener("click", () => this.exportToCsv());
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
}

new Note();