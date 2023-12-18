import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ri from "react-icons/ri";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchAnchors, fetchLinks } from "../TextContent";

import {
  refreshState,
  selectedAnchorsState,
  selectedExtentState,
  startAnchorState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  selectedNodeState,
  nodeIdsToNodesMapState,
  selectedRestaurantState,
  nodeIdsToParentIdsMapState,
  goToImageIdState,
} from "../../../../../global/Atoms";
import {
  IAnchor,
  IImageExtent,
  INodeProperty,
  makeINodeProperty,
  IImageNode,
  IRestaurantNode,
} from "../../../../../types";
import "./ImageContent.scss";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FrontendAnchorGateway } from "~/anchors";
import { FrontendNodeGateway } from "~/nodes";

interface ImageContentProps {
  currentNode: IImageNode;
  size: string;
}

/** The content of an image node, including any anchors */
export const ImageContent = (props: ImageContentProps) => {
  const { currentNode, size } = props;
  // anchor & link related state
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);
  const startAnchor = useRecoilValue(startAnchorState);
  const [selectedAnchors, setSelectedAnchors] =
    useRecoilState(selectedAnchorsState);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);
  /**
   * State variable to keep track of the currently selected anchor IDs.
   * Compare with selectedAnchors to update previous state
   */
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);
  // global state
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  const nodeIdsToParentIdsMap = useRecoilValue(nodeIdsToParentIdsMapState);
  const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
  const setGoToImageId = useSetRecoilState(goToImageIdState);
  const refresh = useRecoilValue(refreshState);
  // manipulate image state
  let dragging = false; // Indicated whether we are currently dragging the image
  let currentTop: number; // To store the top of the currently selected region for onMove
  let currentLeft: number; // To store the left of the currently selected region for onMove
  let xSelectionLast: number; // To store the last x for resizing the selection
  let ySelectionLast: number; // To store the last y for resizing the selection
  let isResizing = false; // Indicated whether we are resizing the imageContainer
  // image size and resize related state
  const [curWidth, setCurWidth] = useState(0);
  const [curHeight, setCurHeight] = useState(0);
  const [valueWidth, setValueWidth] = useState(0);
  const [valueHeight, setValueHeight] = useState(0);
  const [metaWidth, setMetaWidth] = useState(0);
  const [metaHeight, setMetaHeight] = useState(0);

  /**
   * useRef EXAMPLE: Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   *
   * // TODO [Editable]: This is the component that we would want to resize
   */
  const imageContainer = useRef<HTMLHeadingElement>(null);
  const selection = useRef<HTMLHeadingElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  /* State variable to keep track of anchors rendered on image */
  const [imageAnchors, setImageAnchors] = useState<JSX.Element[]>([]);
  // Modified: added to keep anchor visible
  // const [anchorVis, setAnchorVis] = useState<JSX.Element[]>([]);

  // *****************************************************************************
  // anchors on image
  const router = useRouter();

  /**
   * Handle click on anchor that is displayed on image
   * Single click: Select the anchor
   * Double click: Navigate to the opposite node
   */
  const handleAnchorSelect = async (e: React.MouseEvent, anchor: IAnchor) => {
    e.stopPropagation();
    e.preventDefault();
    const links = await fetchLinks(anchor.anchorId);
    const anchors = await fetchAnchors(links);
    if (links.length > 0) {
      const anotherNodeId =
        links[0].anchor1Id !== anchor.anchorId
          ? links[0].anchor1NodeId
          : links[0].anchor2NodeId;
      let goToId = anotherNodeId;
      if (anchor.nodeId != goToId) {
        while (nodeIdsToNodesMap.hasOwnProperty(goToId)) {
          goToId = nodeIdsToParentIdsMap[goToId];
        }
        const id = (selectedRestaurant as IRestaurantNode).imageIds.indexOf(
          anotherNodeId
        );
        setGoToImageId(id == -1 ? 0 : id);
        if (goToId != selectedRestaurant.nodeId) {
          router.push(`/${goToId}/`);
          // setSelectedExtent(anchor.extent);
          // setSelectedAnchors(anchors);
        }
      }
    }
  };

  /**
   * This method displays the existing anchors. We are fetching them from
   * the data with a call to FrontendAnchorGateway.getAnchorsByNodeId
   * which returns a list of IAnchors that are on currentNode
   */
  const displayImageAnchors = useCallback(async () => {
    let imageAnchors: IAnchor[];
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode?.nodeId
    );
    if (anchorsFromNode.success) {
      const anchorElementList: JSX.Element[] = [];
      // List of anchor elements to return
      imageAnchors = anchorsFromNode.payload;
      // IAnchor array from FrontendAnchorGateway call
      imageAnchors.forEach((anchor) => {
        // Checking that the extent is of type image to access IImageExtent
        if (anchor.extent?.type == "image") {
          if (
            !(
              startAnchor &&
              startAnchor.extent?.type == "image" &&
              startAnchor == anchor &&
              startAnchor.nodeId == currentNode.nodeId
            )
          ) {
            anchorElementList.push(
              <div
                id={anchor.anchorId}
                key={"image." + anchor.anchorId}
                className="image-anchor"
                onClick={(e) => {
                  handleAnchorSelect(e, anchor);
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                style={{
                  height: anchor.extent.height,
                  left: anchor.extent.left,
                  top: anchor.extent.top,
                  width: anchor.extent.width,
                }}
              />
            );
          }
        }
      });
      if (
        startAnchor &&
        startAnchor.extent?.type == "image" &&
        startAnchor.nodeId == currentNode.nodeId
      ) {
        anchorElementList.push(
          <div
            id={startAnchor.anchorId}
            key={"image.startAnchor" + startAnchor.anchorId}
            className="image-startAnchor"
            style={{
              height: startAnchor.extent.height,
              left: startAnchor.extent.left,
              top: startAnchor.extent.top,
              width: startAnchor.extent.width,
            }}
          />
        );
      }
      setImageAnchors(anchorElementList);
    }

    // display the selected anchors
    selectedAnchorIds.forEach((anchorId) => {
      const prevSelectedAnchor = document.getElementById(anchorId);
      if (prevSelectedAnchor) {
        prevSelectedAnchor.className = "image-anchor";
      }
    });
    if (imageContainer.current) {
      imageContainer.current.style.outline = "";
    }
    const newSelectedAnchorIds: string[] = [];
    selectedAnchors &&
      selectedAnchors.forEach((anchor) => {
        if (anchor) {
          if (anchor.extent === null && imageContainer.current) {
            imageContainer.current.style.outline = "solid 3px blue";
          }
          const anchorElement = document.getElementById(anchor.anchorId);
          if (anchorElement) {
            anchorElement.className = "image-anchor selected";
            newSelectedAnchorIds.push(anchorElement.id);
          }
        }
      });
    setSelectedAnchorIds(newSelectedAnchorIds);
  }, [currentNode, startAnchor, selectedAnchorIds, selectedAnchors]);

  useEffect(() => {
    displayImageAnchors();
  }, [selectedAnchors, currentNode, refresh, startAnchor]);
  // *****************************************************************************
  // Select behavior
  /**
   * To trigger on load and when we setSelectedExtent
   */
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null);
    if (selection.current) {
      selection.current.style.left = "-50px";
      selection.current.style.top = "-50px";
      selection.current.style.width = "0px";
      selection.current.style.height = "0px";
    }
  }, [setSelectedExtent, refresh]);

  /* onSelectionPointerDown initializes the selection */
  const onSelectionPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNode(currentNode);
    dragging = true;
    // The y location of the image top in the browser
    const imageTop = imageContainer.current?.getBoundingClientRect().top;
    // The x location of the image left in the browser
    const imageLeft = imageContainer.current?.getBoundingClientRect().left;

    const x = e.clientX; // The x location of the pointer in the browser
    const y = e.clientY; // The y location of the pointer in the browser
    xSelectionLast = e.clientX;
    ySelectionLast = e.clientY;
    if (selection.current && imageLeft && imageTop) {
      selection.current.style.left = String(x - imageLeft) + "px";
      selection.current.style.top = String(y - imageTop) + "px";
      currentLeft = x - imageLeft;
      currentTop = y - imageTop;
      selection.current.style.width = "0px";
      selection.current.style.height = "0px";
    }
    document.removeEventListener("pointermove", onSelectionPointerMove);
    document.addEventListener("pointermove", onSelectionPointerMove);
    document.removeEventListener("pointerup", onSelectionPointerUp);
    document.addEventListener("pointerup", onSelectionPointerUp);
  };

  /* onMove resizes the selection */
  const onSelectionPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragging) {
      const x = e.clientX; // The x location of the pointer in the browser
      const y = e.clientY; // The y location of the pointer in the browser
      const deltaX = x - xSelectionLast; // The change in the x location
      const deltaY = y - ySelectionLast; // The change in the y location
      xSelectionLast = e.clientX;
      ySelectionLast = e.clientY;

      if (selection.current) {
        const imageTop = imageContainer.current?.getBoundingClientRect().top;
        const imageLeft = imageContainer.current?.getBoundingClientRect().left;
        let left = parseFloat(selection.current.style.left);
        let top = parseFloat(selection.current.style.top);
        let width = parseFloat(selection.current.style.width);
        let height = parseFloat(selection.current.style.height);

        // Horizontal dragging
        // Case A: Dragging above start point
        if (imageLeft && x - imageLeft < currentLeft) {
          width -= deltaX;
          left += deltaX;
          selection.current.style.left = String(left) + "px";
          // Case B: Dragging below start point
        } else {
          width += deltaX;
        }

        // Vertical dragging
        // Case A: Dragging to the left of start point
        if (imageTop && y - imageTop < currentTop) {
          height -= deltaY;
          top += deltaY;
          selection.current.style.top = String(top) + "px";
          // Case B: Dragging to the right of start point
        } else {
          height += deltaY;
        }

        // Update height and width
        selection.current.style.width = String(width) + "px";
        selection.current.style.height = String(height) + "px";
      }
    }
  };

  /**
   * onSelectionPointerUp so we have completed making our selection,
   * therefore we should create a new IImageExtent and
   * update the currently selected extent
   * @param e
   */
  const onSelectionPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = false;
    if (selection.current) {
      currentTop = 0;
      currentLeft = 0;
      const extent: IImageExtent = {
        type: "image",
        height: parseFloat(selection.current.style.height),
        left: parseFloat(selection.current.style.left),
        top: parseFloat(selection.current.style.top),
        width: parseFloat(selection.current.style.width),
      };
      // Check if setSelectedExtent exists, if it does then update it
      if (setSelectedExtent) {
        setSelectedNode(currentNode);
        setSelectedExtent(extent);
      }
    }
    // Remove pointer event listeners
    document.removeEventListener("pointermove", onSelectionPointerMove);
    document.removeEventListener("pointerup", onSelectionPointerUp);
  };

  const onHandleClearSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (setSelectedExtent) {
      setSelectedExtent(null);
      setSelectedNode(selectedRestaurant);
      if (selection.current) {
        // Note: This is a rather hacky solution to hide the selected region
        selection.current.style.left = "-50px";
        selection.current.style.top = "-50px";
        selection.current.style.width = "0px";
        selection.current.style.height = "0px";
      }
    }
  };

  const resizeImage = (e: PointerEvent) => {
    if (isResizing) {
      const node = currentNode as IImageNode;
      const imageTop = imageContainer.current?.getBoundingClientRect().top;
      // The x location of the image left in the browser
      const imageLeft = imageContainer.current?.getBoundingClientRect().left;
      if (imageContainer.current && imageTop && imageLeft) {
        const width = e.clientX - imageLeft;
        const height = e.clientY - imageTop;
        if (width < node.metaWidth) {
          imageContainer.current.style.width = String(width) + "px";
          setCurWidth(width);
          setValueWidth(width);
        }
        if (height < node.metaHeight) {
          imageContainer.current.style.height = String(height) + "px";
          setCurHeight(height);
          setValueHeight(height);
        }
      }
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    document.removeEventListener("pointermove", resizeImage);
    document.addEventListener("pointermove", resizeImage);
    document.removeEventListener("pointerup", stopResizing);
    document.addEventListener("pointerup", stopResizing);
  };

  const stopResizing = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = false;
    document.removeEventListener("pointermove", resizeImage);
    document.removeEventListener("pointerup", stopResizing);
  };

  /* Modified: add to update the image */
  const handleUpdateImage = async () => {
    const properties: INodeProperty[] = [];
    properties.push(makeINodeProperty("curWidth", curWidth));
    properties.push(makeINodeProperty("curHeight", curHeight));
    const imageUpdateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      properties
    );
    if (!imageUpdateResp.success) {
      setAlertIsOpen(true);
      setAlertTitle("Image update failed");
      setAlertMessage(imageUpdateResp.message);
    }
  };

  /* Modified: added to set width when width changes */
  const handleModifyWidth = (val: string, width: number) => {
    setValueWidth(width);
    setCurWidth(width);
  };

  /* Modified: added to setheightwidth when width changes */
  const handleChangeHeight = (val: string, height: number) => {
    setValueHeight(height);
    setCurHeight(height);
  };

  /* Modified: added to handle reset click */
  const handleResetClick = () => {
    setValueWidth(metaWidth);
    setValueHeight(metaHeight);
    setCurWidth(metaWidth);
    setCurHeight(metaHeight);
  };

  /* Modified: added for new initialization of image that can resize node */
  useEffect(() => {
    // if (imageContainer.current) {
    //   imageContainer.current.style.height = String(currentNode.curHeight) + "px";
    //   imageContainer.current.style.width = String(currentNode.curWidth) + "px";
    // }
  }, [currentNode]);

  // /* Modified: added to change current height */
  // useEffect(() => {
  //   if (imageContainer.current) {
  //     imageContainer.current.style.height = String(curHeight) + "px";
  //   }
  // }, [curHeight]);

  // /* Modified: added to change current width */
  // useEffect(() => {
  //   if (imageContainer.current) {
  //     imageContainer.current.style.width = String(curWidth) + "px";
  //   }
  // }, [curWidth]);

  return (
    <div className="imageWrapper">
      <div
        ref={imageContainer}
        onPointerDown={onSelectionPointerDown}
        className="imageContainer"
      >
        {/* <div className="imageResizer" onPointerDown={startResizing} /> */}
        <div className="image">
          {
            <div className="selection" ref={selection}>
              <div
                onClick={onHandleClearSelectionClick}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="selection-close"
              >
                <ri.RiCloseFill />
              </div>
            </div>
          }
          {imageAnchors}
          {/* {anchorVis} */}

          <img
            ref={imgRef}
            style={{ height: size, width: size }}
            src={currentNode?.content}
            alt={currentNode?.title}
          />
        </div>
      </div>
    </div>
  );
};
