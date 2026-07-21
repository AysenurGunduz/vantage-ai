import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabaseClient.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const { error } = await supabase.auth.admin.listUsers();

  res.json({
    status: "ok",
    supabase: error ? "unreachable" : "connected",
  });
});
