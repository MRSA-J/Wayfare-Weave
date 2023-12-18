import { type } from "os";
import { isSameFilePath } from ".";
import INodePath, { makeINodePath } from "./INodePath";

// nodeTypes returns a string array of the types available
export const nodeTypes: string[] = ["text", "image", "folder", "restaurant", "comment"];

// Supported nodeTypes for file browser
export type NodeType =
  | "text"
  | "image"
  | "folder"
  | "pdf"
  | "audio"
  | "video"
  | "restaurant"
  | "comment";

// INode with node metadata
export interface INode {
  type: NodeType; // type of node that is created
  content: any; // the content of the node
  filePath: INodePath; // unique randomly generated ID which contains the type as a prefix
  nodeId: string; // unique randomly generated ID which contains the type as a prefix
  title: string; // user create node title
  dateCreated?: Date; // date that the node was created
}

export type FolderContentType = "list" | "grid";

export interface IFolderNode extends INode {
  viewType: FolderContentType;
}

// Modified: add IImageNode additional properties for cropping the image
export interface IImageNode extends INode {
  metaHeight: number;
  metaWidth: number;
  curHeight: number;
  curWidth: number;
}

export interface IRestaurantNode extends INode {
  lat: number;
  lng: number;
  imageIds: string[];
  openingTimes: string[];
  closingTimes: string[];
  categories: string[];
  createdBy: string;
}

export interface ICommentNode extends INode {
  commentTo: string;
  createdBy: string;
}

export type NodeFields = keyof INode | keyof IFolderNode | keyof IImageNode | keyof IRestaurantNode; //Modified: add IImageNode

//Modified: add IImageNode's metaheight. metawidth and curheight, curwidth
export const allNodeFields: string[] = [
  "nodeId",
  "title",
  "type",
  "content",
  "filePath",
  "viewType",
  "metaHeight",
  "metaWidth",
  "curHeight",
  "curWidth",
  'categories'
];

// Type declaration for map from nodeId --> INode
export type NodeIdsToNodesMap = { [nodeId: string]: INode };

/**
 * Function that creates an INode given relevant inputs
 * @param nodeId
 * @param path
 * @param children
 * @param type
 * @param title
 * @param content
 * @returns INode object
 */

export function makeINode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any
): INode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "text",
  };
}

export function makeIFolderNode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  viewType?: any
): IFolderNode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "text",
    viewType: viewType ?? "grid",
  };
}

export function isINode(object: any): object is INode {
  const propsDefined: boolean =
    typeof (object as INode).nodeId !== "undefined" &&
    typeof (object as INode).title !== "undefined" &&
    typeof (object as INode).type !== "undefined" &&
    typeof (object as INode).content !== "undefined" &&
    typeof (object as INode).filePath !== "undefined";
  const filePath: INodePath = object.filePath;
  // if both are defined
  if (filePath && propsDefined) {
    for (let i = 0; i < filePath.path.length; i++) {
      if (typeof filePath.path[i] !== "string") {
        return false;
      }
    }
    // check if all fields have the right type
    // and verify if filePath.path is properly defined
    return (
      typeof (object as INode).nodeId === "string" &&
      typeof (object as INode).title === "string" &&
      nodeTypes.includes((object as INode).type) &&
      filePath.path[filePath.path.length - 1] === (object as INode).nodeId
    );
  }
}

export function isIImageNode(object: any): object is IImageNode {
  return isINode(object) && object.type === "image";
}

export function isIRestaurantNode(object: any): object is IRestaurantNode {
  return (
    isINode(object) && 
    object.type === "restaurant" &&
    typeof((object as IRestaurantNode).content) === "string" &&
    typeof((object as IRestaurantNode).lat) === "number" &&
    typeof((object as IRestaurantNode).lng) === "number" &&
    Array.isArray((object as IRestaurantNode).imageIds) &&
    (object as IRestaurantNode).imageIds.every(item => typeof item === 'string') &&
    Array.isArray((object as IRestaurantNode).openingTimes) &&
    (object as IRestaurantNode).openingTimes.length === 7 &&
    (object as IRestaurantNode).openingTimes.every(item => typeof item === 'string') &&
    Array.isArray((object as IRestaurantNode).closingTimes) &&
    (object as IRestaurantNode).closingTimes.length === 7 &&
    (object as IRestaurantNode).closingTimes.every(item => typeof item === 'string') &&
    Array.isArray((object as IRestaurantNode).categories) &&
    ((object as IRestaurantNode).categories).every(item => typeof item === "string") &&
    typeof((object as IRestaurantNode).createdBy) === "string"
  );
}

export function isICommentNode(object: any): object is ICommentNode {
  return isINode(object) && object.type === "comment";
}

export function isSameNode(n1: INode, n2: INode): boolean {
  return (
    n1.nodeId === n2.nodeId &&
    n1.title === n2.title &&
    n1.type === n2.type &&
    n1.content === n2.content &&
    isSameFilePath(n1.filePath, n2.filePath)
  );
}

export interface organizedData {
  restaurants: IRestaurantNode[],
  NodeIdsToNodeMap: NodeIdsToNodesMap
}