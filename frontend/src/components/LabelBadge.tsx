'use client';

import { X } from 'lucide-react';
import { Label } from '@/types';

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 99, g: 102, b: 241 };
}

export default function LabelBadge({ label, onRemove, size = 'md' }: LabelBadgeProps) {
  const { r, g, b } = hexToRgb(label.color);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `rgba(${r},${g},${b},0.15)`,
        color: label.color,
        border: `1px solid rgba(${r},${g},${b},0.3)`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: label.color }}
      />
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          aria-label={`Remove ${label.name}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}