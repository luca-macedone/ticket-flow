import express from "express";
import taskRoutes from "./routes/task.routes"
import companyRoutes from "./routes/company.routes"
import projectRoutes from "./routes/project.routes"
import userRoutes from "./routes/user.routes"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TicketFlow API",
            version: "1.0.0",
        },
    },
    apis: [
        path.resolve(__dirname, "./routes/**/*.ts"),
        path.resolve(__dirname, "./controllers/**/*.ts"),
    ],
});

export const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// console.log('DATABASE_URL =', process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME)

// health check
app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
})

app.use("/api/auth", authRoutes);
app.use("/api", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/tasks", taskRoutes);

app.use(globalErrorHandler)