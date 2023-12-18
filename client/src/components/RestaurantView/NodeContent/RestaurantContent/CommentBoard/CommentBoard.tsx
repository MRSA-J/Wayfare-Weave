import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import {
  commentToIdsToCommentIdsMapState,
  nodeIdsToNodesMapState,
  selectedRestaurantState,
} from "~/global/Atoms";
import { InputBox } from "./InputBox";
import "./CommentBoard.scss";
import { CommentBox } from "./CommentBox";
import { TextContent } from "../TextContent";
import { ICommentNode } from "~/types";

interface CommentBlockProps {
  layerId: number;
  parentId: string;
}

const CommentBlock = (props: CommentBlockProps) => {
  const { layerId, parentId } = props;
  const commentToIdsToCommentIdsMap = useRecoilValue(
    commentToIdsToCommentIdsMapState
  );
  if (!commentToIdsToCommentIdsMap.hasOwnProperty(parentId)) {
    return <div />;
  }
  return (
    <div style={layerId > 0 ? { marginLeft: "2px" } : {}}>
      {commentToIdsToCommentIdsMap[parentId].map((childId) => (
        <div key={childId}>
          <div className="top-comment">
            <div className="divide-line-column" />

            <div className="sub-comments">
              <CommentBox currentId={childId} />
              <CommentBlock layerId={layerId + 1} parentId={childId} />
            </div>
          </div>
          {layerId == 0 && <div className="divide-line-row" />}
        </div>
      ))}
    </div>
  );
};

interface CommentBoardProps {}

export const CommentBoard = (props: CommentBoardProps) => {
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);

  return (
    <div className="comments">
      <div className="comment-title">Reviews</div>
      <CommentBlock layerId={0} parentId={selectedRestaurant.nodeId} />
      <InputBox />
    </div>
  );
};
