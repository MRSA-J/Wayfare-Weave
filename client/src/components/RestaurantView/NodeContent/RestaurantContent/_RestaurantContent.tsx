import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { FrontendAnchorGateway } from "../../../../anchors";
import {
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  selectedExtentState,
  selectedRestaurantState,
} from "../../../../global/Atoms";
import { FrontendLinkGateway } from "../../../../links";
import { FrontendNodeGateway } from "../../../../nodes";
import {
  Extent,
  ITextExtent,
  INodeProperty,
  IServiceResponse,
  failureServiceResponse,
  makeINodeProperty,
  successfulServiceResponse,
  IRestaurantNode,
} from "../../../../types";
import "./RestaurantContent.scss";
import { Link } from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "../../../Button";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

/** The content of an text node, including all its anchors */
const containerStyle = {
  width: "400px",
  height: "400px",
};

export const RestaurantContent = () => {
  // const API_KEY = process.env.API_KEY;
  const selectedRestaurant = useRecoilValue(
    selectedRestaurantState
  ) as IRestaurantNode;
  // const [refresh, setRefresh] = useRecoilState(refreshState);
  // const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState);
  // const [linkMenuRefresh, setLinkMenuRefresh] =
  //   useRecoilState(refreshLinkListState);
  // const setSelectedExtent = useSetRecoilState(selectedExtentState);

  // // const [onSave, setOnSave] = useState(false);

  // // State variable for whether the content is being edited
  // // const [editingContent, setEditingContent] = useState<boolean>(false);
  // const setAlertIsOpen = useSetRecoilState(alertOpenState);
  // const setAlertTitle = useSetRecoilState(alertTitleState);
  // const setAlertMessage = useSetRecoilState(alertMessageState);

  // const [isHoursMenuOpen, setHoursMenuOpen] = useState(false);
  // // TODO: Add all of the functionality for a rich text editor!
  // // (This file is where the majority of your work on text editing will be done)
  // const [map, setMap] = useState<google.maps.Map | null>(null);
  // const { isLoaded } = useJsApiLoader({
  //   id: "google-map-script",
  //   googleMapsApiKey: API_KEY,
  // });
  // const center = {
  //   lat: (currentNode as IRestaurantNode).lat,
  //   lng: (currentNode as IRestaurantNode).lng,
  // };
  // const onLoad = useCallback(function callback(map: google.maps.Map | null) {
  //   // This is just an example of getting and using the map instance!!! don't just blindly copy!
  //   //TODO - might need southwest and northeast
  //   if (map) {
  //     const bounds = new window.google.maps.LatLngBounds(center);
  //     map.fitBounds(bounds);
  //     setMap(map);
  //   }
  // }, []);

  // //TODO
  // const onUnmount = useCallback(function callback(map: google.maps.Map | null) {
  //   if (map) {
  //     setMap(null);
  //   }
  // }, []);

  // const editor = useEditor({
  //   extensions: [
  //     StarterKit,
  //     Link.configure({
  //       openOnClick: true,
  //       autolink: false,
  //       linkOnPaste: false,
  //     }),
  //   ],
  //   content: currentNode.content,
  // });

  // const imgRef = useRef<HTMLImageElement | null>(null);
  // /** This function adds anchor marks for anchors in the database to the text editor */
  // const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
  //   if (!editor) {
  //     return failureServiceResponse("no editor");
  //   }
  //   const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
  //     currentNode.nodeId
  //   );
  //   if (!anchorResponse || !anchorResponse.success) {
  //     return failureServiceResponse("failed to get anchors");
  //   }
  //   if (!anchorResponse.payload) {
  //     return successfulServiceResponse("no anchors to add");
  //   }
  //   for (let i = 0; i < anchorResponse.payload?.length; i++) {
  //     const anchor = anchorResponse.payload[i];
  //     const linkResponse = await FrontendLinkGateway.getLinksByAnchorId(
  //       anchor.anchorId
  //     );
  //     if (!linkResponse.success) {
  //       return failureServiceResponse("failed to get link");
  //     }
  //     const link = linkResponse.payload[0];
  //     let node = link.anchor1NodeId;
  //     if (node == currentNode.nodeId) {
  //       node = link.anchor2NodeId;
  //     }
  //     if (anchor.extent && anchor.extent.type == "text") {
  //       editor.commands.setTextSelection({
  //         from: anchor.extent.startCharacter + 1,
  //         to: anchor.extent.endCharacter + 1,
  //       });
  //       editor.commands.setLink({
  //         href: "/" + node + "/",
  //         target: anchor.anchorId,
  //       });
  //     }
  //   }
  //   return successfulServiceResponse("added anchors");
  // };

  // // Set the content and add anchor marks when this component loads
  // useEffect(() => {
  //   if (editor) {
  //     editor.commands.setContent(currentNode.content);
  //     addAnchorMarks();
  //   }
  // }, [currentNode, editor]);

  // useEffect(() => {
  //   if (editor) {
  //     async () => {
  //       const renewNodeResp = await FrontendNodeGateway.getNode(
  //         currentNode.nodeId
  //       );
  //       if (!renewNodeResp.success) {
  //         setAlertIsOpen(true);
  //         setAlertTitle("Content update failed");
  //         setAlertMessage(renewNodeResp.message);
  //       }
  //       if (renewNodeResp.payload != null) {
  //         setCurrentNode(renewNodeResp.payload);
  //       }
  //     };
  //     editor.commands.setContent(currentNode.content);
  //     addAnchorMarks();
  //   }
  // }, [refresh]);

  // // Set the selected extent to null when this component loads
  // useEffect(() => {
  //   setSelectedExtent(null);
  // }, [currentNode]);

  // const onPointerUp = () => {
  //   if (!editor) {
  //     return;
  //   }
  //   const from = editor.state.selection.from;
  //   const to = editor.state.selection.to;
  //   const text = editor.state.doc.textBetween(from, to);
  //   if (from !== to) {
  //     const selectedExtent: Extent = {
  //       type: "text",
  //       startCharacter: from - 1,
  //       endCharacter: to - 1,
  //       text: text,
  //     };
  //     setSelectedExtent(selectedExtent);
  //   } else {
  //     setSelectedExtent(null);
  //   }
  // };

  // {
  //   /* handle updates node content, anchors, delete anchors, update/delete anchors when delete links */
  // }
  // //Modified, function written by myself
  // const handleUpdateContent = async () => {
  //   if (!editor) {
  //     // return <div>{currentNode.content}</div>;
  //     return;
  //   }

  //   // 1.Update content
  //   const newContent = editor.getHTML();
  //   const nodeProperty: INodeProperty = makeINodeProperty(
  //     "content",
  //     newContent
  //   );
  //   const contentUpdateResp = await FrontendNodeGateway.updateNode(
  //     currentNode.nodeId,
  //     [nodeProperty]
  //   );
  //   //if not successed, do it like "handleUpdateTitle" in NodeHeader.tsx"
  //   if (!contentUpdateResp.success) {
  //     setAlertIsOpen(true);
  //     setAlertTitle("Content update failed");
  //     setAlertMessage(contentUpdateResp.message);
  //     return;
  //   }

  //   // 2. Update anchors
  //   editor.state.doc.descendants(function (node, pos) {
  //     // loop through the marks of the nodes
  //     node.marks.forEach(async (mark) => {
  //       //if mark existed and have type
  //       if (mark && mark.type) {
  //         // rule out the internal link
  //         if (mark.type.name == "link" && "target" in mark.attrs) {
  //           console.log(node.text);
  //           console.log(mark);
  //           if (node.text) {
  //             const extent: ITextExtent = {
  //               startCharacter: pos - 1,
  //               endCharacter: pos + node.text.length - 1,
  //               text: node.text,
  //               type: "text",
  //             };
  //             // database update
  //             const anchorUpdateResp = await FrontendAnchorGateway.updateExtent(
  //               mark.attrs.target,
  //               extent
  //             );
  //             //if failed
  //             if (!anchorUpdateResp.success) {
  //               setAlertIsOpen(true);
  //               setAlertTitle("Anchor update failed");
  //               setAlertMessage(anchorUpdateResp.message);
  //               return;
  //             }
  //           }
  //         }
  //       }
  //     });
  //   });

  //   // 3. Delete anchors
  //   // get anchors
  //   const getAnchorsResp = await FrontendAnchorGateway.getAnchorsByNodeId(
  //     currentNode.nodeId
  //   );
  //   //failed to get Anchor
  //   if (!getAnchorsResp.success || !getAnchorsResp.payload) {
  //     setAlertIsOpen(true);
  //     setAlertTitle("Failed to get Anchor");
  //     setAlertMessage(getAnchorsResp.message);
  //     return;
  //   }

  //   const editorAnchors: string[] = []; // anchors appears in editor
  //   const deleteAnchors: string[] = []; // anchors in database but not appears in the editor

  //   // go through all editor's nodes to get updatedAnchors[]
  //   editor.state.doc.descendants(function (node) {
  //     node.marks.forEach((item) => {
  //       if (item.type.name == "link" && "target" in item.attrs) {
  //         editorAnchors.push(item.attrs.target);
  //       }
  //     });
  //   });

  //   // loop through all the anchors
  //   getAnchorsResp.payload.forEach((nodeAnchor) => {
  //     // push anchors in database but not in editor into deleteAnchors
  //     if (editorAnchors.indexOf(nodeAnchor.anchorId) < 0) {
  //       deleteAnchors.push(nodeAnchor.anchorId);
  //     }
  //   });

  //   // 4. Update/delete anchors when delete links
  //   // get link from anchors
  //   const getLinksByAnchorIds = await FrontendLinkGateway.getLinksByAnchorIds(
  //     deleteAnchors
  //   );

  //   const deleteLinks: string[] = [];
  //   getLinksByAnchorIds.payload?.forEach((link) => {
  //     if (link) {
  //       deleteLinks.push(link.linkId);
  //     }
  //   });
  //   if (!getLinksByAnchorIds.success) {
  //     setAlertIsOpen(true);
  //     setAlertTitle("Failed to get link ids");
  //     setAlertMessage(getLinksByAnchorIds.message);
  //   }

  //   // delete links corresponds to anchor
  //   const deleteLinksResp = await FrontendLinkGateway.deleteLinks(deleteLinks);
  //   // failed to delete
  //   if (!deleteLinksResp.success) {
  //     setAlertIsOpen(true);
  //     setAlertTitle("Failed to delete links");
  //     setAlertMessage(deleteLinksResp.message);
  //   }
  //   // delete anchors
  //   const deleteAnchorsResp = await FrontendAnchorGateway.deleteAnchors(
  //     deleteAnchors
  //   );
  //   // failed to delete
  //   if (!deleteAnchorsResp.success) {
  //     setAlertIsOpen(true);
  //     setAlertTitle("Failed to delete anchors");
  //     setAlertMessage(deleteAnchorsResp.message);
  //   }

  //   //refresh
  //   setRefresh(!refresh);
  //   //Modified: added
  //   setLinkMenuRefresh(!linkMenuRefresh);
  //   setAnchorRefresh(!anchorRefresh);
  // };

  // if (!editor) {
  //   return <div>{currentNode.content}</div>;
  // }

  // const handleHourMenuClick = () => {
  //   setHoursMenuOpen(!isHoursMenuOpen);
  // };
  //TODO - [optional] Only creator can delete tags
  // const tagline = () => {
  //   return (
  //     <div>
  //       {selectedRestaurant..map((tag, index) => (
  //         <Button key={tag + index} text={tag} />
  //       ))}
  //       {<Button text="+" />}
  //     </div>
  //   );
  // };
  // //TODO -
  // const images = () => {
  //   return (
  //     <div>
  //       <img
  //         ref={imgRef}
  //         src={(currentNode as IRestaurantNode).imageIds[0]}
  //         alt={currentNode.title}
  //       />
  //     </div>
  //   );
  // };
  // const imageSlider = () => {
  //   return <div>imageSlider: Not yet implemented</div>;
  // };
  // const hoursMenu = () => {
  //   const days = [
  //     "Monday",
  //     "Tuesday",
  //     "Wednesday",
  //     "Thursday",
  //     "Friday",
  //     "Saturday",
  //     "Sunday",
  //   ];
  //   const buttonText = "----Hours----".concat(isHoursMenuOpen ? "↑" : "↓");
  //   const restaurant = currentNode as IRestaurantNode;
  //   return (
  //     <div>
  //       <Button text={buttonText} onClick={handleHourMenuClick} />
  //       {isHoursMenuOpen &&
  //         restaurant.openingTimes.map((opentime, index) => {
  //           if (opentime === "") {
  //             return <div key={index}>{days[index] + ": Closed"}</div>;
  //           }
  //           const closetime = restaurant.closingTimes[index];
  //           if (closetime === "") {
  //             return <div key={index}>{"Error not handled"}</div>;
  //           }
  //           return (
  //             <div key={index}>
  //               {days[index] + ": " + opentime + " AM --- " + closetime + " PM"}
  //             </div>
  //           );
  //         })}
  //     </div>
  //   );
  // };
  // const mapView = () => {
  //   return isLoaded ? (
  //     <div>
  //       <GoogleMap
  //         mapContainerStyle={containerStyle}
  //         center={center}
  //         zoom={10}
  //         onLoad={onLoad}
  //         onUnmount={onUnmount}
  //       ></GoogleMap>
  //     </div>
  //   ) : (
  //     <div>
  //       <p>failed to loaed</p>
  //     </div>
  //   );
  // };
  // console.log(currentNode);
  return (
    <div>
      {/* {tagline()}
      {images()}
      {imageSlider()}
      {hoursMenu()}
      {mapView()}
      <p>asdf</p>
      <Tagline />
      <EditorContent
        className={"editorContent"}
        editor={editor}
        onPointerUp={onPointerUp}
      />
      <button onClick={handleUpdateContent} className={"save_btn"}>
        Save
      </button> */}
    </div>
  );
};
