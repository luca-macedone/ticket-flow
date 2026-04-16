import express from "express";
import taskRoutes from "./routes/task.routes"
import companyRoutes from "./routes/company.routes"
import projectRoutes from "./routes/project.routes"
import userRoutes from "./routes/user.routes"

export const app = express();

app.use(express.json());

console.log('DATABASE_URL =', process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME)

// health check
app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
})

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/tasks", taskRoutes);