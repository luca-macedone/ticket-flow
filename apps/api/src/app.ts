import express from "express";
import ticketRoutes from "./routes/ticket.routes"
import companyRoutes from "./routes/company.routes"
import projectRoutes from "./routes/project.routes"
import userRoutes from "./routes/user.routes"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDoc } from "./openapi/generator";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

export const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json());

app.set("json replacer", (_key: string, val: unknown) => {
    return typeof val === "bigint" ? val.toString() : val
})

if (process.env.NODE_ENV === "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDoc()));
}

// health check
app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
})

app.use("/api/auth", authRoutes);
app.use("/api", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(globalErrorHandler)