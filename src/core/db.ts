import mongoose, { PipelineStage, Types } from "mongoose";

import "dotenv/config";
import { RESPONSE_MESSAGE } from "../common/constants";
import { isNullOrEmpty } from "../common/utils";

import { LogLevel, LogMessage, setLog } from "./logger";

if (isNullOrEmpty(process.env.DBURL)) {
  throw new Error(RESPONSE_MESSAGE.ENV_ERROR);
}

export const toObjectId = (idStr: string): Types.ObjectId => {
  return new Types.ObjectId(idStr);
};

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

export const getFilesCountPipeline = (userId: string, folderId: string): PipelineStage[] => [
  {
    $match: {
      userId: toObjectId(userId),
      "folder._id": toObjectId(folderId)
    }
  },
  { 
    $unwind: "$folder" 
  },
  {
    $match: {
      "folder._id": toObjectId(folderId)
    }
  },
  {
    $project: {
      _id: 0,
      fileCount: { $size: "$folder.files" }
    }
  }
];

export const getFilePipeline = (userId: string, fileId: string): PipelineStage[] => [
  { $unwind: "$folder" },
  { $unwind: "$folder.files" },
  { 
    $match: {
      "userId": toObjectId(userId),
      "folder.files._id": toObjectId(fileId) 
    } 
  },
  { 
    $project: { 
      _id: 0,
      folderId: "$folder._id",
      file: "$folder.files"
    }
  }
];