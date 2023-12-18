import React from "react";
import { IRestaurantNode } from "../../../../../types";
import { NodePreview } from "../NodePreview";
import "./GridView.scss";
import * as ri from "react-icons/ri";

export interface IGridViewProps {
  RestaurantNodes: IRestaurantNode[];
  onCreateNodeButtonClick: () => void;
}

/** Full page view focused on a node's content, with annotations and links */
export const GridView = (props: IGridViewProps) => {
  const { RestaurantNodes, onCreateNodeButtonClick } = props;

  const nodePreviews = RestaurantNodes.map(
    (restaurant: IRestaurantNode) =>
      (<NodePreview 
        restaurant={restaurant} 
        key={restaurant.nodeId} 
      />)
  );

  return (
    <div className={"gridView-wrapper"}>
      {nodePreviews}
      <div className="grid-newNode" onClick={onCreateNodeButtonClick}>
        <ri.RiAddFill />
      </div>
    </div>
  );
};
