import React, { useEffect } from "react";
import "./RestaurantPreviewContent.scss";
import { useRecoilValue } from "recoil";
import { nodeIdsToNodesMapState } from "~/global/Atoms";

interface IRestaurantPreviewProps {
  imageIds: string[];
}

/** The content of an image node, including any anchors */
export const IRestaurantPreviewContent = (props: IRestaurantPreviewProps) => {
  const { imageIds } = props;
  const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
  /**
   * Return the preview container if we are rendering an image preview
   */
  return Object.keys(nodeIdsToNodesMap).includes(imageIds[0]) ? (
    <div className="imageContent-preview">
      <img src={nodeIdsToNodesMap[imageIds[0]].content} alt="" />
    </div>
  ) : (
    <div />
  );
};
