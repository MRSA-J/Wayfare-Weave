import { atom } from "recoil";
import { 
  INode, 
  IAnchor, 
  Extent, 
  IRestaurantNode, 
  makeIFolderNode, 
  IFolderNode, 
  NodeIdsToNodesMap, 
  IUser, 
  NodeIdsToParentIdsMap,
  CommentToIdsToCommentIdsMap 
} from "../../types";

// whether the app is loaded
export const isAppLoadedState = atom<boolean>({
  key: "isAppLoadedState",
  default: false,
});

// // root nodes
// export const rootNodesState = atom<RecursiveNodeTree[]>({
//   key: "rootNodesState",
//   default: [new RecursiveNodeTree(emptyNode)],
// });

// the selected node
export const selectedNodeState = atom<INode | null>({
  key: "selectedNodeState",
  default: null,
});

// // the current node, same as selected node unless selected node is null
// export const currentNodeState = atom<INode>({
//   key: "currentNodeState",
// });

// whether a link is in progress
export const isLinkingState = atom<boolean>({
  key: "isLinkingState",
  default: false,
});

// signal to refresh webpage
export const refreshState = atom<boolean>({
  key: "refreshState",
  default: false,
});

// signal to refresh anchors
export const refreshAnchorState = atom<boolean>({
  key: "refreshAnchorState",
  default: false,
});

// signal to refresh anchors
export const refreshLinkListState = atom<boolean>({
  key: "refreshLinkListState",
  default: false,
});

// start anchor for link
export const startAnchorState = atom<IAnchor | null>({
  key: "startAnchorState",
  default: null,
});

// end anchor for link
export const endAnchorState = atom<IAnchor | null>({
  key: "endAnchorState",
  default: null,
});

// selected anchor(s)
export const selectedAnchorsState = atom<IAnchor[]>({
  key: "selectedAnchorsState",
  default: [],
});

// selected extent
export const selectedExtentState = atom<Extent | null | undefined>({
  key: "selectedExtentState",
  default: null,
});

// whether alert is open
export const alertOpenState = atom<boolean>({
  key: "alertOpenState",
  default: false,
});

// alert title
export const alertTitleState = atom<string>({
  key: "alertTitleState",
  default: "",
});

// alert message
export const alertMessageState = atom<string>({
  key: "alertMessageState",
  default: "",
});

// selected restaurant state
export const selectedRestaurantState = atom<IRestaurantNode | IFolderNode>({
  key: "selectedRestaurantState",
  default: makeIFolderNode(
    "root",
    [],
    [],
    "folder",
    "MyRestaurants Dashboard",
    "",
    "grid"
  ),
});

export const restaurantNodesState = atom<IRestaurantNode[]>({
  key: "restaurantNodes",
  default: []
});

// selected categories state
export const selectedCategoriesState = atom<string[]>({
  key: "selectedCategoriesState",
  default: [],
});

// NodeIdsToNodeMap state
export const nodeIdsToNodesMapState = atom<NodeIdsToNodesMap>({
  key: "nodeIdsToNodesMapState",
  default: {}
})

export const nodeIdsToParentIdsMapState = atom<NodeIdsToParentIdsMap>({
  key: "nodeIdsToParentIdMapState",
  default: {}
})

export const commentToIdsToCommentIdsMapState = atom<CommentToIdsToCommentIdsMap>({
  key: "CommentToIdsToCommentIdsMapState",
  default: {}
})

export const goToImageIdState = atom<number>({
  key: "goToImageIdState",
  default: 0
})

export const goToTextIdState = atom<number>({
  key: "goToTextIdState",
  default: 0
})


// NodeIdsToNodeMap state
export const userState = atom<IUser | null>({
  key: "userState",
  default: null
})