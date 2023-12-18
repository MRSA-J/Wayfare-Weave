import { Select } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import * as bi from "react-icons/bi";
import * as ri from "react-icons/ri";
import { FrontendNodeGateway } from "../../../nodes";
import {
  IFolderNode,
  INodeProperty,
  IRestaurantNode,
  makeINodeProperty,
} from "../../../types";
import { Button } from "../../Button";
import { ContextMenuItems } from "../../ContextMenu";
import { EditableText } from "../../EditableText";
import "./NodeHeader.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  selectedNodeState,
  isLinkingState,
  refreshState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  selectedRestaurantState,
  userState,
} from "../../../global/Atoms";
import { IUserProperty, makeIUserProperty } from "~/types/IUserProperty";
import { FrontendUserGateway } from "~/users";
import { ScheduleModal } from "~/components/Modals/ScheduleModal";

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void;
  onHandleStartLinkClick: () => void;
  onDeleteButtonClick: (node: IRestaurantNode) => void;
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    onDeleteButtonClick,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
  } = props;
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const isLinking = useRecoilValue(isLinkingState);
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  // State variable for current node title
  const [title, setTitle] = useState(selectedRestaurant.title);
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      "viewType",
      (e.currentTarget as any).value as any
    );
    const updateViewResp = await FrontendNodeGateway.updateNode(
      selectedRestaurant.nodeId,
      [nodeProperty]
    );
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload);
    } else {
      setAlertIsOpen(true);
      setAlertTitle("View not updated");
      setAlertMessage(updateViewResp.message);
    }
  };

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    // TODO: Task 9
    setTitle(title);
    const nodeProperty: INodeProperty = makeINodeProperty("title", title);
    const titleUpdateResp = await FrontendNodeGateway.updateNode(
      selectedRestaurant.nodeId,
      [nodeProperty]
    );
    if (!titleUpdateResp.success) {
      setAlertIsOpen(true);
      setAlertTitle("Title update failed");
      setAlertMessage(titleUpdateResp.message);
    }
    setSelectedNode(selectedRestaurant);
    setRefresh(!refresh);
  };

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    // TODO: Task 10
    ContextMenuItems.splice(0, ContextMenuItems.length);
    const menuItem: JSX.Element = (
      <div
        key={"titleRename"}
        className="contextMenuItem"
        onClick={() => {
          ContextMenuItems.splice(0, ContextMenuItems.length);
          setEditingTitle(true);
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">ctrl + shift + R</div>
      </div>
    );
    ContextMenuItems.push(menuItem);
  };

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(selectedRestaurant.title);
    setEditingTitle(false);
  }, [selectedRestaurant]);

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // TODO: Task 10
    // key handlers with no modifiers
    switch (e.key) {
      case "Enter":
        if (editingTitle == true) {
          e.preventDefault();
          setEditingTitle(false);
        }
        break;
      case "Escape":
        if (editingTitle == true) {
          e.preventDefault();
          setEditingTitle(false);
        }
        break;
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case "R":
          e.preventDefault();
          setEditingTitle(true);
          break;
      }
    }
  };

  /* Trigger on node load or when editingTitle changes */
  useEffect(() => {
    // TODO: Task 10
    document.addEventListener("keydown", nodeKeyHandlers);
  }, [editingTitle]);

  const [like, setLike] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  useEffect(() => {
    if (selectedRestaurant && user) {
      setLike(user.markedRestaurantId.includes(selectedRestaurant.nodeId));
    }
  }, [selectedRestaurant, refresh]);
  const handleMark = async () => {
    if (!user) {
      return;
    }
    console.log(user.markedRestaurantId);
    const newMarks = user.markedRestaurantId.includes(selectedRestaurant.nodeId)
      ? user.markedRestaurantId.filter((id) => id != selectedRestaurant.nodeId)
      : [...user.markedRestaurantId, selectedRestaurant.nodeId];
    console.log(newMarks);

    const properties: IUserProperty[] = [];
    properties.push(makeIUserProperty("markedRestaurantId", newMarks));
    const resp = await FrontendUserGateway.updateUserInfo(
      user.userId,
      properties
    );

    if (!resp.success) {
      console.error("Failed to update user in the backend:", resp.message);
    }
    const newUser = { ...user, markedRestaurantId: newMarks };
    setUser(newUser);
    setRefresh(!refresh);
  };
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const handleScheduleClose = () => {
    setScheduleOpen(false);
  };
  const isFolder: boolean = selectedRestaurant.type === "folder";
  const isRoot: boolean = selectedRestaurant.type === "folder";
  return (
    <div className="nodeHeader">
      <div
        className="nodeHeader-title"
        onDoubleClick={() => setEditingTitle(true)}
        onContextMenu={handleTitleRightClick}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {!isRoot && (
          <>
            <Button
              icon={<ri.RiHeart2Fill />}
              text="Mark"
              style={{
                color: like ? "red" : "black",
                cursor: "pointer",
              }}
              onClick={handleMark}
            />
            <Button
              icon={<ri.RiCalendarCheckFill />}
              text="Schedule"
              onClick={() => setScheduleOpen(true)}
            />
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() =>
                onDeleteButtonClick(selectedRestaurant as IRestaurantNode)
              }
            />
            <Button
              icon={<ri.RiExternalLinkLine />}
              text="Start Link"
              onClick={onHandleStartLinkClick}
            />
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            {isFolder && (
              <div className="select">
                <Select
                  bg="f1f1f1"
                  defaultValue={(selectedRestaurant as IFolderNode).viewType}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
      <div>
        <ScheduleModal isOpen={isScheduleOpen} onClose={handleScheduleClose} />
      </div>
    </div>
  );
};
