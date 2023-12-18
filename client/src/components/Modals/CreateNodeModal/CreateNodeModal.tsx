import {
  Box,
  Input,
  InputAddon,
  List,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useRef } from "react";
import React, { useState, useEffect, ChangeEvent } from "react";
import {
  IImageNode,
  IRestaurantNode,
  NodeIdsToNodesMap,
  makeIImageNode,
  makeIRestaurantNode,
} from "../../../types";
import { Button } from "../../Button";
import { darken, lighten } from "polished";
import "./CreateNodeModal.scss";
import { createNodeFromModal } from "./createNodeUtils";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  nodeIdsToNodesMapState,
  nodeIdsToParentIdsMapState,
  refreshState,
  selectedNodeState,
  selectedRestaurantState,
  userState,
} from "../../../global/Atoms";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { RestaurantImages } from "./RestaurantImages";
import { FrontendMapGateway } from "~/maps/FrontendMapGateway";
export interface ICreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNeedDeleteImages: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: () => unknown;
}

const defaultRestaurant: IRestaurantNode = makeIRestaurantNode(
  "",
  "restaurant",
  "",
  "",
  0,
  0,
  [],
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  [],
  ""
  // new Date()
);

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateNodeModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, setNeedDeleteImages, onSubmit } = props;
  // alter state
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  // user state
  const user = useRecoilValue(userState);
  if (!user && isOpen) {
    onClose();
    setAlertIsOpen(true);
    setAlertTitle("Login/Sign In Required");
    setAlertMessage(
      "You need to login/sign in firstly before post any new restaurant"
    );
  }
  const inputRef = useRef<HTMLInputElement | null>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const options = {
    fields: ["formatted_address", "establishment"],
    strictBounds: false,
  };
  useEffect(() => {
    if (inputRef.current && !serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
  }, [inputRef, isOpen]);

  // new restaurant to be post
  const [newRestaurant, setNewRestaurant] =
    useState<IRestaurantNode>(defaultRestaurant);
  // attributions of new restaurant
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  // selected state
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  const setSelectedRestaurant = useSetRecoilState(selectedRestaurantState);
  const [error, setError] = useState<string>("");
  // NodeIdToNodeMap
  const [nodeIdsToNodesMap, setNodeIdsToNodesMap] = useRecoilState(
    nodeIdsToNodesMapState
  );
  const [nodeIdsToParentIdsMap, setNodeIdsToParentIdsMap] = useRecoilState(
    nodeIdsToParentIdsMapState
  );
  // Map attribution
  type sevenStrings = [string, string, string, string, string, string, string];
  const [openingTimes, setOpeningTimes] = useState<sevenStrings>(
    defaultRestaurant.openingTimes
  );
  const [closingTimes, setClosingTimes] = useState<sevenStrings>(
    defaultRestaurant.closingTimes
  );
  const [address, setAddress] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  // category state
  const [category, setCategory] = useState<string>("");
  const [hoverTag, setHoverTag] = useState<string | null>(null);
  // event handlers for the modal inputs
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRestaurant({
      ...newRestaurant,
      title: e.target.value,
    });
    setError("");
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRestaurant({
      ...newRestaurant,
      content: e.target.value,
    });
    setError("");
  };

  const handleNewImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value);
  };

  const handleAddNewImageToRestaurant = async () => {
    let imageNode: IImageNode = makeIImageNode(
      "",
      "",
      "",
      "image",
      "image",
      newImageUrl,
      "",
      "",
      "",
      ""
    );
    const createImageResp = await createNodeFromModal(imageNode);
    if (!createImageResp.success) {
      setError(createImageResp.message);
      return;
    }
    imageNode = createImageResp.payload as IImageNode;
    setNodeIdsToNodesMap({
      ...nodeIdsToNodesMap,
      [imageNode.nodeId]: imageNode,
    });
    setNewRestaurant({
      ...newRestaurant,
      imageIds: [...newRestaurant.imageIds, imageNode.nodeId],
    });
    setNewImageUrl("");
  };

  //
  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    isOpenTime: boolean
  ) => {
    if (isOpenTime) {
      const newTime: sevenStrings = [...openingTimes];
      newTime[id] = e.target.value;
      console.log(newTime);
      setOpeningTimes(newTime);
    } else {
      const newTime: sevenStrings = [...closingTimes];
      newTime[id] = e.target.value;
      setClosingTimes(newTime);
    }
  };

  const handleMapInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    getPrediction();
  };

  const handleCategoryEnterDown = (e: { key: string }) => {
    if (e.key == "Enter") {
      if (newRestaurant.categories.includes(category)) {
        setError("tag already exists");
      } else {
        setNewRestaurant({
          ...newRestaurant,
          categories: [...newRestaurant.categories, category],
        });
      }
      setCategory("");
    }
  };

  // Function to generate a random color
  const getRandomColor = (category: string) => {
    let color = "#";
    const sumOfString: number = category
      .split("")
      .map((char) => char.charCodeAt(0))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    color += (sumOfString * 12155412).toString(16).slice(-6);
    if (category == hoverTag) {
      color = lighten(0.15, color);
    } else {
      color = lighten(0.3, color);
    }

    return color;
  };

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    if (newRestaurant.title.length === 0) {
      setError("Error: No title");
      return;
    }

    const getLocationResp = await FrontendMapGateway.getLocation(address);
    if (!getLocationResp.success) {
      setError(getLocationResp.message);
      return;
    }

    if (!user) {
      return;
    }
    let restaurantNode = {
      ...newRestaurant,
      openingTimes: openingTimes,
      closingTimes: closingTimes,
      lat: getLocationResp.payload.lat,
      lng: getLocationResp.payload.lng,
      createdBy: user.name,
    };
    const nodeResp = await createNodeFromModal(restaurantNode);
    if (nodeResp.success) {
      restaurantNode = nodeResp.payload as IRestaurantNode;
      for (const id of restaurantNode.imageIds) {
        setNodeIdsToParentIdsMap({
          ...nodeIdsToParentIdsMap,
          [id]: restaurantNode.nodeId,
        });
      }
      setSelectedNode(restaurantNode);
      setSelectedRestaurant(restaurantNode);
    }
    setNeedDeleteImages([]);
    setNewRestaurant(defaultRestaurant);
    setNewImageUrl("");
    setError("");
    setAddress("");
    setIsTyping(false);
    setOpeningTimes(defaultRestaurant.openingTimes);
    setClosingTimes(defaultRestaurant.closingTimes);
    setCategory("");
    setHoverTag(null);
    onSubmit();
    onClose();
  };

  /** Reset all our state variables and close the modal */

  const handleClose = () => {
    setNeedDeleteImages([]);
    setNewRestaurant(defaultRestaurant);
    setNewImageUrl("");
    setError("");
    setAddress("");
    setIsTyping(false);
    setCategory("");
    setHoverTag(null);
    onClose();
  };

  const [predictions, setPredictions] = useState<string[]>([]);
  const getPrediction = () => {
    setInterval(() => {
      if (inputRef.current && serviceRef.current) {
        serviceRef.current?.getPlacePredictions(
          { input: inputRef.current.value },
          (results) => {
            const addresses: string[] = [];
            results?.map((result) => {
              addresses.push(result.description);
            });
            setPredictions(addresses);
          }
        );
      }
    }, 10);
  }
  

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={"3xl"}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Post a new restaurant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={newRestaurant?.title}
              type="text"
              onChange={handleTitleChange}
              placeholder="Restaurant name..."
            />
            <div className="modal-input">
              <Input
                value={newRestaurant?.content}
                onChange={handleContentChange}
                placeholder={"Description ..."}
              />
            </div>

            <div className="time-wrapper">
              <label className="time-title">Opening time:</label>
              <div className="time-input-wrapper">
                {["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"].map(
                  (day, id) => (
                    <div key={day} className="timer">
                      <Input
                        value={openingTimes[id]}
                        onChange={(e) => {
                          handleTimeChange(e, id, true);
                        }}
                        placeholder={day + "..."}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="time-wrapper">
              <label className="time-title">Closing time:</label>
              <div className="time-input-wrapper">
                {["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"].map(
                  (day, id) => (
                    <div key={day} className="timer">
                      <Input
                        value={closingTimes[id]}
                        onChange={(e) => {
                          handleTimeChange(e, id, false);
                        }}
                        placeholder={day + "..."}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="modal-input">
              <RestaurantImages
                imageIds={newRestaurant.imageIds}
                removeImageId={(id: string) => {
                  setNewRestaurant({
                    ...newRestaurant,
                    imageIds: [
                      ...newRestaurant.imageIds.filter((imageId) => {
                        return imageId != id;
                      }),
                    ],
                  });
                }}
              />
              <div className="image-input">
                <Input
                  value={newImageUrl}
                  onChange={handleNewImageUrlChange}
                  placeholder={"Image url..."}
                />
                <div
                  className="input-button"
                  onClick={handleAddNewImageToRestaurant}
                >
                  add
                </div>
              </div>
            </div>

            <div className="modal-input">
              <Input
                ref={inputRef}
                onChange={handleMapInputChange}
                isDisabled={!serviceRef.current}
                placeholder={
                  serviceRef.current
                    ? "Address..."
                    : "The service seems to have failed to load properly. Please close and try again"
                }
                value={address}
                onClick={() => setIsTyping(true)}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    setIsTyping(false);
                  }
                }}
              />
              {isTyping && (
                <div className="results-list">
                  {predictions.map((item, index) => (
                    <div
                      key={index}
                      className="search-result"
                      onClick={() => {
                        setIsTyping(false);
                        setAddress(item);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-input">
              <Input
                placeholder="Category... (Press enter to add)"
                value={category}
                onKeyDown={handleCategoryEnterDown}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              />
              {newRestaurant.categories.length > 0 && (
                <div className="tag-wrapper">
                  Click to remove:
                  {newRestaurant.categories.map((tag) => (
                    <div
                      key={tag}
                      className="tag"
                      style={{ backgroundColor: getRandomColor(tag) }}
                      onClick={() => {
                        setNewRestaurant({
                          ...newRestaurant,
                          categories: newRestaurant.categories.filter(
                            (category) => category != tag
                          ),
                        });
                      }}
                      onMouseEnter={() => {
                        setHoverTag(tag);
                      }}
                      onMouseLeave={() => {
                        setHoverTag(null);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
