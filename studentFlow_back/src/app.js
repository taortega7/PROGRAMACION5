import express from "express";
import healthRouter from "./routes/health.routes.js";
import materiasRouter from "./routes/materias.routes.js";
import recordatoriosRouter from "./routes/recordatorios.routes.js"; // 1. Tu importación

import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { attachTemporaryUser } from "./middlewares/request-context.middleware.js";

const app = express();

app.use(express.json());
app.use(attachTemporaryUser); // Aquí se inyecta tu req.user

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/materias", materiasRouter);
console.log("--> Cargando módulo de recordatorios");
app.use("/api/v1/recordatorios", recordatoriosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;