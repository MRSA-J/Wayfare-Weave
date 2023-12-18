import { CiImageOn } from "react-icons/ci";
import { AiOutlineSend } from "react-icons/ai";
import "./ContentBox.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  commentToIdsToCommentIdsMapState,
  nodeIdsToNodesMapState,
  nodeIdsToParentIdsMapState,
  selectedRestaurantState,
  userState,
} from "~/global/Atoms";
import React, { ReactNode, useRef, ClipboardEvent } from "react";
import { MdCleaningServices } from "react-icons/md";
import { FrontendNodeGateway } from "~/nodes";
import { INode, makeICommentNode, makeIImageNode, makeINode } from "~/types";
import { generateObjectId } from "~/global";
import {
  deleteUploadedElement,
  replaceSelectionPart,
  uploadContents,
} from "./ContentBoxUtils";

interface ContentBoxButtonProps {
  icon: ReactNode;
  clickFunc: () => void;
}
export const ContentBoxButton: React.FC<ContentBoxButtonProps> = ({
  icon,
  clickFunc,
}) => {
  return (
    <div className="icon-wrapper" onClick={clickFunc}>
      {icon}
    </div>
  );
};

interface ContentBoxProps {
  setIsReplying?: React.Dispatch<React.SetStateAction<boolean>>;
  commentTo?: string;
}

export const ContentBox = (props: ContentBoxProps) => {
  const { setIsReplying, commentTo } = props;
  const user = useRecoilValue(userState);
  const divRef = useRef<HTMLDivElement | null>(null);
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);
  const commentToId = commentTo ?? selectedRestaurant.nodeId;
  const setAlertOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  const [nodeIdsToNodesMap, setNodeIdsToNodesMap] = useRecoilState(
    nodeIdsToNodesMapState
  );
  const [nodeIdsToParentIdsMap, setNodeIdsToParentIdsMap] = useRecoilState(
    nodeIdsToParentIdsMapState
  );
  const [commentToIdsToCommentIdsMap, setCommentToIdsToCommentIdsMap] =
    useRecoilState(commentToIdsToCommentIdsMapState);

  const handleInsertImage = () => {
    if (user) {
      const imageUrl = prompt("Enter image URL:");
      if (imageUrl && divRef.current) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Inserted Image";
        img.style.width = "50px";
        img.style.height = "50px";
        divRef.current.appendChild(document.createElement("br"));
        divRef.current.appendChild(img);

        if (divRef.current.lastChild) {
          const secondToLastElement = divRef.current.lastChild.previousSibling;
          if (secondToLastElement) {
            divRef.current.removeChild(secondToLastElement);
          }
        }

        divRef.current.appendChild(document.createElement("br"));
      }
    } else {
      setAlertOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      );
    }
  };

  const handleSendClick = async () => {
    if (user) {
      if (divRef.current) {
        const uploadResp = await uploadContents(
          divRef.current,
          setAlertOpen,
          setAlertTitle,
          setAlertMessage
        );
        if (!uploadResp.success) {
          return;
        }
        const { childrenNodes, commentContent } = uploadResp.payload;
        const commentId = generateObjectId("comment");
        const commentNode = makeICommentNode(
          commentId,
          "comment",
          commentContent,
          commentToId,
          user.name
        );
        const commentUploadResp = await FrontendNodeGateway.createNode(
          commentNode
        );
        if (!commentUploadResp.success) {
          await deleteUploadedElement(
            commentContent,
            { type: "text", value: "comment" },
            setAlertOpen,
            setAlertTitle,
            setAlertMessage
          );
          return;
        }

        // Update nodeIdsToNodesMap & nodeIdsToParentIdsMap
        const newIdsToNodes = { ...nodeIdsToNodesMap };
        const newIdsToParendIds = { ...nodeIdsToParentIdsMap };
        for (let i = 0; i < commentContent.length; i++) {
          newIdsToNodes[commentContent[i]] = childrenNodes[i];
          newIdsToParendIds[commentContent[i]] = commentId;
        }
        newIdsToNodes[commentId] = commentNode;
        newIdsToParendIds[commentId] = commentToId;
        setNodeIdsToNodesMap(newIdsToNodes);
        setNodeIdsToParentIdsMap(newIdsToParendIds);

        // Update commentToIdsToCommentIdsMap
        const newCommentToIdsToCommentIdsMap = {
          ...commentToIdsToCommentIdsMap,
        };
        if (
          newCommentToIdsToCommentIdsMap.hasOwnProperty(
            selectedRestaurant.nodeId
          )
        ) {
          newCommentToIdsToCommentIdsMap[commentToId] = [
            ...newCommentToIdsToCommentIdsMap[selectedRestaurant.nodeId],
            commentId,
          ];
        } else {
          newCommentToIdsToCommentIdsMap[commentToId] = [commentId];
        }

        setCommentToIdsToCommentIdsMap(newCommentToIdsToCommentIdsMap);
        handleClean();
        setIsReplying && setIsReplying(false);
      }
    } else {
      setAlertOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      );
    }
  };

  const handleClean = () => {
    if (user && divRef.current) {
      divRef.current.innerHTML = "";
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (divRef.current) {
      const text = e.clipboardData.getData("text/plain");
      const newElement = document.createElement("span");
      newElement.innerText = text;
      const selection = document.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        // Use divRef to access the contenteditable div
        const div = divRef.current;
        replaceSelectionPart(div, range, text);
      }
    }
  };

  return (
    <div className="input-box-wrapper">
      <div className="input-box-header">
        {user
          ? user.name
          : "Unknow (You need to login/Sign in first for leaving a comment)"}
      </div>
      {/* <div
                className= {user ? "editable-container" :"editable-container-inactivate"} 
                ref={divRef}
                onPaste={handlePaste}
                contentEditable= {user ? "true" : "false"}
            /> */}
      {/* <textarea className="editable-container" /> */}
      <div className="divide-line" />
      <div className="input-box-footer">
        <ContentBoxButton
          icon={<MdCleaningServices />}
          clickFunc={handleClean}
        />
        <ContentBoxButton
          icon={<AiOutlineSend />}
          clickFunc={handleSendClick}
        />
      </div>
    </div>
  );
};
