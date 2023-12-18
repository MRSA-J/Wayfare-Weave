import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { restaurantNodesState, selectedRestaurantState, userState } from "~/global/Atoms";
import { IRestaurantNode, INodeProperty, makeINodeProperty, INode } from "../../../../../types";
import { lighten } from 'polished';
import { RxCross2 } from "react-icons/rx";
import "./CategoryTags.scss"
import React from 'react';
import { FrontendNodeGateway } from "~/nodes";


export const CategoryTags = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useRecoilState(selectedRestaurantState);
    const [restaurantNodes, setRestaurantNodes] = useRecoilState(restaurantNodesState)
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>("");
    const user = useRecoilValue(userState);


    const getRandomColor = (category: string) => {
        let color = '#';
        const sumOfString: number = category.split('')
          .map(char => char.charCodeAt(0)).
          reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        color += (sumOfString* 12155412).toString(16).slice(-6);
        color = lighten(0.3, color);
        return color;
    };

    const handleAddTag = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (user?.name != (selectedRestaurant as IRestaurantNode).createdBy) {
            return;
        }
        if (event.key === 'Enter' && newTag.length > 0) {
            const existingCategories = (selectedRestaurant as IRestaurantNode).categories;
            if (!existingCategories.includes(newTag)) {
                const updatedNode = {
                    ...selectedRestaurant,
                    categories: [...existingCategories, newTag],
                };
                
                const newRestaurantNodes: IRestaurantNode[] = [];
                restaurantNodes.map((rest) => {
                    if (rest.nodeId != updatedNode.nodeId) {
                        newRestaurantNodes.push(rest)
                    } else {
                        newRestaurantNodes.push(updatedNode as IRestaurantNode);
                    }
                });
                const properties: INodeProperty[] = [];
                // console.log("makeINodeProperty",makeINodeProperty("categories", updatedNode.categories))
                properties.push(makeINodeProperty("categories", updatedNode.categories));
                // console.log("updatedNode.categories",updatedNode.categories)
                // console.log("updatedNode.nodeId",updatedNode.nodeId)
                const updateResponse = await FrontendNodeGateway.updateNode(updatedNode.nodeId, properties);
                if (!updateResponse.success) {
                    console.error('Failed to update node in the backend:', updateResponse.message);
                }
                setSelectedRestaurant(updatedNode);
                setRestaurantNodes(newRestaurantNodes);
                setNewTag("");
            }
        }
    }
    
    const handleDeleteTag = async (tagToDelete: string) => {
        if (user?.name != (selectedRestaurant as IRestaurantNode).createdBy) {
            return;
        }
        const existingCategories = (selectedRestaurant as IRestaurantNode).categories;
        const updatedCategories = existingCategories.filter(tag => tag !== tagToDelete);
        const updatedNode = {
            ...(selectedRestaurant as IRestaurantNode),
            categories: updatedCategories,
        };
        setSelectedRestaurant(updatedNode);
        const properties: INodeProperty[] = [];
        properties.push(makeINodeProperty("categories", updatedNode.categories));
        const updateResponse = await FrontendNodeGateway.updateNode(updatedNode.nodeId, properties);
    
        if (!updateResponse.success) {
            console.error('Failed to update node in the backend:', updateResponse.message);
        }
    }

    return (
        <div className="category-wrapper">
            <div>Tags</div>
            <div className="tags-wrapper">
                {(selectedRestaurant as IRestaurantNode).categories?.map((category: string) => (
                    <div key={category} className="tag-wrapper">
                        <div 
                            style={{backgroundColor: getRandomColor(category)}}
                            onClick={() => {handleDeleteTag(category)}}
                            className="treeView-item"
                        >
                            {category}
                        </div>
                        {(user?.name == (selectedRestaurant as IRestaurantNode).createdBy) && (
                        <div className="delete-tag-button" onClick={() => {handleDeleteTag(category)}}>
                            <RxCross2 />
                        </div>)}
                    </div>
                ))}
            </div>
            {user?.name == (selectedRestaurant as IRestaurantNode).createdBy &&
            <div className="new-tag" onClick={() => {setIsOpen(true)}}>
                + Add tag
            </div>}
            {isOpen && <input 
                className="new-tag-input"
                value={newTag}
                placeholder="new tag ... (press enter to save)"
                onChange={(e) => {setNewTag(e.target.value)}}
                onBlur={() => {setIsOpen(false)}}
                onKeyDown={handleAddTag}
            />}
        </div>
    )
}