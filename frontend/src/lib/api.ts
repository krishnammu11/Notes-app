import axios from 'axios';
import {
  Note,
  Label,
  CreateNotePayload,
  UpdateNotePayload,
  CreateLabelPayload,
  UpdateLabelPayload,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Notes ──────────────────────────────────────────────────────────────────

export const getNotes = async (labelIds?: string[]): Promise<Note[]> => {
  const params = new URLSearchParams();
  labelIds?.forEach((id) => params.append('labelIds', id));
  const { data } = await api.get<Note[]>(`/notes?${params.toString()}`);
  return data;
};

export const getNote = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const { data } = await api.post<Note>('/notes', payload);
  return data;
};

export const updateNote = async (id: string, payload: UpdateNotePayload): Promise<Note> => {
  const { data } = await api.put<Note>(`/notes/${id}`, payload);
  return data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await api.delete(`/notes/${id}`);
};

export const addLabelToNote = async (noteId: string, labelId: string): Promise<Note> => {
  const { data } = await api.patch<Note>(`/notes/${noteId}/labels/${labelId}`);
  return data;
};

export const removeLabelFromNote = async (noteId: string, labelId: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${noteId}/labels/${labelId}`);
  return data;
};

// ── Labels ─────────────────────────────────────────────────────────────────

export const getLabels = async (): Promise<Label[]> => {
  const { data } = await api.get<Label[]>('/labels');
  return data;
};

export const createLabel = async (payload: CreateLabelPayload): Promise<Label> => {
  const { data } = await api.post<Label>('/labels', payload);
  return data;
};

export const updateLabel = async (id: string, payload: UpdateLabelPayload): Promise<Label> => {
  const { data } = await api.put<Label>(`/labels/${id}`, payload);
  return data;
};

export const deleteLabel = async (id: string): Promise<void> => {
  await api.delete(`/labels/${id}`);
};