import { ChakraProvider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  refreshState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  isAppLoadedState,
  selectedRestaurantState,
  nodeIdsToNodesMapState,
  userState,
  nodeIdsToParentIdsMapState,
  commentToIdsToCommentIdsMapState,
  restaurantNodesState,
} from "../../global/Atoms";
import { useRouter } from "next/router";
import { FrontendNodeGateway } from "../../nodes";
import {
  IUser,
  IRestaurantNode,
  makeIFolderNode,
  NodeIdsToNodesMap,
  ICommentNode,
  NodeIdsToParentIdsMap,
  CommentToIdsToCommentIdsMap,
} from "../../types";
import { Alert } from "../Alert";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { Header } from "../Header";
import { LoadingScreen } from "../LoadingScreen";
import {
  CompleteLinkModal,
  CreateNodeModal,
  VisualizeNodeModal,
} from "../Modals";
import { RestaurantView } from "../RestaurantView";
import { TreeView } from "../TreeView";
import "./MainView.scss";
import { SearchModal } from "../Modals/SearchModal";
import { MapModal } from "../Modals/MapModal";
//user login
import { UserLogin } from "./UserLogin";
import { CalendarModal } from "../Modals/CalendarModal";

export const MainView = React.memo(function MainView() {
  // app states
  const [isAppLoaded, setIsAppLoaded] = useRecoilState(isAppLoadedState);
  // modal states
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false);
  const [needDeleteImages, setNeedDeleteImages] = useState<string[]>([]);
  const [completeLinkModalOpen, setCompleteLinkModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [visualizeNodeModalOpen, setVisualizeNodeModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  // Restaurant states
  const [restaurantNodes, setRestaurantNodes] =
    useRecoilState(restaurantNodesState);
  const [selectedRestaurant, setSelectedRestaurant] = useRecoilState(
    selectedRestaurantState
  );
  const refresh = useRecoilValue(refreshState);
  // Node map state
  const [nodeIdsToNodesMap, setNodeIdsToNodesMap] = useRecoilState(
    nodeIdsToNodesMapState
  );
  const setNodeIdsToParentIdsMap = useSetRecoilState(
    nodeIdsToParentIdsMapState
  );
  const setCommentToIdsToCommentIdsMap = useSetRecoilState(
    commentToIdsToCommentIdsMapState
  );
  // anchor states
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);
  // alerts
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  //user login/logout
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const handleUserLogin = (user: IUser) => {
    setUser(user);
  };
  const handleUserLogout = () => {
    setUser(null);
  };

  const handleCreateModalNeedDeleteImages = async (imageIds: string[]) => {
    setCreateNodeModalOpen(false);
    setIsAppLoaded(false);
    for (const id of imageIds) {
      const deleteResp = await FrontendNodeGateway.deleteNode(id);
      if (!deleteResp.success) {
        console.log("Error " + deleteResp.message);
        return;
      }
    }
    const newNodeIdsToNodesMap: NodeIdsToNodesMap = {};
    for (const key of Object.keys(nodeIdsToNodesMap)) {
      if (!imageIds.includes(key)) {
        newNodeIdsToNodesMap[key] = nodeIdsToNodesMap[key];
      }
    }
    setNodeIdsToNodesMap(newNodeIdsToNodesMap);
    setIsAppLoaded(true);
  };

  useEffect(() => {
    if (!createNodeModalOpen && needDeleteImages.length > 0) {
      handleCreateModalNeedDeleteImages(needDeleteImages);
      setNeedDeleteImages([]);
    }
  }, [createNodeModalOpen]);

  /** update our frontend root nodes from the database */
  const loadRootsFromDB = useCallback(async () => {
    const restaurantsFromDB = await FrontendNodeGateway.getOrganizedData();
    if (restaurantsFromDB.success && restaurantsFromDB.payload) {
      setRestaurantNodes(restaurantsFromDB.payload.restaurants);
      setNodeIdsToNodesMap(restaurantsFromDB.payload.NodeIdsToNodeMap);
      const idsToParentIds: NodeIdsToParentIdsMap = {};
      const commentToIdsToCommentIds: CommentToIdsToCommentIdsMap = {};
      for (const restaurant of restaurantsFromDB.payload.restaurants) {
        for (const id of restaurant.imageIds) {
          idsToParentIds[id] = restaurant.nodeId;
        }
      }
      for (const node of Object.values(
        restaurantsFromDB.payload.NodeIdsToNodeMap
      )) {
        if (node.type == "comment") {
          const comment = node as ICommentNode;
          // comment To restaurant
          idsToParentIds[comment.nodeId] = comment.commentTo;
          // nodes to comment
          for (const id of comment.content) {
            idsToParentIds[id] = comment.nodeId;
          }
          // commentTo to comments
          if (commentToIdsToCommentIds.hasOwnProperty(comment.commentTo)) {
            commentToIdsToCommentIds[comment.commentTo].push(comment.nodeId);
          } else {
            commentToIdsToCommentIds[comment.commentTo] = [comment.nodeId];
          }
        }
      }
      setNodeIdsToParentIdsMap(idsToParentIds);
      setCommentToIdsToCommentIdsMap(commentToIdsToCommentIds);
      setIsAppLoaded(true);
    }
  }, []);

  // TODO: Modify below

  useEffect(() => {
    loadRootsFromDB();
  }, [loadRootsFromDB, refresh]);

  // node routing	logic
  const router = useRouter();
  const url = router.asPath;
  const lastUrlParam = url.substring(url.lastIndexOf("/") + 1);

  useEffect(() => {
    const currentNodeId = lastUrlParam;
    async function fetchNodeFromUrl() {
      const fetchResp = await FrontendNodeGateway.getNode(currentNodeId);
      if (fetchResp.success) {
        setSelectedRestaurant(fetchResp.payload as IRestaurantNode);
      }
    }
    fetchNodeFromUrl();
  }, [lastUrlParam]);

  const globalKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        setSelectedAnchors([]);
        setSelectedExtent(null);
    }
  };

  // Trigger on app load
  useEffect(() => {
    document.addEventListener("keydown", globalKeyHandlers);
  }, []);

  let xLast: number;
  let dragging = false;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    xLast = e.screenX;
    document.removeEventListener("pointermove", onPointerMove);
    document.addEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (treeView.current && dragging) {
      const treeViewElement = treeView.current;
      let width = parseFloat(treeViewElement.style.width);
      const deltaX = e.screenX - xLast; // The change in the x location
      const newWidth = (width += deltaX);
      if (!(newWidth < 100 || newWidth > 480)) {
        treeViewElement.style.width = String(width) + "px";
        xLast = e.screenX;
      }
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  // ************************************************************************************
  // Header function
  // button handlers
  const handleCreateNodeButtonClick = useCallback(() => {
    setCreateNodeModalOpen(true);
  }, [setCreateNodeModalOpen]);

  const handleHomeClick = useCallback(() => {
    setSelectedRestaurant(
      makeIFolderNode(
        "root",
        [],
        [],
        "folder",
        "MyRestaurants Dashboard",
        "",
        "grid"
      )
    );
  }, []);

  // TODO: modified for visualizeNode
  const handleMapButtonClick = useCallback(() => {
    setMapModalOpen(true);
  }, [setMapModalOpen]);

  // TODO: modified for visualizeNode
  const handleVisualizeNodeButtonClick = useCallback(() => {
    setVisualizeNodeModalOpen(true);
  }, [setVisualizeNodeModalOpen]);
  // END

  // TODO: modified for search
  const handleSearchButtonClick = useCallback(() => {
    setSearchModalOpen(true);
  }, [setSearchModalOpen]);

  //user login
  const handleLoginButtonClick = useCallback(() => {
    setLoginModalOpen(true);
  }, []);

  const handleCalendarButtonClick = useCallback(() => {
    setCalendarModalOpen(true);
  }, []);

  // ************************************************************************************************
  // Node header function

  type NodeIdsToChildNodeIdsMap = {
    [nodeId: string]: string[];
  };

  const returnChlidIds = (
    nodeIdsTochildNodeIdsMap: NodeIdsToChildNodeIdsMap,
    nodeId: string
  ) => {
    if (!nodeIdsTochildNodeIdsMap.hasOwnProperty(nodeId)) {
      return [];
    }
    const childIds: string[] = [...nodeIdsTochildNodeIdsMap[nodeId]];

    nodeIdsTochildNodeIdsMap[nodeId].map((childId) => {
      if (nodeIdsTochildNodeIdsMap.hasOwnProperty(childId)) {
        childIds.concat(returnChlidIds(nodeIdsTochildNodeIdsMap, childId));
      }
    });

    return childIds;
  };

  const handleDeleteNodeButtonClick = useCallback(
    async (node: IRestaurantNode) => {
      if (node) {
        if (!user) {
          setAlertIsOpen(true);
          setAlertTitle("Unable to delete restaurant");
          setAlertMessage("You need to login first");
          return;
        }
        if (node.createdBy != user.name) {
          setAlertIsOpen(true);
          setAlertTitle("Unable to delete restaurant");
          setAlertMessage(
            "You can only delete the restaurant created by yourself"
          );
          return;
        }
        setIsAppLoaded(false);
        const nodeIdsTochildNodeIdsMap: NodeIdsToChildNodeIdsMap = {};
        for (const restaurant of restaurantNodes) {
          nodeIdsTochildNodeIdsMap[restaurant.nodeId] = [
            ...restaurant.imageIds,
          ];
        }
        for (const node of Object.values(nodeIdsToNodesMap)) {
          if (node.type == "comment") {
            const comment = node as ICommentNode;
            // restaurant to comments or comment to comments
            if (nodeIdsTochildNodeIdsMap.hasOwnProperty(comment.commentTo)) {
              nodeIdsTochildNodeIdsMap[comment.commentTo].push(comment.nodeId);
            } else {
              nodeIdsTochildNodeIdsMap[comment.commentTo] = [comment.nodeId];
            }
            // comment to nodes
            nodeIdsTochildNodeIdsMap[comment.nodeId] = [...comment.content];
          }
        }

        const deleteIds: string[] = returnChlidIds(
          nodeIdsTochildNodeIdsMap,
          node.nodeId
        );
        console.log(deleteIds);
        for (const id of deleteIds) {
          const deleteResp = await FrontendNodeGateway.deleteNode(id);
          if (!deleteResp.success) {
            setAlertIsOpen(true);
            setAlertTitle("Delete node failed");
            setAlertMessage("Delete node failed");
            return;
          }
        }

        const deleteResp = await FrontendNodeGateway.deleteNode(node.nodeId);
        if (!deleteResp.success) {
          setAlertIsOpen(true);
          setAlertTitle("Delete node failed");
          setAlertMessage("Delete node failed");
          return;
        }

        setSelectedRestaurant(
          makeIFolderNode(
            "root",
            [],
            [],
            "folder",
            "MyRestaurants Dashboard",
            "",
            "grid"
          )
        );
        setIsAppLoaded(true);
        loadRootsFromDB();
      }
    },
    [loadRootsFromDB, user]
  );

  const handleCompleteLinkClick = useCallback(() => {
    setCompleteLinkModalOpen(true);
  }, []);

  // const getSelectedNodeChildren = useCallback(() => {
  //   if (!selectedNode) return undefined;
  //   return selectedNode.filePath.children.map(
  //     (childNodeId) => nodeIdsToNodesMap[childNodeId]
  //   );
  // }, [nodeIdsToNodesMap, selectedNode]);

  const treeView = useRef<HTMLHeadingElement>(null);
  return (
    <ChakraProvider>
      {!isAppLoaded ? (
        <LoadingScreen hasTimeout={true} />
      ) : (
        <div className="main-container">
          <Alert />
          <div>
            <Header
              onHomeClick={handleHomeClick}
              onMapButtonClick={handleMapButtonClick}
              onCreateNodeButtonClick={handleCreateNodeButtonClick}
              // TODO: modified for visualizeNode
              // onVisualizeNodeButtonClick={handleVisualizeNodeButtonClick}
              // TODO: modified for search
              onSearchButtonClick={handleSearchButtonClick}
              // END
              //user login
              onLoginButtonClick={handleLoginButtonClick}
              onLogoutButtonClick={handleUserLogout}
              onCalendarButtonClick={handleCalendarButtonClick}
            />

            <CreateNodeModal
              isOpen={createNodeModalOpen}
              onClose={() => {
                setCreateNodeModalOpen(false);
              }}
              setNeedDeleteImages={setNeedDeleteImages}
              onSubmit={loadRootsFromDB}
            />

            <MapModal
              isOpen={mapModalOpen}
              restaurantNodes={restaurantNodes}
              onClose={() => setMapModalOpen(false)}
            />

            {/* <VisualizeNodeModal
              isOpen={visualizeNodeModalOpen}
              node={selectedNode ?? rootNode}
              nodeIdsToNodesMap={nodeIdsToNodesMap}
              onClose={() => setVisualizeNodeModalOpen(false)}
            /> */}
            <SearchModal
              isOpen={searchModalOpen}
              nodeIdsToNodesMap={nodeIdsToNodesMap}
              onClose={() => setSearchModalOpen(false)}
            />
            <CalendarModal
              isOpen={calendarModalOpen}
              onClose={() => setCalendarModalOpen(false)}
            />

            <CompleteLinkModal
              isOpen={completeLinkModalOpen}
              onClose={() => setCompleteLinkModalOpen(false)}
              nodeIdsToNodes={nodeIdsToNodesMap}
            />

            {/* userlogin */}
            <UserLogin
              isOpen={loginModalOpen}
              onUserLogin={handleUserLogin}
              onClose={() => setLoginModalOpen(false)}
            />
          </div>
          <div className="content">
            {selectedRestaurant.type == "folder" && (
              <div
                className="treeView-container"
                ref={treeView}
                style={{ width: 200 }}
              >
                <TreeView restaurants={restaurantNodes} />
              </div>
            )}
            <div className="divider" onPointerDown={onPointerDown} />
            <div className="node-wrapper">
              <RestaurantView
                RestaurantNodes={restaurantNodes}
                onDeleteButtonClick={handleDeleteNodeButtonClick}
                onCompleteLinkClick={handleCompleteLinkClick}
                onCreateNodeButtonClick={handleCreateNodeButtonClick}
              />
            </div>
          </div>
        </div>
      )}
      <ContextMenu />
    </ChakraProvider>
  );
});

