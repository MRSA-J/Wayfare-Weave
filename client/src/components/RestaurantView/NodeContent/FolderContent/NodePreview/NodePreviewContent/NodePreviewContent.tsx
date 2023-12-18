import React from "react";
import { IRestaurantNode, NodeType } from "../../../../../../types";
import "./NodePreviewContent.scss";
import { IRestaurantPreviewContent } from "./RestaurantPreviewContent";

/** Props needed to render any node content */
export interface INodeContentPreviewProps {
  node: IRestaurantNode;
  type: NodeType;
}

export const NodePreviewContent = (props: INodeContentPreviewProps) => {
  const { type, node } = props;
  switch (type) {
    case "restaurant":
      return <IRestaurantPreviewContent imageIds={node.imageIds}/>;
    default:
      return null;
  }
};
