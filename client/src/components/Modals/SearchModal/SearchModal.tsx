import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Icon,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FrontendNodeGateway } from "../../../nodes";
import { Link } from "react-router-dom";
import { INode, NodeIdsToNodesMap } from "../../../types";
import { Button } from "../../Button";
import { nodeTypeIcon, pathToString } from "../../../global";
import "./SearchModal.scss";
import { useSetRecoilState } from "recoil";
import { selectedNodeState } from "../../../global/Atoms";
import { useRouter } from "next/router";
import {
  RiFolderLine,
  RiImageLine,
  RiStickyNoteLine,
  RiQuestionLine,
} from "react-icons/ri";

export interface ISearchModalProps {
  isOpen: boolean;
  nodeIdsToNodesMap: NodeIdsToNodesMap;
  onClose: () => void;
}

/**
 * Modal for moving a node to a new location
 */
export const SearchModal = (props: ISearchModalProps) => {
  const rounter = useRouter();
  const { isOpen, onClose } = props;
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  const [searchedNodes, setSearchedNodes] = useState<INode[]>([]);
  const [showingNodes, setShowingNodes] = useState<INode[]>([]);
  const [query, setQuery] = useState<string>("");

  const filterType = (type: string) => {
    const finalRes = searchedNodes.filter((item) => {
      return item.type == type;
    });
    setShowingNodes(finalRes);
  };

  const filterTime = () => {
    let finalRes = searchedNodes;
    finalRes = finalRes.slice().sort(function (i, j) {
      if (j.dateCreated && i.dateCreated) {
        return j.dateCreated > i.dateCreated ? 1 : -1;
      }
      return 1;
    });
    setShowingNodes(finalRes);
  };

  const filterRelevant = () => {
    setShowingNodes(searchedNodes);
  };

  const nodeTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return RiStickyNoteLine;
      case "folder":
        return RiFolderLine;
      case "image":
        return RiImageLine;
      default:
        return RiQuestionLine;
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchedNodes([]);
    console.log(query);
    const searchResp = await FrontendNodeGateway.searchNodes(query);
    if (!searchResp.success) {
      return searchResp.message;
    }
    setSearchedNodes(searchResp.payload);
  };

  const handleOnClick = (node: INode) => {
    setSelectedNode(node);
    onClose();
  };

  useEffect(() => {
    setQuery("");
    setSearchedNodes([]);
    setShowingNodes([]);
  }, [isOpen]);
  useEffect(() => {
    setShowingNodes(searchedNodes);
  }, [searchedNodes]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className={"model-input"}
                  placeholder="Search nodes..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                />
                <button type="submit">Search</button>
              </form>
              <button className="btn" onClick={filterTime}>
                Created↓
              </button>
              <button className="btn" onClick={filterRelevant}>
                Relevant↓
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "lightblue" }}
                onClick={() => filterType("image")}
              >
                <Icon as={nodeTypeIcon("image")} />
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "lightblue" }}
                onClick={() => filterType("text")}
              >
                <Icon as={nodeTypeIcon("text")} />
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "lightblue" }}
                onClick={() => filterType("folder")}
              >
                <Icon as={nodeTypeIcon("folder")} />
              </button>
              <UnorderedList>
                {showingNodes.map((node) => {
                  const icon = nodeTypeIcon(node.type);
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => {
                        handleOnClick(node);
                      }}
                    >
                      <ListItem
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          rounter.push(node.nodeId);
                        }}
                      >
                        <ListIcon as={icon} color="pink" />
                        <b>{node.title}</b> {"created at: " + node.dateCreated}
                      </ListItem>
                    </div>
                  );
                })}
              </UnorderedList>
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  );
};
