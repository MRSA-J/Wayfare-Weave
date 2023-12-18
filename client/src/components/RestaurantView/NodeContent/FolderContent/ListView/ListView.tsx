import React from "react";
import * as ri from "react-icons/ri";
import { INode, IRestaurantNode } from "../../../../../types";
import "./ListView.scss";
import { ListViewItem } from "./ListViewItem";

export type IViewType = "list" | "grid";

export interface IListViewProps {
  RestaurantNodes: IRestaurantNode[];
  onCreateNodeButtonClick: () => unknown;
}

/** Full page view focused on a node's content, with annotations and links */
export const ListView = (props: IListViewProps) => {
  const { RestaurantNodes, onCreateNodeButtonClick } = props;

  const nodes = RestaurantNodes.map(
    (childNode) =>
      childNode && <ListViewItem key={childNode.nodeId} node={childNode} />
  );

  return (
    <div className={"listView-wrapper"}>
      <div className={"listView-header"}>
        <div></div>
        <div className="text">Title</div>
        <div className="text">Type</div>
        <div className="text">Date created</div>
      </div>
      {nodes}
      <div className="listView-create" onClick={onCreateNodeButtonClick}>
        <ri.RiAddFill />
        <span className="create-text">Create new node</span>
      </div>
    </div>
  );
};