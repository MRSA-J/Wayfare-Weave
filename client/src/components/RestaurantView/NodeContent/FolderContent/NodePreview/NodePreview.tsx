import React from "react";
import Link from "next/link";
import { nodeTypeIcon, pathToString } from "../../../../../global";
import { IRestaurantNode } from "../../../../../types";
import "./NodePreview.scss";
import { NodePreviewContent } from "./NodePreviewContent";
import { useSetRecoilState } from "recoil";
import { selectedNodeState, selectedRestaurantState } from "../../../../../global/Atoms";

export interface INodePreviewProps {
  restaurant: IRestaurantNode;
}
// Doing Here
/** Full page view focused on a node's content, with annotations and links */
export const NodePreview = (props: INodePreviewProps) => {
  const { restaurant } = props;
  const { type, title } = restaurant;
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  const setSelectedRestaurant = useSetRecoilState(selectedRestaurantState);
  return (
    <Link href={`/${restaurant.nodeId}`}>
      <div
        className={"grid-nodePreview"}
        onClick={() => {
          setSelectedNode(restaurant)
          setSelectedRestaurant(restaurant);
        }}
      >
        <div className="content-preview">
          <NodePreviewContent type={type} node={restaurant} />
        </div>
        <div className="node-info">
          <div className="info-container">
            <div className="main-info">
              {nodeTypeIcon(restaurant.type)}
              <div className="title">{title}</div>
            </div>
            <div className="sub-info">
              {restaurant.dateCreated && (
                <div className="dateCreated">
                  {"Created on " +
                    new Date(restaurant.dateCreated).toLocaleDateString("en-US")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
