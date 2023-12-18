import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { INode, NodeIdsToNodesMap } from "../../../types";
import "./MapModal.scss";
import { FrontendLinkGateway } from "~/links";
import { FrontendAnchorGateway } from "~/anchors";
import { useJsApiLoader } from "@react-google-maps/api";
import { useRecoilValue } from "recoil";
import {
  nodeIdsToNodesMapState,
  selectedRestaurantState,
} from "~/global/Atoms";
import { IRestaurantNode } from "../../../types";
import { useCallback } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { useRouter } from "next/router";
import { FrontendNodeGateway } from "~/nodes";

export interface IMapModalProps {
  isOpen: boolean;
  restaurantNodes: IRestaurantNode[];
  onClose: () => void;
}

//hasn't write anything
//Todo: write
/**
 * Modal for moving a node to a new location
 */
const containerStyle = {
  width: "100%",
  height: "650px",
};

export const MapModal = (props: IMapModalProps) => {
  const { isOpen, restaurantNodes, onClose } = props;
  // state variables
  // const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const selectedRestaurant = useRecoilValue(
    selectedRestaurantState
  ) as IRestaurantNode;

  //default providence lat, lng
  const center = {
    lat: (selectedRestaurant as IRestaurantNode).lat ?? 41.8268,
    lng: (selectedRestaurant as IRestaurantNode).lng ?? -71.4025,
  };
  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(map);
    }
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(null);
    }
  }, []);

  const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
  useEffect(() => {
    if (map) {
      console.log(allRestaurants);
      allRestaurants.map((node) => {
        const url = nodeIdsToNodesMap[node.imageIds[0]]?.content;
        const icon = {
          url: url,
          scaledSize: new google.maps.Size(50, 50),
        };

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(node.lat, node.lng),
          map: map,
          title: node.title,
          icon: icon,
        });

        //make markers clickable and it will open the clicked restaurant node, after x,it will be shown
        marker.addListener("click", () => {
          // console.log(node.nodeId);
          router.push(node.nodeId);
        });
      });
    }
    setLoaded(true);
  }, [map, setMap]);

  //TODO: fill all restaurants
  const allRestaurants: IRestaurantNode[] = restaurantNodes;

  return loaded ? (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent margin={0} rounded="none">
          <ModalHeader>Map</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
              ></GoogleMap>
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  ) : (
    <div>
      <p>failed to loaded</p>
    </div>
  );
};

/*
  //Map
  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      setMap(map);
    }
  }, []);

  //Don't touch this useEffect, otherwise markers won't be rendered
  useEffect(() => {
    setLoaded(true);
  }, [map, setMap]);
  const markerIcon = {
    // url: nodeIdsToNodesMap[selectedRestaurant.imageIds[0]].content
    url: "https://legacyplace.com/wp-content/uploads/sites/12/2022/12/Copy-of-Website-Feature-Image-13.png",
    scaledSize: new google.maps.Size(50, 50),
  };
  const onUnmount = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(null);
    }
  }, []);
  const mapView = () => {
    return isLoaded ? (
      <div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {loaded && (
            <Marker
              position={
                new google.maps.LatLng(
                  selectedRestaurant.lat,
                  selectedRestaurant.lng
                )
              }
              title={selectedRestaurant.title}
              icon={markerIcon}
            />
          )}
        </GoogleMap>
      </div>
    ) : (
      <div>
        <p>failed to loaded</p>
      </div>
    );
  };
  !SECTION*/
