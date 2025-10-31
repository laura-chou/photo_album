import "dotenv/config";

import { Model, model, Schema, Types } from "mongoose";

import { RESPONSE_MESSAGE } from "../common/constants";
import { isNullOrEmpty } from "../common/utils";


interface Files {
  customName: string;
  storeName: string;
}

interface Folder {
  name: string;
  files: Files[];
}

interface IAlbum {
  userId: Types.ObjectId;
  folder: Folder[];
}

const filesSchema = new Schema<Files>({
  customName: { 
    type: String,
    required: true
  },
  storeName: { 
    type: String,
    required: true
  }
});

const folderSchema = new Schema<Folder>({
  name: {
    type: String,
    required: true
  },
  files: {
    type: [filesSchema],
    default: []
  }
});

const albumSchema = new Schema<IAlbum>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  folder: {
    type: [folderSchema],
    required: true
  }
}, {
  versionKey: false,
  collection: "album"
});

if (isNullOrEmpty(process.env.COLLECTION_ALBUM)) {
  throw new Error(RESPONSE_MESSAGE.ENV_ERROR);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const Album: Model<IAlbum> = model(process.env.COLLECTION_ALBUM!, albumSchema);

export default Album;