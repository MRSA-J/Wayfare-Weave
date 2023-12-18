import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { generateObjectId } from "../../../global";
import { FrontendNodeGateway } from "../../../nodes";
import {
  INodePath,
  IFolderNode,
  INode,
  makeINodePath,
  NodeIdsToNodesMap,
  NodeType,
  IImageNode,
  IRestaurantNode,
  failureServiceResponse,
  IServiceResponse,
} from "../../../types";
import { fromAddress, setKey, setLanguage } from "react-geocode";

export async function http<T>(request: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await axios(request);
  return response.data;
}

export interface ICreateNodeModalAttributes {
  content: string;
  title: string;
  type: NodeType; // if null, add node as a root
  lat?: number;
  lng?: number;
  imageIds?: string[];
  openingTimes?: [string, string, string, string, string, string, string];
  closingTimes?: [string, string, string, string, string, string, string];
  categories?: string[];
  createdBy?: string;
}

/**
 *
 * The metadata of the image is added. This should be
 * used when the user imports the image / before
 * it gets added into the database
 *
 * @input imageUrl
 * @output An object with the following interface:
 * {
 *    normalizedHeight: number
 *    normalizedWidth: number
 * }
 */
export const getMeta = async (imageUrl: string) => {
  const img = new Image();
  let naturalHeight = 0;
  let naturalWidth = 0;
  let normalizedHeight = 0;
  let normalizedWidth = 0;
  img.src = imageUrl;
  const promise = await new Promise<{
    normalizedHeight: number;
    normalizedWidth: number;
  }>((resolve) => {
    img.addEventListener("load", function () {
      naturalWidth = img.naturalWidth;
      naturalHeight = img.naturalHeight;
      // The height and the width are normalized so that the height will always be 300px
      const mult = 300 / naturalHeight;
      normalizedHeight = mult * naturalHeight;
      normalizedWidth = mult * naturalWidth;
      resolve({
        normalizedHeight: normalizedHeight,
        normalizedWidth: normalizedWidth,
      });
    });
  });
  return {
    normalizedHeight: promise.normalizedHeight,
    normalizedWidth: promise.normalizedWidth,
  };
};

/** Create a new node based on the inputted attributes in the modal */
export async function createNodeFromModal(
  node: IImageNode | IRestaurantNode
): Promise<IServiceResponse<INode>> {
  // Init node
  let newNode = node;
  // set basic attributions
  const nodeId = generateObjectId(node.type);
  // Initial filePath value: create node as a new root
  const filePath: INodePath = makeINodePath([nodeId]);
  newNode = {
    ...newNode,
    dateCreated: new Date(),
    filePath: filePath,
    nodeId: nodeId,
  };
  // TODO [modeified]: processed image attributions
  if (node.type == "image") {
    const image = new Image();
    image.src = node.content;
    const imageLoaded = new Promise<{ height: number; width: number } | null>(
      (resolve) => {
        image.onload = () => {
          resolve({
            width: image.width,
            height: image.height,
          });
        };
        image.onerror = () => {
          resolve(null); // Handle image loading error as needed.
        };
      }
    );
    const imageDimensions = await imageLoaded;
    if (imageDimensions) {
      newNode = {
        ...newNode,
        metaHeight: 300,
        metaWidth: (imageDimensions.width * 300) / imageDimensions.height,
        curHeight: 300,
        curWidth: (imageDimensions.width * 300) / imageDimensions.height,
      };
    } else {
      return failureServiceResponse("Image loading failed."); // Handle the error as needed.
    }
  }
  const nodeResponse = await FrontendNodeGateway.createNode(newNode);
  return nodeResponse;
}

export const uploadImage = async (file: any): Promise<string> => {
  // begin file upload
  console.log("Uploading file to Imgur..");

  // using key for imgur API
  const apiUrl = "https://api.imgur.com/3/image";
  const apiKey = "f18e19d8cb9a1f0";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const data: any = await http({
      data: formData,
      headers: {
        Accept: "application/json",
        Authorization: "Client-ID " + apiKey,
      },
      method: "POST",
      url: apiUrl,
    });
    return data.data.link;
  } catch (exception) {
    return "Image was not uploaded";
  }
};
