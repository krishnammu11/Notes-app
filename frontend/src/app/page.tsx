'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, RefreshCw } from 'lucide-react';
import {
  getNotes,
  getLabels,
  createNote,
  updateNote,
  deleteNote,
} from '@/lib/api';
import { Note, Label } from '@/types';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import LabelManager from '@/components/LabelManager';
import LabelBadge from '@/components/LabelBadge';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchLabels = useCallback(async () => {
    try {
      const data = await getLabels();
      setLabels(data);
    } catch {
      /* silent */
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotes(activeFilterIds.length ? activeFilterIds : undefined);
      setNotes(data);
    } catch {
      setError('Could not connect to the backend. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, [activeFilterIds]);

  useEffect(() => { fetchLabels(); }, [fetchLabels]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleFilterToggle = (labelId: string) => {
    setActiveFilterIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleCreateNote = async (payload: any) => {
    await createNote(payload);
    await fetchNotes();
  };

  const handleUpdateNote = async (payload: any) => {
    if (!editingNote) return;
    await updateNote(editingNote.id, payload);
    await fetchNotes();
  };

  const handleDeleteNote = async () => {
    if (!editingNote) return;
    await deleteNote(editingNote.id);
    await fetchNotes();
  };

  const filteredNotes = notes.filter((note) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.labels.some((l) => l.name.toLowerCase().includes(q))
    );
  });

  const activeFilters = labels.filter((l) => activeFilterIds.includes(l.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Notes</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            New note
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <LabelManager
          labels={labels}
          activeFilterIds={activeFilterIds}
          onFilterToggle={handleFilterToggle}
          onLabelsChanged={fetchLabels}
        />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Filtering by:</span>
              {activeFilters.map((label) => (
                <LabelBadge
                  key={label.id}
                  label={label}
                  onRemove={() => handleFilterToggle(label.id)}
                />
              ))}
              <button
                onClick={() => setActiveFilterIds([])}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
              <RefreshCw size={16} className="animate-spin" />
              Loading notes…
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 text-sm font-medium mb-1">Connection error</p>
              <p className="text-red-500 text-xs">{error}</p>
              <button onClick={fetchNotes} className="mt-3 px-4 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredNotes.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-gray-300" />
              </div>
              <p className="text-2xl text-gray-300 mb-2">
                {search ? 'No matching notes' : 'No notes yet'}
              </p>
              <p className="text-sm text-gray-400">
                {search ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  <Plus size={15} />
                  Create note
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredNotes.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-4">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                {search && ` matching "${search}"`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => setEditingNote(note)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {showCreateModal && (
        <NoteModal
          labels={labels}
          onSave={handleCreateNote}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingNote && (
        <NoteModal
          note={editingNote}
          labels={labels}
          onSave={handleUpdateNote}
          onDelete={handleDeleteNote}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}