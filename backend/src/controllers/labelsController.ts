import { Request, Response } from "express";
import { pool } from "../db";

// GET /labels
export const getLabels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, color, created_at FROM labels ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch labels", error: String(err) });
  }
};

// POST /labels
export const createLabel = async (req: Request, res: Response): Promise<void> => {
  const { name, color } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO labels (name, color)
       VALUES ($1, $2)
       RETURNING id, name, color, created_at`,
      [name.trim(), color || "#6366f1"]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: `Label "${name}" already exists` });
    } else {
      res.status(500).json({ message: "Failed to create label", error: String(err) });
    }
  }
};

// PUT /labels/:id
export const updateLabel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, color } = req.body;

  if (!name && !color) {
    res.status(400).json({ message: "Provide name or color to update" });
    return;
  }

  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (name) { fields.push(`name = $${i++}`); values.push(name.trim()); }
    if (color) { fields.push(`color = $${i++}`); values.push(color); }
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE labels SET ${fields.join(", ")} WHERE id = $${i}
       RETURNING id, name, color, created_at`,
      values
    );

    if (!rows[0]) {
      res.status(404).json({ message: "Label not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: `Label "${name}" already exists` });
    } else {
      res.status(500).json({ message: "Failed to update label", error: String(err) });
    }
  }
};

// DELETE /labels/:id
export const deleteLabel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM labels WHERE id = $1`, [req.params.id]
    );
    if (!rowCount) {
      res.status(404).json({ message: "Label not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete label", error: String(err) });
  }
};