//  #####################################################################################################
// below's UI is for the backend test. Comment the above and uncomment the below for the backend test.
// Vice versa
//  #####################################################################################################

// import { ChakraProvider } from "@chakra-ui/react";
// import React, {
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
//   ChangeEvent,
//   FormEvent,
// } from "react";
// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// import { refreshState, isAppLoadedState } from "../../global/Atoms";
// import { useRouter } from "next/router";
// import { FrontendNodeGateway } from "../../nodes";
// import {
//   ICommentNode,
//   INode,
//   IRestaurantNode,
//   IUser,
//   NodeIdsToNodesMap,
//   RecursiveNodeTree,
//   makeICommentNode,
//   makeINodePath,
//   makeIRestaurantNode,
//   traverseTree,
// } from "../../types";
// import { Alert } from "../Alert";
// import { ContextMenu } from "../ContextMenu/ContextMenu";
// import { Header } from "../Header";
// import { LoadingScreen } from "../LoadingScreen";
// import {
//   CompleteLinkModal,
//   CreateNodeModal,
//   MoveNodeModal,
//   VisualizeNodeModal,
// } from "../Modals";
// import { NodeView } from "../NodeView";
// import { TreeView } from "../TreeView";
// import "./MainView.scss";
// import { createNodeIdsToNodesMap } from "./mainViewUtils";
// import { SearchModal } from "../Modals/SearchModal";
// import { generateObjectId } from "~/global";
// import CommentBoard from "./comment";
// import { FrontendUserGateway } from "~/users";

