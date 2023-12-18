import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import {
  nodeIdsToNodesMapState,
  selectedRestaurantState,
} from "~/global/Atoms";
import "./RestaurantAttribution.scss";
import { IRestaurantNode } from "~/types";

import {
  GoogleMap,
  GoogleMapProps,
  Marker,
  MarkerProps,
  useJsApiLoader,
} from "@react-google-maps/api";
import { ImageSlider } from "../ImageSlider";
import { CategoryTags } from "../CategoryTags";

interface RestaurantAttributionProps {}

interface ImageAtt {
  original: string;
  sizes: string;
}

/** The content of an text node, including all its anchors */
const containerStyle = {
  width: "400px",
  height: "400px",
};

export const RestaurantAttribution = (props: RestaurantAttributionProps) => {
  const selectedRestaurant = useRecoilValue(
    selectedRestaurantState
  ) as IRestaurantNode;
  const nodeIdsToNodesMap = useRecoilValue(nodeIdsToNodesMapState);
  const MonToSun = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  //Map
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const center = {
    lat: (selectedRestaurant as IRestaurantNode).lat,
    lng: (selectedRestaurant as IRestaurantNode).lng,
  };
  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      setMap(map);
    }
  }, []);

  //Don't touch this useEffect, otherwise markers won't be rendered
  useEffect(() => {
    if (map) {
      const url = nodeIdsToNodesMap[selectedRestaurant.imageIds[0]]?.content;
      const icon = {
        url: url,
        scaledSize: new google.maps.Size(50, 50),
      };

      new google.maps.Marker({
        position: new google.maps.LatLng(
          selectedRestaurant.lat,
          selectedRestaurant.lng
        ),
        map: map,
        title: selectedRestaurant.title,
        icon: icon,
      });
    }
    setLoaded(true);
  }, [map, setMap]);

  const onUnmount = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(null);
    }
  }, []);
  const mapView = () => {
    return loaded ? (
      <div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        ></GoogleMap>
      </div>
    ) : (
      <div>
        <p>failed to loaded</p>
      </div>
    );
  };

  return (
    <div className="restaurant-attribution">
      <div className="image-gallery">
        {/* <ImageContent
          currentNode={
            nodeIdsToNodesMap[selectedRestaurant.imageIds[0]] as IImageNode
          }
        /> */}
        <ImageSlider imageIds={selectedRestaurant.imageIds} />
        {selectedRestaurant.type == "restaurant" && <CategoryTags />}
      </div>
      <div className="content-block">
        <div className="sub-title">📖 Description</div>
        <div>{selectedRestaurant.content}</div>
        <div className="sub-title">⏰ Opening Time</div>
        {selectedRestaurant.openingTimes.map((item, id) => {
          return (
            <div key={id}>
              {MonToSun[id]}: {item} - {selectedRestaurant.closingTimes[id]}
            </div>
          );
        })}
        {/* <div> */}
        <div className="sub-title">📍 Location</div>
        <div className="map-view">{mapView()}</div>
        {/* </div> */}
      </div>
    </div>
  );
};
