import React from "react";
import { Button } from "../Button";
import * as ri from "react-icons/ri";
import * as ai from "react-icons/ai";
import * as pi from "react-icons/pi";
import * as cg from "react-icons/cg";
import * as mp from "react-icons/fa6";
import { GiExitDoor } from "react-icons/gi";

import { IUser } from "../../types";
import Link from "next/link";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  isLinkingState,
  startAnchorState,
  selectedExtentState,
  selectedNodeState,
  userState,
} from "../../global/Atoms";
import "./Header.scss";

interface IHeaderProps {
  onCreateNodeButtonClick: () => void;
  // TODO: modeified add function
  // onVisualizeNodeButtonClick: () => void;
  // TODO: modeified add Search function
  onSearchButtonClick: () => void;
  // END
  onHomeClick: () => void;
  //user login/logout
  onLoginButtonClick: () => void;
  onLogoutButtonClick: () => void;
  onMapButtonClick: () => void;
  onCalendarButtonClick: () => void;
}

export const Header = (props: IHeaderProps) => {
  const {
    onCreateNodeButtonClick,
    // onVisualizeNodeButtonClick,
    onHomeClick,
    onMapButtonClick,
    onSearchButtonClick,
    onLoginButtonClick,
    onLogoutButtonClick,
    onCalendarButtonClick,
  } = props;
  const [user, setUser] = useRecoilState(userState);
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 };
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState);
  const setStartAnchor = useSetRecoilState(startAnchorState);
  const selectedNode = useRecoilValue(selectedNodeState);

  const handleCancelLink = () => {
    setStartAnchor(null);
    setIsLinking(false);
  };

  return (
    <div className={isLinking ? "header-linking" : "header"}>
      <div className="left-bar">
        <Link href={"/"}>
          <div className="name" onClick={onHomeClick}>
            WayFare<b>Weave</b>
          </div>
        </Link>
        <Link href={"/"}>
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<mp.FaMapLocationDot />}
          onClick={onMapButtonClick}
        />
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
        {/* <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<pi.PiGraphFill />}
          onClick={onVisualizeNodeButtonClick}
        /> */}
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<pi.PiCalendar />}
          onClick={onCalendarButtonClick}
        />

        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<cg.CgSearchLoading />}
          onClick={onSearchButtonClick}
        />
      </div>
      <div className="right-bar">
        {isLinking && selectedNode && (
          <div className="link-cancel-wrapper">
            <div>
              Linking from <b>{selectedNode.title}</b>
            </div>
            <Button
              onClick={handleCancelLink}
              isWhite
              text="Cancel"
              style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
              icon={<ri.RiCloseLine />}
            />
          </div>
        )}
        {/* login/out */}
        {user ? (
          <div className="userLoginWraper">
            <div style={{ width: "100%" }}>Welcome, {user.name}!</div>
            <div
              className="exitButton"
              onClick={() => {
                onLogoutButtonClick();
              }}
            >
              <GiExitDoor style={{ margin: 5 }} />
            </div>
          </div>
        ) : (
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<cg.CgUser />}
            onClick={onLoginButtonClick}
          />
        )}
      </div>
    </div>
  );
};
