import mongoose, { Document, Model, Schema } from "mongoose";

export const assetTypes = ["gold", "silver", "platinum"] as const;
export type AssetType = (typeof assetTypes)[number];

export interface IHolding extends Document {
  user: mongoose.Types.ObjectId;
  assetType: AssetType;
  amount: number;
  updatedAt: Date;
}

const holdingSchema = new Schema<IHolding>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assetType: { type: String, enum: assetTypes, required: true },
    amount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

holdingSchema.index({ user: 1, assetType: 1 }, { unique: true });

const Holding: Model<IHolding> = mongoose.model<IHolding>("Holding", holdingSchema);
export default Holding;
