import {
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Select,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { RiCheckDoubleLine, RiCheckFill } from "react-icons/ri";
import { FrontendAnchorGateway } from "../../../anchors";
import { generateObjectId } from "../../../global";
import { FrontendLinkGateway } from "../../../links";
import { IEvent, ILink, NodeIdsToNodesMap } from "../../../types";
import { Button } from "../../Button";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
  isLinkingState,
  refreshState,
  startAnchorState,
  endAnchorState,
  selectedAnchorsState,
  selectedRestaurantState,
  userState,
} from "../../../global/Atoms";
import "./ScheduleModal.scss";
import { Schedule } from "./Schedule";
import { IUserProperty } from "~/types/IUserProperty";
import { makeIUserProperty } from "~/types/IUserProperty";
import { FrontendUserGateway } from "~/users";
export interface IScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const ScheduleModal = (props: IScheduleModalProps) => {
  const { isOpen, onClose } = props;
  // State variables
  const [title, setTitle] = useState("");
  const [explainer, setExplainer] = useState("");
  const [error, setError] = useState<string>("");
  const setIsLinking = useSetRecoilState(isLinkingState);
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState);
  const endAnchor = useRecoilValue(endAnchorState);
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const selectedRestaurant = useRecoilValue(selectedRestaurantState);
  // Called when the "Submit" button is clicked
  const [user, setUser] = useRecoilState(userState);
  const handleSubmit = async () => {
    if (date !== null && date instanceof Date && selectedRestaurant && user) {
      const startHour = from.getHours();
      const startMinute = from.getMinutes();
      const endHour = to.getHours();
      const endMinute = to.getMinutes();
      // const selectDate = new Date(date as Date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const startDate = new Date(year, month, day, startHour, startMinute);
      const endDate = new Date(year, month, day, endHour, endMinute);
      const title = "@" + selectedRestaurant.title;

      const newEvent: IEvent = { start: startDate, end: endDate, title: title };
      const newEvents = [...user.events, newEvent];

      const properties: IUserProperty[] = [];
      properties.push(makeIUserProperty("events", newEvents));
      const resp = await FrontendUserGateway.updateUserInfo(
        user.userId,
        properties
      );

      if (!resp.success) {
        console.error("Failed to update user in the backend:", resp.message);
      }
      const newUser = { ...user, events: newEvents };
      setUser(newUser);
      setRefresh(!refresh);
    }
  };
  console.log(user);
  const handleSubmit1 = async () => {
    // create link from modal
    if (startAnchor && endAnchor) {
      let link: ILink | null = null;

      let anchor1 = await FrontendAnchorGateway.getAnchor(startAnchor.anchorId);
      let anchor2 = await FrontendAnchorGateway.getAnchor(endAnchor.anchorId);
      if (!anchor1.success) {
        anchor1 = await FrontendAnchorGateway.createAnchor(startAnchor);
      }
      if (!anchor2.success) {
        anchor2 = await FrontendAnchorGateway.createAnchor(endAnchor);
      }
      if (anchor1.success && anchor2.success) {
        const anchor1Id = startAnchor.anchorId;
        const anchor2Id = endAnchor.anchorId;
        const anchor1NodeId = startAnchor.nodeId;
        const anchor2NodeId = endAnchor.nodeId;

        const linkId = generateObjectId("link");

        const newLink: ILink = {
          anchor1Id: anchor1Id,
          anchor2Id: anchor2Id,
          anchor1NodeId: anchor1NodeId,
          anchor2NodeId: anchor2NodeId,
          dateCreated: new Date(),
          explainer: explainer,
          linkId: linkId,
          title: title,
        };
        const linkResponse = await FrontendLinkGateway.createLink(newLink);
        if (!linkResponse.success) {
          setError("Error: Failed to create link");
          return;
        }
        link = linkResponse.payload;

        anchor2.payload && setSelectedAnchors([anchor2.payload]);
      } else {
        setError("Error: Failed to create anchors");
        return;
      }
      if (link !== null) {
        handleClose();
        setIsLinking(false);
        setStartAnchor(null);
        setRefresh(!refresh);
      } else {
        setError("Error: Failed to create link");
      }
    } else {
      setError("Error: Anchor 1 or 2 is missing");
    }
  };

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose();
    setTitle("");
    setExplainer("");
    setError("");
  };
  const [date, setDate] = useState<Value>(new Date());
  const [from, setFrom] = useState<Date>(new Date(0, 0, 0, 18, 30));
  const [to, setTo] = useState<Date>(new Date(0, 0, 0, 19, 30));
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule a visit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Schedule
              date={date}
              setDate={setDate}
              setFrom={setFrom}
              setTo={setTo}
            />
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button
                text="Submit"
                icon={<RiCheckFill />}
                onClick={handleSubmit}
              />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
