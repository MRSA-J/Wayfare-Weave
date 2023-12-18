import { INodePath, makeINodePath } from "./INodePath";

// nodeTypes returns a string array of the types available
export const nodeTypes: string[] = ["text", "image", "folder", "restaurant"];

// Supported nodeTypes for file browser
export type NodeType =
  | "text"
  | "image"
  | "folder"
  | "pdf"
  | "audio"
  | "video"
  | "comment"
  | "restaurant";

/**
 * // TODO [Editable]: Since we want to store new metadata for images we should add
 * new metadata fields to our INode object. There are different ways you can do this.
 *
 * 1. One would be creating a new interface that extends INode.
 * You can have a look at IFolderNode to see how it is done.
 * 2. Another would be to add optional metadata to the INode object itself.
 */

// INode with node metadata
export interface INode {
  type: NodeType; // type of node that is created
  content: any; // the content of the node
  filePath: INodePath; // unique randomly generated ID which contains the type as a prefix
  nodeId: string; // unique randomly generated ID which contains the type as a prefix
  title: string; // user create node title
  dateCreated?: Date; // date that the node was created
  html?: string;
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
  openingTimes: [string, string, string, string, string, string, string];
  closingTimes: [string, string, string, string, string, string, string];
  categories: string[];
  createdBy: string;
}

export interface ICommentNode extends INode {
  commentTo: string;
  createdBy: string;
}

export type NodeFields = keyof INode | keyof IFolderNode | keyof IImageNode | keyof IRestaurantNode; //Modified: add IImageNode

// Type declaration for map from nodeId --> INode
export type NodeIdsToNodesMap = { [nodeId: string]: INode };

export type NodeIdsToParentIdsMap = { [nodeId: string]: string };
export type CommentToIdsToCommentIdsMap = { [nodeId: string]: string[] };


export interface ICommentNode extends INode {
  commentTo: string;
  createdBy: string;
}
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
  nodeId: string,
  path: string[],
  children: string[] = [],
  type: NodeType = "text",
  title: string | null = null,
  content: any = null
): INode {
  return {
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type,
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    dateCreated: new Date()
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

// Modified: added for image cropping
export function makeIImageNode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  metaHeight?: any,
  metaWidth?: any,
  curHeight?: any,
  curWidth?: any
): IImageNode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "image",
    metaHeight: metaHeight ?? "300",
    metaWidth: metaWidth ?? "300",
    curHeight: curHeight ?? metaWidth,
    curWidth: curWidth ?? metaHeight,
    dateCreated: new Date()
  };
}
export function makeIRestaurantNode(
  nodeId: string,
  type: NodeType = "restaurant",
  title: string,
  content: any = null,
  lat: number,
  lng: number,
  imageIds: string[],
  openingTimes: [string, string, string, string, string, string, string],
  closingTimes: [string, string, string, string, string, string, string],
  categories: string[],
  createdBy: string
): IRestaurantNode {
  return {
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type,
    content: content ?? "content" + nodeId,
    filePath: makeINodePath([nodeId], []),
    lat: lat,
    lng: lng,
    imageIds: imageIds,
    openingTimes: openingTimes,
    closingTimes: closingTimes,
    categories: categories,
    createdBy: createdBy,
    dateCreated: new Date()
  }; 
}


export function makeICommentNode(
  nodeId: string,
  type: NodeType = "comment",
  content: string[],
  commentTo: string,
  createdBy: string
): ICommentNode {
  return {
    nodeId: nodeId,
    title: "node" + nodeId,
    type: type,
    content: content,
    filePath: makeINodePath([nodeId], []),
    dateCreated: new Date(),
    commentTo: commentTo,
    createdBy: createdBy
  };
}

export interface organizedData {
  restaurants: IRestaurantNode[],
  NodeIdsToNodeMap: NodeIdsToNodesMap
}