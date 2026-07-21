import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabaseClient.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const { error } = await supabase.auth.admin.listUsers();

  res.json({
    status: "ok",
    supabase: error ? "unreachable" : "connected",
  });
});

app.listen(port, () => {
  console.log(`Vantage backend listening on http://localhost:${port}`);
});
