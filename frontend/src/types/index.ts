export interface Label {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  labels: Label[];
  created_at: string;
  updated_at: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  labelIds?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  labelIds?: string[];
}

export interface CreateLabelPayload {
  name: string;
  color?: string;
}

export interface UpdateLabelPayload {
  name?: string;
  color?: string;
}