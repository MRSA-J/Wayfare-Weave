import { useSetRecoilState } from "recoil";
import { 
    alertMessageState, 
    alertOpenState, 
    alertTitleState 
} from "~/global/Atoms";
import { IImageNode, INode } from "~/types";
import { TextContent } from "../../TextContent";
import { ImageContent } from "../../ImageContent";
import { useEffect } from "react";

interface commentContentProps {
    contentNode: INode;
    editeState: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}

export const CommentContent: React.FC<commentContentProps> = (props: commentContentProps) => {
    const { contentNode, editeState, setIsEditing } = props;
    const setAlertOpen = useSetRecoilState(alertOpenState);
    const setAlertTitle = useSetRecoilState(alertTitleState);
    const setAlertMessage = useSetRecoilState(alertMessageState);

    switch (contentNode.type) {
        case 'text':
            return <TextContent node={contentNode} isEditing={editeState} setIsEditing={setIsEditing}/>   
        case 'image':
            if (editeState) {
                return <ImageContent currentNode={contentNode as IImageNode} size={"300px"} />
            } else {
                return <img src={contentNode.content} alt={contentNode.nodeId} style={{width: "50px", height: "50px"}}/>
            }
        default:
            setAlertOpen(true);
            setAlertTitle("Unexpected data");
            setAlertMessage("Unexpected data type of node\n" + contentNode.type);
            return null;
    }
}