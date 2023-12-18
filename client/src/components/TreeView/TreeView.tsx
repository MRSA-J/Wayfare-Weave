import React, { useEffect, useState } from "react";
import { IRestaurantNode } from "../../types";
import { lighten } from 'polished';
import { BsFilterCircleFill, BsFilterCircle } from "react-icons/bs";
import "./TreeView.scss";
import { useRecoilState } from "recoil";
import { selectedCategoriesState } from "~/global/Atoms";

export interface ITreeViewProps {
  restaurants: IRestaurantNode[];
}

export const TreeView = (props: ITreeViewProps) => {
  const { restaurants } = props;
  const [selectedCategories, setSelectedCategories] = useRecoilState(selectedCategoriesState);
  const [categories, setCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allCategories: Set<string> = new Set();
    restaurants.forEach((restaurant: IRestaurantNode) => {
      restaurant.categories.forEach((category: string) => {
        allCategories.add(category);
      });
    });
    setCategories(allCategories);
    setSelectedCategories(Array.from(allCategories));
  }, [restaurants]);
  
  
  // Function to generate a random color
  const getRandomColor = (category: string) => {
    let color = '#';
    const sumOfString: number = category.split('')
      .map(char => char.charCodeAt(0)).
      reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    color += (sumOfString* 12155412).toString(16).slice(-6);
    color = lighten(0.3, color);
    return color;
  };

  const handleCategoryClick = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category))
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  }
  
  return (
    <div className="treeView-wrapper">
        {selectedCategories.length === categories.size ? (
          <div className="title" onClick={() => setSelectedCategories([])}>    
            <BsFilterCircleFill />
            <div className="text">
              Select All ✔
            </div>
          </div>
        ):(
          <div className="title" onClick={() => setSelectedCategories(Array.from(categories))}>
            <BsFilterCircle />
            <div className="text">
              Select All ?
            </div>
          </div>
        )}
      
      <div className="categories-wrapper">
        {Array.from(categories).map((category: string, i) => (
          <div
            key={i}
            className={selectedCategories.includes(category) ? "treeView-item-select" : "treeView-item"} 
            style={{backgroundColor: getRandomColor(category)}}
            onClick={() => {handleCategoryClick(category)}}
          >
            {category}
          </div>
        ))}
      </div>
      
    </div>
  );
};
