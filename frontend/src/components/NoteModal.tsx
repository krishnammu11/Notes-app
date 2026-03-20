'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { Note, Label, CreateNotePayload, UpdateNotePayload } from '@/types';
import LabelBadge from './LabelBadge';

interface NoteModalProps {
  note?: Note | null;
  labels: Label[];
  onSave: (payload: CreateNotePayload | UpdateNotePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

export default function NoteModal({ note, labels, onSave, onDelete, onClose }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    note?.labels.map((l) => l.id) || []
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!note;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), content: content.trim(), labelIds: selectedLabelIds });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Delete this note permanently?')) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setError('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));
  const availableLabels = labels.filter((l) => !selectedLabelIds.includes(l.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Note' : 'New Note'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedLabels.map((label) => (
                <LabelBadge
                  key={label.id}
                  label={label}
                  onRemove={() => toggleLabel(label.id)}
                />
              ))}
              <button
                type="button"
                onClick={() => setLabelPickerOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus size={12} />
                Add label
              </button>
            </div>

            {labelPickerOpen && (
              <div className="border border-gray-200 rounded-xl bg-white shadow-lg p-3">
                {labels.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No labels yet.</p>
                ) : availableLabels.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">All labels added.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <LabelBadge label={label} size="sm" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}