import { SetterOrUpdater } from "recoil";
import { generateObjectId } from "~/global";
import { FrontendNodeGateway } from "~/nodes";
import {
  INode,
  IServiceResponse,
  failureServiceResponse,
  makeIImageNode,
  makeINode,
  successfulServiceResponse,
} from "~/types";
// import natural from 'natural';

export const getDivContent = (node: HTMLDivElement) => {
  type ElementArr = Array<{ type: "text" | "image"; value: string }>;
  const arr: ElementArr = [];
  const readDivElement = (node: HTMLDivElement) => {
    arr.push({ type: "text", value: "" });
    node.childNodes.forEach((subnode) => {
      switch (subnode.nodeName) {
        case "#text":
        case "SPAN":
          if (subnode.textContent) {
            if (arr[arr.length - 1].type == "text") {
              arr[arr.length - 1].value += subnode.textContent;
            } else {
              arr.push({ type: "text", value: subnode.textContent });
            }
          }
          break;
        case "IMG":
          arr.push({ type: "image", value: (subnode as HTMLImageElement).src });
          break;
        case "BR":
          if (
            arr[arr.length - 1].type == "text" &&
            arr[arr.length - 1].value.length > 0
          ) {
            arr.push({ type: "text", value: "" });
          }
          break;
        case "DIV":
          readDivElement(subnode as HTMLDivElement);
          break;
      }
    });
  };
  readDivElement(node);
  while (
    arr.length > 0 &&
    arr[arr.length - 1].type === "text" &&
    arr[arr.length - 1].value === ""
  ) {
    arr.pop();
  }
  return arr;
};

export const deleteUploadedElement = async (
  nodeIds: string[],
  item: { type: "text" | "image"; value: string },
  setAlertOpen: SetterOrUpdater<boolean>,
  setAlertTitle: SetterOrUpdater<string>,
  setAlertMessage: SetterOrUpdater<string>
) => {
  setAlertOpen(true);
  setAlertTitle("Comment upload failed");
  setAlertMessage(
    "Unsuccessfully post your comment with item:\n" + JSON.stringify(item)
  );
  for (const id of nodeIds) {
    const deleteResp = await FrontendNodeGateway.deleteNode(id);
    if (!deleteResp.success) {
      setAlertOpen(true);
      setAlertTitle("Comment upload failed & Cannot clean all!");
      setAlertMessage(
        "Unsuccessfully post your comment. And get an error when delete uploaded nodes."
      );
    }
  }
};

type uploadContentsProps = { childrenNodes: INode[]; commentContent: string[] };

export const uploadContents = async (
  divRefCurrent: HTMLDivElement,
  setAlertOpen: SetterOrUpdater<boolean>,
  setAlertTitle: SetterOrUpdater<string>,
  setAlertMessage: SetterOrUpdater<string>
): Promise<IServiceResponse<uploadContentsProps>> => {
  const newContent = getDivContent(divRefCurrent);
  const commentContent: string[] = [];
  const childrenNodes: INode[] = [];
  for (const item of newContent) {
    if (item.type == "text") {
      const nodeId = generateObjectId("text");
      const textNode = makeINode(
        nodeId,
        [nodeId],
        [],
        "text",
        "comment-text",
        item.value
      );
      const textUploadResp = await FrontendNodeGateway.createNode(textNode);
      if (!textUploadResp.success) {
        await deleteUploadedElement(
          commentContent,
          item,
          setAlertOpen,
          setAlertTitle,
          setAlertMessage
        );
        return failureServiceResponse("No successful at text");
      }
      childrenNodes.push(textNode);
      commentContent.push(nodeId);
    } else if (item.type == "image") {
      const nodeId = generateObjectId("image");
      const imageNode = makeIImageNode(
        nodeId,
        [nodeId],
        [],
        "image",
        "comment-image",
        item.value,
        50,
        50,
        50,
        50
      );
      const imageUploadResp = await FrontendNodeGateway.createNode(imageNode);
      if (!imageUploadResp.success) {
        await deleteUploadedElement(
          commentContent,
          item,
          setAlertOpen,
          setAlertTitle,
          setAlertMessage
        );
        return failureServiceResponse("No successful at image");
      }
      childrenNodes.push(imageNode);
      commentContent.push(nodeId);
    }
  }
  return successfulServiceResponse({ childrenNodes, commentContent });
};

interface NodeInfo {
  startNode: Node | null;
  endNode: Node | null;
  modifiedContent: string | null;
}

const addNewContent = (
  needDelete: boolean,
  curNodeElem: ChildNode,
  newElement: HTMLElement
) => {
  if (!needDelete) {
  }
};

const addElementAfter = (node: ChildNode, newElement: HTMLElement) => {
  if (node.parentNode) {
    if (node.nextSibling) {
      node.parentNode.insertBefore(newElement, node.nextSibling);
      console.log(node.parentNode);
    } else {
      node.parentNode.appendChild(newElement);
      console.log(node.parentNode);
    }
  }
};

// function calculateSimilarity(str1: string, str2: string): number {
//     const levenshteinDistance = natural.LevenshteinDistance;
//     const distance = levenshteinDistance(str1, str2);
//     const maxLength = Math.max(str1.length, str2.length);
//     const similarity = 1 - distance / maxLength;
//     return similarity;
// }

export const replaceSelectionPart = (
  div: HTMLDivElement,
  range: Range,
  text: string
) => {
  const serializer = new XMLSerializer();
  const oriHTML = div.innerHTML;

  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(div);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  let partBeforeSelect = serializer.serializeToString(
    preSelectionRange.cloneContents()
  );
  partBeforeSelect = partBeforeSelect.replace(
    / xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g,
    ""
  );

  let selectedPart = serializer.serializeToString(range.cloneContents());
  selectedPart = selectedPart.replace(
    / xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g,
    ""
  );

  const afterSelectionRange = range.cloneRange();
  afterSelectionRange.selectNodeContents(div);
  afterSelectionRange.setStart(range.endContainer, range.endOffset);
  let partAfterSelect = serializer.serializeToString(
    afterSelectionRange.cloneContents()
  );
  partAfterSelect = partAfterSelect.replace(
    / xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g,
    ""
  );

  let startId = 0;
  for (const char of partBeforeSelect) {
    if (char == oriHTML[startId]) {
      startId++;
    }
  }

  let endId = startId;
  for (const char of selectedPart) {
    if (char == selectedPart[endId]) {
      endId++;
    }
  }

  console.log(oriHTML);
  console.log("");
  console.log(partBeforeSelect);
  console.log(oriHTML.substring(0, startId));
  console.log("");
  console.log(selectedPart);
  console.log(oriHTML.substring(startId, endId));
  console.log("");
  console.log(partAfterSelect);
  console.log(oriHTML.substring(endId));

  // let newHTML = partBeforeSelect + selectedPart + partAfterSelect;
  // if (newHTML.length - oriHTML.length > 10) {
  //     // one part add <div></div>
  //     const longer = newHTML.length - oriHTML.length;
  //     // newHTML = partBeforeSelect

  //     console.log(longer)
  // } else if (newHTML.length - oriHTML.length > 20) {
  //     console.log(partBeforeSelect.substring(0, partBeforeSelect.length-5) + text + partAfterSelect.substring(6));
  // }
};
