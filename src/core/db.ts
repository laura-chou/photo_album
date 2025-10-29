import mongoose, { PipelineStage } from "mongoose";

import { RESPONSE_MESSAGE } from "../common/constants";
import { isNullOrEmpty } from "../common/utils";

import { LogLevel, LogMessage, setLog } from "./logger";

if (isNullOrEmpty(process.env.DBURL)) {
  throw new Error(RESPONSE_MESSAGE.ENV_ERROR);
}

export const connectDB = async(): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await mongoose.connect(process.env.DBURL!);
    setLog(LogLevel.INFO, "MongoDB connected successfully");
  } catch (error) {
    setLog(LogLevel.ERROR, `MongoDB connection error: 
      ${error instanceof Error ? error.message : LogMessage.ERROR.UNKNOWN}`);
    process.exit(1);
  }
};

const lookupAlbum = {
  $lookup: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    from: process.env.COLLECTION_ALBUM!,
    localField: "_id",
    foreignField: "userId",
    as: "albums"
  }
};

export const getUserAlbumPipeline = (userName: string): PipelineStage[] => [
  {
    $match: {
      userName: userName
    }
  },
  lookupAlbum,
  { $unwind: "$albums" },
  {
    $project: {
      _id: 0,
      id: "$albums._id",
      folder: "$albums.folder"
    }
  }
];