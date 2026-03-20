import express from "express";
import cors from "cors";
import { pool } from "./db";
import notesRoutes from "./routes/notesRoutes";
import labelsRoutes from "./routes/labelsRoutes";

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.5:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use("/notes", notesRoutes);
app.use("/labels", labelsRoutes);

app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

pool.query("SELECT 1")
  .then(() => {
    console.log("DB connected ✅");
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((err: unknown) => {
    console.error("DB connection error ❌", err);
  });