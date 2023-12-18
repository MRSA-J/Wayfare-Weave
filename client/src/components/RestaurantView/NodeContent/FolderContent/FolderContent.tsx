import React, { useEffect, useCallback } from "react";
import { FolderContentType, IFolderNode, INode, IRestaurantNode, RecursiveNodeTree } from "../../../../types";
import "./FolderContent.scss";
import { GridView } from "./GridView";
import { ListView } from "./ListView";
import { useSetRecoilState } from "recoil";
import { selectedExtentState } from "../../../../global/Atoms";

export interface IFolderContentProps {
  node: IFolderNode;
  onCreateNodeButtonClick: () => unknown;
  RestaurantNodes: IRestaurantNode[];
  viewType?: FolderContentType;
}

/** Full page view focused on a node's content, with annotations and links */
export const FolderContent = (props: IFolderContentProps) => {
  const { node, RestaurantNodes, onCreateNodeButtonClick } = props;
  const setSelectedExtent = useSetRecoilState(selectedExtentState);

  // useEffect
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null);
  }, []);

  const handleSetView = useCallback(() => {
    let nodes;
    switch ((node as IFolderNode).viewType) {
      case "grid":
        nodes = (
          <GridView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            RestaurantNodes={RestaurantNodes}
          />
        );
        break;
      case "list":
        nodes = (
          <ListView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            RestaurantNodes={RestaurantNodes}
          />
        );
        break;
      default:
        nodes = null;
        break;
    }
    return nodes;
  }, [RestaurantNodes]);

  useEffect(() => {
    handleSetView();
  }, [node.viewType, handleSetView]);

  return <div className="fullWidthFolder">{handleSetView()}</div>;
};
