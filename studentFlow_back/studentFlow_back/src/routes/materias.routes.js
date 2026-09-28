import { Router } from "express";
import {
  listMaterias,
  getMateria,
  createMateria,
  replaceMateria,
  updateMateria,
  deleteMateria,
  getTareasByMateria, // <-- Asegúrese de incluirlo aquí
} from "../controllers/materias.controller.js";

const router = Router();

router.get("/", listMaterias);
router.get("/:id", getMateria);
router.post("/", createMateria);
router.put("/:id", replaceMateria);
router.patch("/:id", updateMateria);
router.delete("/:id", deleteMateria);
router.get("/:id/tareas", getTareasByMateria);

export default router;