// export const MainView = React.memo(function MainView() {
//   // app states
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [allRestaurants, setAllRestaurants] = useState<RecursiveNodeTree[]>([]);
//   const [refresh, setRefresh] = useRecoilState(refreshState);
//   const [showRestaurantId, setShowRestaurantId] = useState<number>(0);

//   // create user button
//   const [showCreateUser, setShowCreateUser] = useState(false);
//   const [user, setUser] = useState<IUser | null>(null);
//   const [userLoginModalOpen, setUserLoginModalOpen] = useState(false);

//   // useEffect(() => {
//   //   const fetchUser = async () => {
//   //     if (user) {
//   //       const userResponse = await FrontendUserGateway.getUser(user.userId);
//   //       if (userResponse.success) {
//   //         setUser(userResponse.payload);
//   //       }
//   //     }
//   //   };
//   //   fetchUser();
//   // }, []);
//   // new restaurant
//   const defaultRestaurants = makeIRestaurantNode(
//     "",
//     "restaurant",
//     "",
//     "",
//     0,
//     0,
//     [],
//     [],
//     [],
//     [],
//     "",
//     new Date()
//   );
//   const [newRestaurant, setNewRestaurant] =
//     useState<IRestaurantNode>(defaultRestaurants);
//   // new comment

//   const loadRestaurants = useCallback(async () => {
//     const loadRestaurantsResp = await FrontendNodeGateway.getRestaurants();
//     if (!loadRestaurantsResp.success) {
//       return;
//     }
//     setAllRestaurants(loadRestaurantsResp.payload);
//     setIsLoaded(true);
//   }, []);

