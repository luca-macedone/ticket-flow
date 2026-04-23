import express from "express";
import taskRoutes from "./routes/task.routes"
import companyRoutes from "./routes/company.routes"
import projectRoutes from "./routes/project.routes"
import userRoutes from "./routes/user.routes"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDoc } from "./openapi/generator";
import cookieParser from "cookie-parser";

export const app = express();

app.use(cookieParser());
app.use(express.json());

// BigInt doesn't serialize with JSON.stringify by default
(BigInt.prototype as any).toJSON = function () { return this.toString(); };


if (process.env.NODE_ENV === "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDoc()));
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