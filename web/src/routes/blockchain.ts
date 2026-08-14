import { Router } from "express";
import asyncErrorHandler from "../middlewares/helpers/asyncErrorHandler";
import { getBlockchainStatus } from "../services/blockchain";

const router = Router();

router.get(
  "/status",
  asyncErrorHandler(async (_req, res) => {
    res.json({ success: true, data: await getBlockchainStatus() });
  })
);

export default router;