//   useEffect(() => {
//     loadRestaurants();
//   }, [loadRestaurants, refresh]);

//   const validStringProperties = ["title", "content", "lat", "lng", "createdBy"];
//   const validArrayProperties = [
//     "imageIds",
//     "openingTimes",
//     "closingTimes",
//     "categories",
//   ];

//   const handleRestaurantChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;

//     if (validStringProperties.includes(name)) {
//       setNewRestaurant({
//         ...newRestaurant,
//         [name]: value,
//       });
//     } else if (validArrayProperties.includes(name)) {
//       const valueArr: string[] = [];
//       value.split(",").map((singleV) => {
//         valueArr.push(singleV.trim());
//       });
//       setNewRestaurant({
//         ...newRestaurant,
//         [name]: valueArr,
//       });
//     }
//   };
//   const [username, setUserName] = useState("");
//   const [password, setPassword] = useState("");

//   const handleUserLogin = async (e: FormEvent) => {
//     e.preventDefault();
//     const userResp = await FrontendUserGateway.getUser(username, password);
//     if (!userResp.success) {
//       console.error(userResp.message);
//       return;
//     }
//     if (userResp.payload) {
//       console.log("user logged in");
//       setUser(userResp.payload);
//     }
//   };
//   const handleUserSignIn = async (e: FormEvent) => {
//     e.preventDefault();
//     const createUserResp = await FrontendUserGateway.createUser({
//       userId: generateObjectId('user'),
//       password: password,
//       name: username,
//       markedRestaurantId: [],
//       isAdmin: false
//     });
//     if (!createUserResp.success) {
//       console.error(createUserResp.message);
//       return;
//     }
//   };

