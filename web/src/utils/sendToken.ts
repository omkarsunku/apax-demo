import { Response } from "express";
import { IUser } from "../models/userModel";

const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getJWTToken();
  const safeUser = user.toObject();
  delete safeUser.password;

  res.status(statusCode).json({
    success: true,
    user: safeUser,
    token,
  });
};

export default sendToken;
