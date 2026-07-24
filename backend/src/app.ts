import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabaseClient.js";
import { organizationsRouter } from "./routes/organizations.js";
import { projectsRouter } from "./routes/projects.js";
import { projectTasksRouter, taskRouter } from "./routes/tasks.js";
import { organizationMembersRouter } from "./routes/organizationMembers.js";

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

app.use("/api/organizations", organizationsRouter);
app.use("/api/organizations/:orgId/projects", projectsRouter);
app.use("/api/organizations/:orgId/members", organizationMembersRouter);
app.use("/api/projects/:projectId/tasks", projectTasksRouter);
app.use("/api/tasks", taskRouter);
