import { CiImageOn } from "react-icons/ci";
import { AiOutlineSend } from "react-icons/ai";
import "./InputBox.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { 
    commentToIdsToCommentIdsMapState, 
    alertMessageState, 
    alertOpenState, 
    alertTitleState, 
    nodeIdsToNodesMapState, 
    nodeIdsToParentIdsMapState, 
    selectedRestaurantState, 
    userState, 
    refreshState
} from "~/global/Atoms";
import React, { CSSProperties, ReactNode, useRef, useState } from "react";
import { MdCleaningServices } from "react-icons/md";
import { FrontendNodeGateway } from "~/nodes";
import { INode, makeICommentNode, makeIImageNode, makeINode } from "~/types";
import { generateObjectId } from "~/global";

interface InputBoxButtonProps {
    icon: ReactNode;
    clickFunc: () => void;
}
export const InputBoxButton: React.FC<InputBoxButtonProps> = ({icon, clickFunc}) => {
    return (
    <div className="icon-wrapper" onClick={clickFunc}>
        {icon}
    </div>
)};

interface InputBoxProps {
    setIsReplying?: React.Dispatch<React.SetStateAction<boolean>>;
    commentTo?: string;
}

export const InputBox = (props: InputBoxProps) => {
    const { setIsReplying, commentTo } = props;
    const user = useRecoilValue(userState);
    const [comment, setComment] = useState<string>("");
    const selectedRestaurant = useRecoilValue(selectedRestaurantState);
    const setAlertOpen = useSetRecoilState(alertOpenState);
    const setAlertTitle = useSetRecoilState(alertTitleState);
    const setAlertMessage = useSetRecoilState(alertMessageState);
    const [nodeIdsToNodesMap, setNodeIdsToNodesMap] = useRecoilState(nodeIdsToNodesMapState);
    const [nodeIdsToParentIdsMap, setNodeIdsToParentIdsMap] = useRecoilState(nodeIdsToParentIdsMapState);
    const [commentToIdsToCommentIdsMap, setCommentToIdsToCommentIdsMap] = useRecoilState(commentToIdsToCommentIdsMapState);
    const [refresh, setRefresh] = useRecoilState(refreshState);

    const handleClean = () => {
        setComment("");
    }

    const handleSendClick = async () => {
        if (user) {
            const textNodeId = generateObjectId('text');
            const textNode = makeINode(
                textNodeId,
                [textNodeId],
                [],
                'text',
                'comment',
                comment
            )
            const uploadCommentContentResp = await FrontendNodeGateway.createNode(textNode);
            if (!uploadCommentContentResp.success) {
                setAlertOpen(true);
                setAlertTitle("Unsuccessful upload");
                setAlertMessage("Unable to upload comment");
                return;
            }
            const commentId = generateObjectId('comment');
            const commentNode = makeICommentNode(
                commentId,
                'comment',
                [textNodeId],
                commentTo ?? selectedRestaurant.nodeId,
                user.name
            );
            const uploadCommentResp = await FrontendNodeGateway.createNode(commentNode);
            if (!uploadCommentResp.success) {
                setAlertOpen(true);
                setAlertTitle("Unsuccessful upload");
                setAlertMessage("Unable to upload comment");
                return;
            }
            setNodeIdsToNodesMap({
                ...nodeIdsToNodesMap,
                [textNodeId]:textNode,
                [commentId]:commentNode
            });
            setNodeIdsToParentIdsMap({
                ...nodeIdsToParentIdsMap,
                [textNodeId]:commentId,
                [commentId]:commentTo ?? selectedRestaurant.nodeId
            });
            const newCommentToIdsToCommentIdsMap = {...commentToIdsToCommentIdsMap};
            const finalCommentTo = commentTo ?? selectedRestaurant.nodeId;
            if (commentToIdsToCommentIdsMap.hasOwnProperty(finalCommentTo)) {
                newCommentToIdsToCommentIdsMap[finalCommentTo] = [...commentToIdsToCommentIdsMap[finalCommentTo], commentId];
            } else {
                newCommentToIdsToCommentIdsMap[finalCommentTo] = [commentId];
            }
            
            setCommentToIdsToCommentIdsMap(newCommentToIdsToCommentIdsMap);
            setComment("");
            setIsReplying && setIsReplying(false);
            setRefresh(!refresh);
        }
    }

    const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.shiftKey) {
                setComment(comment+'\n');
            } else {
                handleSendClick();
            }
        }
    }

    return (
        <div className="input-box-wrapper">
            {/* <div
                className= {user ? "editable-container" :"editable-container-inactivate"} 
                ref={divRef}
                contentEditable= {user ? "true" : "false"}
            /> */}
            
            {user ? (
                <textarea 
                    className="editable-container"
                    onChange={(e) => {setComment(e.target.value)}}
                    value={comment}
                    onKeyDown={handleEnterKeyDown}
                    placeholder="Type your comment here..."
                /> 
            ) : (
                <div className="editable-container-inactivate">
                    login/Sign up first to leave a comment
                </div>
            )}
            <div className="input-box-footer">
                <InputBoxButton icon={<MdCleaningServices />} clickFunc={handleClean} />
                <InputBoxButton  icon={<AiOutlineSend />} clickFunc={handleSendClick}/>
            </div>
        </div>
    )
}