import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { goToImageIdState, nodeIdsToNodesMapState } from "~/global/Atoms";
import "./ImageSlider.scss";
import { ImageContent } from "../ImageContent";
import { IImageNode } from "~/types";

interface ImageSliderProps {
    imageIds: string[];
}
export const ImageSlider = (props: ImageSliderProps) => {
    const { imageIds } = props;
    const goToImageId = useRecoilValue(goToImageIdState);
    const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const goToPrevious = () => {
        const newIndex = (currentIndex - 1 + imageIds.length) % imageIds.length;
        setCurrentIndex(newIndex);
    };
    const goToNext = () => {
        const newIndex = (currentIndex + 1) % imageIds.length;
        setCurrentIndex(newIndex);
    };
    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        setCurrentIndex(goToImageId);
    }, [goToImageId]);

    return (
        <div className="slider-styles">
            <div className="slider-wrapper">
                <div className="arrow-wrapper">
                    <div
                        className="left-arrow-styles" 
                        onClick={goToPrevious}
                    >
                        ❰
                    </div>
                </div>
                    <div
                        className="right-arrow-styles"
                        onClick={goToNext}
                    >
                        ❱
                    </div>
                
                <ImageContent currentNode={nodeIdsToNodesMap[imageIds[currentIndex]] as IImageNode} size={"300px"}/>
                <div className="dots-container-styles">
                    {imageIds.map((_, slideIndex) => (
                    <div
                        className={slideIndex == currentIndex ? "dot-style-active" : "dot-style"}
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                    >
                        ●
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

