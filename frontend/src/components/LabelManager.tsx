'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { Label } from '@/types';
import { PRESET_COLORS, getRandomColor } from '@/lib/utils';
import { createLabel, updateLabel, deleteLabel } from '@/lib/api';

interface LabelManagerProps {
  labels: Label[];
  activeFilterIds: string[];
  onFilterToggle: (labelId: string) => void;
  onLabelsChanged: () => void;
}

interface EditState {
  id: string;
  name: string;
  color: string;
}

export default function LabelManager({
  labels,
  activeFilterIds,
  onFilterToggle,
  onLabelsChanged,
}: LabelManagerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(getRandomColor());
  const [editState, setEditState] = useState<EditState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createLabel({ name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor(getRandomColor());
      setCreating(false);
      onLabelsChanged();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create label');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editState || !editState.name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await updateLabel(editState.id, { name: editState.name.trim(), color: editState.color });
      setEditState(null);
      onLabelsChanged();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update label');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete label "${name}"?`)) return;
    setLoading(true);
    try {
      await deleteLabel(id);
      onLabelsChanged();
    } catch {
      setError('Failed to delete label');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Tag size={15} />
          <span className="text-sm font-semibold uppercase tracking-wider">Labels</span>
        </div>
        <button
          onClick={() => { setCreating(true); setError(''); }}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="New label"
        >
          <Plus size={16} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg mb-2">{error}</p>
      )}

      {/* Create form */}
      {creating && (
        <div className="border border-gray-200 rounded-xl p-3 mb-2 space-y-2 bg-white shadow-sm">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Label name"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c }}
              >
                {newColor === c && <Check size={10} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="flex-1 bg-gray-900 text-white text-xs py-1 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '…' : 'Create'}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* All notes button */}
      <button
        onClick={() => activeFilterIds.forEach(onFilterToggle)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left w-full ${
          activeFilterIds.length === 0
            ? 'bg-gray-900 text-white font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        All notes
      </button>

      {/* Label list */}
      <div className="space-y-0.5 mt-1">
        {labels.map((label) => (
          <div key={label.id}>
            {editState?.id === label.id ? (
              <div className="border border-gray-200 rounded-xl p-2 space-y-2 bg-white shadow-sm">
                <input
                  value={editState.name}
                  onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditState(null); }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditState({ ...editState, color: c })}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {editState.color === c && <Check size={10} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={handleUpdate} disabled={loading} className="flex-1 bg-gray-900 text-white text-xs py-1 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">Save</button>
                  <button onClick={() => setEditState(null)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50"><X size={12} /></button>
                </div>
              </div>
            ) : (
              <div
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeFilterIds.includes(label.id) ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => onFilterToggle(label.id)}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                <span className={`text-sm flex-1 truncate ${activeFilterIds.includes(label.id) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {label.name}
                </span>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditState({ id: label.id, name: label.name, color: label.color }); }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(label.id, label.name); }}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {labels.length === 0 && !creating && (
        <p className="text-xs text-gray-400 text-center py-4 px-2">
          No labels yet. Create one to organize your notes.
        </p>
      )}
    </aside>
  );
}