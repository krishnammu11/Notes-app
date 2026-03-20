'use client';

import { Note } from '@/types';
import LabelBadge from './LabelBadge';
import { formatDistanceToNow } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content.length > 140
    ? note.content.slice(0, 140).trimEnd() + '…'
    : note.content;

  return (
    <article
      onClick={onClick}
      className="card p-5 cursor-pointer group hover:shadow-md hover:border-ink-200 transition-all duration-200 animate-slide-up"
    >
      <div className="h-0.5 w-8 bg-ink-300 group-hover:w-full group-hover:bg-ink-400 transition-all duration-300 mb-4 rounded-full" />

      <h3 className="font-display text-lg font-semibold text-ink-900 mb-2 leading-snug line-clamp-2 group-hover:text-ink-700 transition-colors">
        {note.title}
      </h3>

      <p className="text-sm text-ink-500 leading-relaxed mb-4 line-clamp-3">
        {preview}
      </p>

      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.labels.map((label) => (
            <LabelBadge key={label.id} label={label} size="sm" />
          ))}
        </div>
      )}

      <time className="text-xs text-ink-400 font-mono">
        {formatDistanceToNow(new Date(note.updated_at))}
      </time>
    </article>
  );
}