import { useRecoilValue } from "recoil";
import "./NodeContent.scss";
import {
  selectedCategoriesState,
  selectedRestaurantState,
} from "../../../global/Atoms";

import { IFolderNode, IRestaurantNode } from "../../../types";
import { FolderContent } from "./FolderContent";
import { RestaurantContent } from "./RestaurantContent";
/** Props needed to render any node content */

export interface INodeContentProps {
  RestaurantNodes: IRestaurantNode[];
  onCreateNodeButtonClick: () => void;
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { onCreateNodeButtonClick, RestaurantNodes } = props;
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);
  const selectedCategories = useRecoilValue(selectedCategoriesState);
  if (selectedRestaurant.type != "folder") {
    return <RestaurantContent />;
  } else {
    const selectedRestaurants: IRestaurantNode[] = [];
    RestaurantNodes.forEach((restaurant) => {
      if (restaurant.categories)
        if (
          restaurant.categories.some((category) =>
            selectedCategories.includes(category)
          )
        ) {
          selectedRestaurants.push(restaurant);
        }
    });
    if (selectedRestaurants) {
      return (
        <FolderContent
          node={selectedRestaurant as IFolderNode}
          onCreateNodeButtonClick={onCreateNodeButtonClick}
          RestaurantNodes={selectedRestaurants}
        />
      );
    } else {
      return <div />;
    }
  }
};
