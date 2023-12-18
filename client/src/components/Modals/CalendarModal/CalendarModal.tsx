import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  Portal,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BiLinkAlt } from "react-icons/bi";
import { Button } from "../../Button";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
  isLinkingState,
  refreshState,
  startAnchorState,
  endAnchorState,
  selectedAnchorsState,
} from "../../../global/Atoms";
import "./CalendarModal.scss";
import { MyCalendar } from "~/components/RestaurantView/NodeContent/MyCalendar";
import { DateLocalizer } from "react-big-calendar";
import PropTypes from "prop-types";
import moment from "moment";
import { momentLocalizer } from "react-big-calendar";

export interface ICalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}
// props: ICompleteLinkModalProps
/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CalendarModal = (props: ICalendarModalProps) => {
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
  // Called when the "Submit" button is clicked
  const handleSubmit = async () => {
    handleClose();
  };

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal">
        <ModalOverlay />
        <ModalContent width={"fit-content"} maxWidth={"max-content"}>
          <ModalHeader>My Calendar</ModalHeader>
          <ModalCloseButton />
          <ModalBody width={"fit-content"} maxWidth={"max-content"}>
            <div>
              <strong>
                Drag and Drop an event from one slot to another to move the
                event, or drag the handle of an event to resize the event.
              </strong>
            </div>
            <div>
              <MyCalendar localizer={momentLocalizer(moment)} />
            </div>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button
                text="Add Event"
                icon={<BiLinkAlt />}
                onClick={handleSubmit}
              />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
