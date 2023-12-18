import React from "react";
import {
  RiFolderLine,
  RiImageLine,
  RiStickyNoteLine,
  RiVideoLine,
  RiFilePdfLine,
  RiQuestionLine,
} from "react-icons/ri";
import { IoRestaurantOutline } from "react-icons/io5";
import uniqid from "uniqid";
import { NodeType } from "../types";
import { INodePath } from "../types";

export const nodeTypeIcon = (type: NodeType): JSX.Element => {
  switch (type) {
    case "text":
      return <RiStickyNoteLine />;
    case "video":
      return <RiVideoLine />;
    case "folder":
      return <RiFolderLine />;
    case "image":
      return <RiImageLine />;
    case "pdf":
      return <RiFilePdfLine />;
    case "restaurant":
      return <IoRestaurantOutline />;
    default:
      return <RiQuestionLine />;
  }
};

export const pathToString = (filePath: INodePath): string => {
  let urlPath = "";
  if (filePath.path) {
    for (const id of filePath.path) {
      urlPath = urlPath + id + "/";
    }
  }
  return urlPath;
};

/**
 * Helpful for filtering out null and undefined values
 * @example
 * const validNodes = myNodes.filter(isNotNullOrUndefined)
 */
export const isNotNullOrUndefined = (data: any) => {
  return data != null;
};

type hypertextObjectType = NodeType | "link" | "anchor" | "user";

export function generateObjectId(prefix: hypertextObjectType) {
  return uniqid(prefix + ".");
}