//   const handleRestaurantSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     // Add your logic to submit the restaurant data
//     const nodeId = generateObjectId(newRestaurant.type);

//     setNewRestaurant({
//       ...newRestaurant,
//       nodeId: nodeId,
//       filePath: makeINodePath([nodeId], []),
//     });
//     const createNodeResp = await FrontendNodeGateway.createNode(newRestaurant);
//     console.log(createNodeResp.payload);
//     // setNewRestaurant(defaultRestaurants);
//     if (!createNodeResp.success) {
//       console.error(createNodeResp.message);
//       return;
//     }
//     setRefresh(!refresh);
//   };

//   return (
//     <ChakraProvider>
//       {!isLoaded ? (
//         <LoadingScreen hasTimeout={true} />
//       ) : (
//         <div>
//           <div>
//             <div style={{ backgroundColor: "skyblue" }}>
//               <div> Create a new restaurant </div>
//               <form
//                 className="form-container"
//                 onSubmit={handleRestaurantSubmit}
//               >
//                 <div className="form-group">
//                   {Object.entries(newRestaurant).map(([key, value]) => {
//                     if (key !== "nodeId") {
//                       return (
//                         <div className="input" key={key}>
//                           <label className="label" htmlFor={key}>
//                             {key}
//                           </label>
//                           <input
//                             type="text"
//                             name={key}
//                             value={value}
//                             onChange={handleRestaurantChange}
//                             required
//                           />
//                         </div>
//                       );
//                     }
//                     return;
//                   })}
//                   <div className="button_container">
//                     <button className="button" type="submit">
//                       CREATE RESTAURANT
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//           <div>
//             <div style={{ backgroundColor: "yellow" }}>
//               <div style={{ fontSize: 64 }}> new create R </div>
//               {/* show one RESTAURANT */}
//               {Object.entries(newRestaurant).map(([key, value]) => (
//                 <div key={key}>
//                   {key} {JSON.stringify(value)}
//                 </div>
//               ))}
//             </div>
//             <div style={{ backgroundColor: "lightblue" }}>
//               <div style={{ fontSize: 64 }}> cur select R </div>
//               {/* show one RESTAURANT */}
//               {Object.entries(allRestaurants[showRestaurantId].node).map(
//                 ([key, value]) => (
//                   <div key={key}>
//                     {key} {JSON.stringify(value)}
//                   </div>
//                 )
//               )}
//             </div>
//             {/* user login*/}
//             <div style={{ backgroundColor: "lightgrey" }}>
//               <div style={{ fontSize: 64 }}> User Login </div>
//               {user ? (
//                 <div>
//                   <div style={{ fontSize: 24 }}>Welcome, {user.userId}!</div>
//                 </div>
//               ) : (
//                 <div>
//                   <div className="input">
//                     <label className="label" htmlFor="username">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       onChange={(e: ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="input">
//                     <label className="label" htmlFor="password">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <button className="button" onClick={handleUserLogin}>
//                     LOGIN
//                   </button>
//                   <button className="button" onClick={handleUserSignIn}>
//                     SIGN UP
//                   </button>
//                 </div>

//               )}
//               {user && user.password !== password &&
//                 <div>Please re-enter your password</div>
//               }
//             </div>

//             <div>
//               select current restaurant, you could input a number in the blow
//               (index only 0 to len-1)
//             </div>
//             <input
//               type="text"
//               style={{ border: "1px solid" }}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                 if (isNaN(Number(e.target.value))) return;
//                 let id = parseInt(e.target.value, 10);
//                 if (isNaN(id)) id = 0;
//                 if (id < allRestaurants.length) {
//                   setShowRestaurantId(id);
//                   setRefresh(true);
//                 } else {
//                   console.log(
//                     "The length of restaurant is " +
//                       allRestaurants.length.toString
//                   );
//                 }
//               }}
//             />
//             <div>The length of restaurant is {allRestaurants.length}</div>
//           </div>
//           <CommentBoard tree={allRestaurants[showRestaurantId]} />
//         </div>

//       )}
//       <ContextMenu />
//     </ChakraProvider>
//   );
// });
