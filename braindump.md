# Instructions: Adding Notes to Channel Notes App

This guide explains how to extend the current channel-only MVP into a channel + notes system. Notes will live inside channels and persist to localStorage (same as channels).

1. Data Model

Add a Note type and store it inside AppState.

export type Note = {
  id: string;
  channelId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

Update AppState:

export type AppState = {
  channels: Channel[];
  notes: Note[];             // <— NEW
  activeChannelId: string | null;
  activeNoteId: string | null; // optional for open editor
};

2. Context Actions

Extend AppStateProvider with note CRUD:

createNote(channelId: string, title?: string)

updateNote(id: string, fields: Partial<Note>)

deleteNote(id: string)

selectNote(id: string)

All should persist via setState → writeState.

3. Routes

Add nested routes under each channel:

/[channelId]/notes/[noteId]


/[channelId] → note list (sidebar or main pane).

/[channelId]/notes/[noteId] → editor view.

If a note is deleted, redirect to channel root.

4. UI Components

NoteList.tsx

Displays all notes in the current channel.

Show title, updatedAt.

Button/new-note shortcut.

Click → navigates to /[channelId]/notes/[noteId].

NoteEditor.tsx

Basic: <textarea> for content + <input> for title.

Auto-save on change (updates state).

Show last updated timestamp.

5. Keyboard Shortcuts

n → new note in current channel.

⌘/ctrl + s → save note (optional, autosave already works).

Arrow keys / j k to move through notes in list.

Use the existing useHotkeys hook.

6. Search & Filters (Phase 2)

Later, add a global search page:

/search with query box.

Filter by channel, tags (if added).

Use toLowerCase().includes for MVP, upgrade to vector search later.

7. Wikilinks (Phase 3)

Implement [[note-title]] parsing:

Regex find [[...]] in note content.

If target exists → link to that note.

If not → prompt to create new note.

Show backlinks: in NoteEditor, list notes that link to the current note.

8. Migration Considerations

If you already have state in localStorage, migrate it:

if (!state.notes) state.notes = [];
if (!state.activeNoteId) state.activeNoteId = null;

9. Future Enhancements

Rich editor: swap textarea for Tiptap
.

Tags/properties: per-note metadata stored in note.properties.

Saved Views: filters (channel + tag) saved like Drive folders.

Sync: replace localStorage with Supabase/Postgres when ready.

10. Testing Checklist

Create note in a channel → persists after refresh.

Rename/delete note → updates state correctly.

Navigate directly to /[channelId]/notes/[noteId] → loads editor.

Delete channel → also delete its notes.

Hotkeys work without breaking text inputs.