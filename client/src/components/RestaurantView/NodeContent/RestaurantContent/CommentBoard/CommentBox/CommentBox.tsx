import { ICommentNode, IImageNode, INode, IRestaurantNode } from "~/types";
import "./CommentBox.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  commentToIdsToCommentIdsMapState,
  isAppLoadedState,
  nodeIdsToNodesMapState,
  nodeIdsToParentIdsMapState,
  refreshState,
  selectedRestaurantState,
  userState,
} from "~/global/Atoms";
import { TextContent } from "../../TextContent";
import { ImageContent } from "../../ImageContent";
import React, { ReactNode, useEffect, useState } from "react";
import { FaReply } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { InputBox } from "../InputBox";
import { FrontendNodeGateway } from "~/nodes";
import { CommentContent } from "./CommentContent";

interface CommentBoxButtonProps {
  icon: ReactNode;
  clickFunc: () => void;
}
export const CommentBoxButton: React.FC<CommentBoxButtonProps> = ({
  icon,
  clickFunc,
}) => {
  return (
    <div className="icon-wrapper" onClick={clickFunc}>
      {icon}
    </div>
  );
};

interface CommentBoxProps {
  currentId: string;
}

export const CommentBox = (props: CommentBoxProps) => {
  const { currentId } = props;
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const user = useRecoilValue(userState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const setIsAppLoaded = useSetRecoilState(isAppLoadedState);
  const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
  const setAlertOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  const currentNode = nodeIdsToNodesMap[currentId] as ICommentNode;

  const handleReplyClick = () => {
    if (user) {
      setIsReplying(true);
    } else {
      setAlertOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      );
    }
  };

  const handleEditingClick = () => {
    if (user) {
      setIsEditing(true);
    } else {
      setAlertOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      );
    }
  };

  const handleDeleteClick = async () => {
    if (user && user.name == currentNode.createdBy) {
      setIsAppLoaded(true);
      for (const id of currentNode.content) {
        const deleteContentResp = await FrontendNodeGateway.deleteNode(id);
        if (!deleteContentResp.success) {
          setAlertOpen(true);
          setAlertTitle("Fail to delete comment");
          setAlertMessage("Delete comment content unsuccessfully");
          return;
        }
      }
      const deleteCommentResp = await FrontendNodeGateway.deleteNode(currentId);
      if (!deleteCommentResp.success) {
        setAlertOpen(true);
        setAlertTitle("Fail to delete comment");
        setAlertMessage("Delete comment node unsuccessfully");
        return;
      }

      setRefresh(!refresh);
    } else {
      setAlertOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      );
    }
  };

  useEffect(() => {
    if (!user) {
      setIsReplying(false);
    }
  }, [user]);

  return (
    <div>
      <div className="comment-content-wrapper">
        <div className="comment-box-header">
          <div className="user-wrapper">
            <div className="user-name">{currentNode.createdBy}</div>
            {nodeIdsToNodesMap.hasOwnProperty(currentNode.commentTo) && (
              <div className="reply-to">
                @
                {
                  (nodeIdsToNodesMap[currentNode.commentTo] as ICommentNode)
                    .createdBy
                }
              </div>
            )}
          </div>

          <div className="create-at">
            Created At {currentNode.dateCreated?.toString()}
          </div>
        </div>
        {currentNode.content.map((contentId: string) => {
          return (
            <div className="content-wrapper" key={contentId}>
              <CommentContent
                contentNode={nodeIdsToNodesMap[contentId]}
                editeState={isEditing}
                setIsEditing={setIsEditing}
              />
            </div>
          );
        })}
        <div className="comment-box-footer">
          <CommentBoxButton icon={<FaReply />} clickFunc={handleReplyClick} />
          {user && user.name === currentNode.createdBy ? (
            <CommentBoxButton
              icon={<CiEdit />}
              clickFunc={handleEditingClick}
            />
          ) : (
            <div />
          )}
          {user && user.name === currentNode.createdBy ? (
            <CommentBoxButton
              icon={<MdDeleteForever />}
              clickFunc={handleDeleteClick}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
      {isReplying && (
        <div className="reply-wrapper">
          <InputBox
            setIsReplying={setIsReplying}
            commentTo={currentNode.nodeId}
          />
        </div>
      )}
    </div>
  );
};
