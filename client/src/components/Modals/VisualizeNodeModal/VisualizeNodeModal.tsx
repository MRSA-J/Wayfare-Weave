import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
  } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
    INode,
    NodeIdsToNodesMap
  } from "../../../types";
import './VisualizeNodeModal.scss';
import ReactFlow from 'react-flow-renderer';
import { FrontendLinkGateway } from "~/links";
import { FrontendAnchorGateway } from "~/anchors";

export interface IVisualizeNodeModalProps {
    isOpen: boolean;
    node: INode;
    nodeIdsToNodesMap: NodeIdsToNodesMap;
    onClose: () => void;
}

export const VisualizeNodeModal = (props: IVisualizeNodeModalProps) =>  {
  const { isOpen, node, nodeIdsToNodesMap, onClose } = props;
  type NodesType = { 
    id: string,
    data: { label: string},
    position: {x: number, y: number}
   }[];
  type EdgesType = {
    id: string,
    source: string,
    target: string,
    animated: boolean
  }[];
  type DictionaryType = {
    id: string;
    title: string;
    width: number;
    y: number;
    children: DictionaryType[];
  } | Record<string, never>;

  let nodes:NodesType = [];
  let edges: EdgesType = [];
  const [flowNodes, setFlowNodes] = useState<NodesType>([]);
  const [flowEdges, setFlowEdges] = useState<EdgesType>([]);

  let nodeId:number = 1;
  let visited:Set<string> = new Set();
  
  const getChildlinkedNodes = (async (curNode: INode) => {
    const unvisitedNodes:Set<INode> = new Set(); 
    // 1. Get all anchors
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      curNode.nodeId
    );
    const anchorIds:string[] = [];
    if (!anchorsFromNode.success) {
      return unvisitedNodes;
    }
    anchorsFromNode.payload.forEach(node => {
      anchorIds.push(node.anchorId)
    });

    // 2. Get all links
    const linksFromAnchorResp = await FrontendLinkGateway.getLinksByAnchorIds(anchorIds);
    if (!linksFromAnchorResp.success) {
      return unvisitedNodes;
    }

    // 3. Get unvisited nodes
    linksFromAnchorResp.payload.forEach(link => {
      const node1 = nodeIdsToNodesMap[link.anchor1NodeId];
      const node2 = nodeIdsToNodesMap[link.anchor2NodeId];
      if (node1 == node2) {
        if (!visited.has(node1.nodeId)) {
          unvisitedNodes.add(node1);
        }
      } else {
        if (!visited.has(node1.nodeId) && (node2.nodeId == curNode.nodeId)) {
          unvisitedNodes.add(node1);
        } else if (!visited.has(node2.nodeId) && (node1.nodeId == curNode.nodeId)) {
          unvisitedNodes.add(node2);
        }
      }
    });
    return unvisitedNodes;
  });

  const recursiveNodes = (async (curNode: INode, initY: number) => {
    const childNodes:INode[] = Array.from(await getChildlinkedNodes(curNode));
    visited.add(curNode.nodeId);
    console.log(curNode.nodeId);
    console.log(visited);
    let totalWidth: number = 0;
    const children: DictionaryType[] = [];
    
    for (let i = 0; i < childNodes.length; i++) {
      if (childNodes[i].nodeId != curNode.nodeId) {
        // node connected to some other node
        const childToChildren = await recursiveNodes(childNodes[i], initY + 100);
        totalWidth += childToChildren.width;
        children.push(childToChildren);
      }
    }
    const curId = nodeId.toString();
    const returnDic = {
      id: curId,
      title: curNode.title,
      width: totalWidth > 0 ? totalWidth : 170,
      y: initY,
      children: children
    };
    nodeId += 1;
    return returnDic;
  });

  const recursiveUpdating = ((curNode:DictionaryType, initX: number) => {
    // console.log(curNode);
    nodes.push({
      id: curNode.id,
      data: {label: curNode.title},
      position: {x: initX, y: curNode.y}
    });
    let childX = initX - curNode.width/2;
    curNode.children.forEach((child) => {
      if (child.title != curNode.title) {
        childX += child.width/2;
        recursiveUpdating(child, childX);
        childX += child.width/2;
        edges.push({
          id: child.id,
          source: curNode.id,
          target: child.id,
          animated: false
        });
      } else {
        edges.push({
          id: child.id,
          source: curNode.id,
          target: child.id,
          animated: true
        });
      }
    });


  });

  const updateAttributions = (async () => {
    nodeId = 1;
    visited = new Set();
    nodes = [];
    edges = [];
    setFlowNodes([]);
    setFlowEdges([]);
    console.log(node);
    const nodeToChildren = await recursiveNodes(node, 25);
    console.log(nodeToChildren);
    recursiveUpdating(nodeToChildren, 220);
    setFlowNodes(nodes);
    setFlowEdges(edges);
  });
  useEffect(() => {
    if (isOpen) {
      updateAttributions();
    }
}, [node, isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={"inside"} size={'4xl'}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>
          Visualizing Current Node
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="modal-flow">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};