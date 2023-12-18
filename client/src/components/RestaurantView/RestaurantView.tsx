import React, { useCallback, useEffect, useRef, useState } from "react";
import { FrontendAnchorGateway } from "../../anchors";
import { generateObjectId } from "../../global";
import { IAnchor, IRestaurantNode, isSameExtent } from "../../types";
import { NodeContent } from "./NodeContent";
import { NodeHeader } from "./NodeHeader";
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import {
  isLinkingState,
  startAnchorState,
  endAnchorState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  selectedNodeState,
  userState
} from "../../global/Atoms";
import "./RestaurantView.scss";

export interface INodeViewProps {
  RestaurantNodes: IRestaurantNode[];
  // handler for completing link
  onCompleteLinkClick: () => void;
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void;
  // handler for deleting currentNode
  onDeleteButtonClick: (node: IRestaurantNode) => void;
}

/** Full page view focused on a node's content, with annotations and links */
export const RestaurantView = (props: INodeViewProps) => {
  const {
    RestaurantNodes,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onDeleteButtonClick
  } = props;

  // global state
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  // link state
  const setIsLinking = useSetRecoilState(isLinkingState);
  // anchor state
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState);
  const [endAnchor, setEndAnchor] = useRecoilState(endAnchorState);
  // extent state
  const selectedExtent = useRecoilValue(selectedExtentState);
  // Node state
  const selectedNode = useRecoilValue(selectedNodeState);
  // User state
  const user = useRecoilValue(userState);

  const handleStartLinkClick = () => {
    if (!user) {
      setAlertIsOpen(true);
      setAlertTitle("Login/Sign In Required");
      setAlertMessage(
        "You need to login/sign in firstly before post any new restaurant"
      )
      return;
    }

    if (selectedNode == null) {
      setAlertIsOpen(true);
      setAlertTitle("No selected node");
      setAlertMessage(
        "You start a link when no node has been selected."
      )

    } else if (selectedExtent === undefined) {
      setAlertIsOpen(true);
      setAlertTitle("Cannot start link from this anchor");
      setAlertMessage(
        "There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors."
      );
    } else {
      const anchor = {
        anchorId: generateObjectId("anchor"),
        extent: selectedExtent,
        nodeId: selectedNode.nodeId,
      };
      setStartAnchor(anchor);
      setIsLinking(true);
    }
  };

  const handleCompleteLinkClick = async () => {
    if (selectedNode == null) {
      setAlertIsOpen(true);
      setAlertTitle("Cannot complete link");
      setAlertMessage(
        "Root folder which shown all restaurants shouldn't be connected."
      );
      return;
    }
    const anchorsByNodeResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      selectedNode.nodeId
    );
    let anchor2: IAnchor | undefined = undefined;
    if (anchorsByNodeResp.success && selectedExtent !== undefined) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor2 = nodeAnchor;
        }
        if (
          startAnchor &&
          isSameExtent(nodeAnchor.extent, startAnchor.extent) &&
          startAnchor.nodeId == selectedNode.nodeId
        ) {
          setStartAnchor(nodeAnchor);
        }
      });
    }
    if (selectedExtent !== undefined) {
      anchor2 = {
        anchorId: generateObjectId("anchor"),
        extent: selectedExtent,
        nodeId: selectedNode.nodeId,
      };
      setEndAnchor(anchor2);
      console.log(startAnchor);
      console.log(endAnchor);
      onCompleteLinkClick();
    }
  };

  // const nodeProperties = useRef<HTMLHeadingElement>(null);
  // const divider = useRef<HTMLHeadingElement>(null);
  // let xLast: number;
  // let dragging = false;

  // const onPointerDown = (e: React.PointerEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   dragging = true;
  //   xLast = e.screenX;
  //   document.removeEventListener("pointermove", onPointerMove);
  //   document.addEventListener("pointermove", onPointerMove);
  //   document.removeEventListener("pointerup", onPointerUp);
  //   document.addEventListener("pointerup", onPointerUp);
  // };

  // const onPointerMove = (e: PointerEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (divider.current) divider.current.style.width = "10px";
  //   if (nodeProperties.current && dragging) {
  //     const nodePropertiesElement = nodeProperties.current;
  //     let width = parseFloat(nodePropertiesElement.style.width);
  //     const deltaX = e.screenX - xLast; // The change in the x location
  //     const newWidth = (width -= deltaX);
  //     if (!(newWidth < 200 || newWidth > 480)) {
  //       nodePropertiesElement.style.width = String(width) + "px";
  //       // nodePropertiesWidth = width;
  //       xLast = e.screenX;
  //     }
  //   }
  // };

  // const onPointerUp = (e: PointerEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   dragging = false;
  //   if (divider.current) divider.current.style.width = "";
  //   document.removeEventListener("pointermove", onPointerMove);
  //   document.removeEventListener("pointerup", onPointerUp);
  // };

  return (
    <div className="node">
      <div className="nodeView" style={{ width: "100%" }}>
        <NodeHeader
          onDeleteButtonClick={onDeleteButtonClick}
          onHandleStartLinkClick={handleStartLinkClick}
          onHandleCompleteLinkClick={handleCompleteLinkClick}
        />
        <div className="nodeView-scrollable">
          <div className="nodeView-content">
            <NodeContent
              RestaurantNodes={RestaurantNodes}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
