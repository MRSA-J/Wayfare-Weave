import React from "react";
import "./RestaurantContent.scss";
import { RestaurantAttribution } from "./RestaurantAttribution/RestaurantAttribution";
import { CommentBoard } from "./CommentBoard";

export const RestaurantContent = () => {
  return (
    <div className="restaurant-content">
      <div className="restaurant-attribution-wrapper">
        <RestaurantAttribution />
      </div>
      <div className="comment-board-wrapper">
        <CommentBoard />
      </div>
    </div>
  );
};
