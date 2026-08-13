import { Response, Router } from "express";
import asyncErrorHandler from "../middlewares/helpers/asyncErrorHandler";
import { AuthenticatedRequest, isAuthenticatedUser } from "../middlewares/user_actions/auth";
import Holding, { assetTypes, AssetType } from "../models/holdingModel";

const router = Router();

router.get(
  "/",
  isAuthenticatedUser,
  asyncErrorHandler(async (req: AuthenticatedRequest, res: Response) => {
    const records = await Holding.find({ user: req.user._id }).lean();
    const holdings: Record<AssetType, { amount: number; updatedAt: Date | null }> = {
      gold: { amount: 0, updatedAt: null },
      silver: { amount: 0, updatedAt: null },
      platinum: { amount: 0, updatedAt: null },
    };

    for (const record of records) {
      holdings[record.assetType] = { amount: record.amount, updatedAt: record.updatedAt };
    }

    res.json({ success: true, data: { unit: "grams", holdings, assets: assetTypes } });
  })
);

export default router;
