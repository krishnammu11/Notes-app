import { Request, Response } from "express";
import { pool } from "../db";

// GET /notes
export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.query.labelIds;
    const labelIds: string[] = raw
      ? Array.isArray(raw) ? (raw as string[]) : [raw as string]
      : [];

    let rows: any[];

    if (labelIds.length > 0) {
      const { rows: filtered } = await pool.query(
        `SELECT n.id, n.title, n.content, n.created_at, n.updated_at
         FROM notes n
         JOIN note_labels nl ON nl.note_id = n.id
         WHERE nl.label_id = ANY($1::uuid[])
         GROUP BY n.id
         HAVING COUNT(DISTINCT nl.label_id) = $2
         ORDER BY n.updated_at DESC`,
        [labelIds, labelIds.length]
      );
      rows = filtered;
    } else {
      const { rows: all } = await pool.query(
        `SELECT id, title, content, created_at, updated_at
         FROM notes ORDER BY updated_at DESC`
      );
      rows = all;
    }

    if (rows.length === 0) { res.json([]); return; }

    const noteIds = rows.map((n: any) => n.id);
    const { rows: labelRows } = await pool.query(
      `SELECT nl.note_id, l.id, l.name, l.color, l.created_at
       FROM note_labels nl
       JOIN labels l ON l.id = nl.label_id
       WHERE nl.note_id = ANY($1::uuid[])`,
      [noteIds]
    );

    const labelsMap: Record<string, any[]> = {};
    for (const row of labelRows) {
      if (!labelsMap[row.note_id]) labelsMap[row.note_id] = [];
      labelsMap[row.note_id].push({
        id: row.id,
        name: row.name,
        color: row.color,
        created_at: row.created_at,
      });
    }

    res.json(rows.map((n: any) => ({ ...n, labels: labelsMap[n.id] || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes", error: String(err) });
  }
};

// GET /notes/:id
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1`,
      [id]
    );
    if (!rows[0]) { res.status(404).json({ message: "Note not found" }); return; }

    const { rows: labels } = await pool.query(
      `SELECT l.id, l.name, l.color, l.created_at
       FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id
       WHERE nl.note_id = $1`,
      [id]
    );
    res.json({ ...rows[0], labels });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch note", error: String(err) });
  }
};

// POST /notes
export const createNote = async (req: Request, res: Response): Promise<void> => {
  const { title, content, labelIds } = req.body;

  if (!title?.trim()) { res.status(400).json({ message: "title is required" }); return; }
  if (!content?.trim()) { res.status(400).json({ message: "content is required" }); return; }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO notes (title, content) VALUES ($1, $2)
       RETURNING id, title, content, created_at, updated_at`,
      [title.trim(), content.trim()]
    );
    const note = rows[0];

    if (labelIds && labelIds.length > 0) {
      const ids = labelIds as string[];
      const placeholders = ids.map((_: any, i: number) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO note_labels (note_id, label_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        [note.id, ...ids]
      );
    }

    await client.query("COMMIT");

    const { rows: labels } = await pool.query(
      `SELECT l.id, l.name, l.color FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = $1`,
      [note.id]
    );
    res.status(201).json({ ...note, labels });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Failed to create note", error: String(err) });
  } finally {
    client.release();
  }
};

// PUT /notes/:id
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, labelIds } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const exists = await client.query(`SELECT id FROM notes WHERE id = $1`, [id]);
    if (!exists.rows[0]) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "Note not found" });
      return;
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (title !== undefined) { fields.push(`title = $${i++}`); values.push(title.trim()); }
    if (content !== undefined) { fields.push(`content = $${i++}`); values.push(content.trim()); }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE notes SET ${fields.join(", ")} WHERE id = $${i}`,
        values
      );
    }

    if (labelIds !== undefined) {
      await client.query(`DELETE FROM note_labels WHERE note_id = $1`, [id]);
      if (labelIds && labelIds.length > 0) {
        const ids = labelIds as string[];
        const placeholders = ids.map((_: any, j: number) => `($1, $${j + 2})`).join(", ");
        await client.query(
          `INSERT INTO note_labels (note_id, label_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
          [id, ...ids]
        );
      }
    }

    await client.query("COMMIT");

    const { rows } = await pool.query(
      `SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1`,
      [id]
    );
    const { rows: labels } = await pool.query(
      `SELECT l.id, l.name, l.color FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = $1`,
      [id]
    );
    res.json({ ...rows[0], labels });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Failed to update note", error: String(err) });
  } finally {
    client.release();
  }
};

// DELETE /notes/:id
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM notes WHERE id = $1`, [req.params.id]
    );
    if (!rowCount) { res.status(404).json({ message: "Note not found" }); return; }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note", error: String(err) });
  }
};

// PATCH /notes/:id/labels/:labelId
export const addLabel = async (req: Request, res: Response): Promise<void> => {
  const { id, labelId } = req.params;
  try {
    const note = await pool.query(`SELECT id FROM notes WHERE id = $1`, [id]);
    if (!note.rows[0]) { res.status(404).json({ message: "Note not found" }); return; }

    const label = await pool.query(`SELECT id FROM labels WHERE id = $1`, [labelId]);
    if (!label.rows[0]) { res.status(404).json({ message: "Label not found" }); return; }

    await pool.query(
      `INSERT INTO note_labels (note_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, labelId]
    );

    const { rows } = await pool.query(
      `SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1`, [id]
    );
    const { rows: labels } = await pool.query(
      `SELECT l.id, l.name, l.color FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = $1`, [id]
    );
    res.json({ ...rows[0], labels });
  } catch (err) {
    res.status(500).json({ message: "Failed to add label", error: String(err) });
  }
};

// DELETE /notes/:id/labels/:labelId
export const removeLabel = async (req: Request, res: Response): Promise<void> => {
  const { id, labelId } = req.params;
  try {
    await pool.query(
      `DELETE FROM note_labels WHERE note_id = $1 AND label_id = $2`, [id, labelId]
    );
    const { rows } = await pool.query(
      `SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1`, [id]
    );
    if (!rows[0]) { res.status(404).json({ message: "Note not found" }); return; }

    const { rows: labels } = await pool.query(
      `SELECT l.id, l.name, l.color FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = $1`, [id]
    );
    res.json({ ...rows[0], labels });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove label", error: String(err) });
  }
};
