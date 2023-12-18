import { useRecoilState } from "recoil";
import { nodeIdsToNodesMapState, nodeIdsToParentIdsMapState } from "~/global/Atoms";
import "./RestaurantImages.scss"
import { FrontendNodeGateway } from "~/nodes";
import { NodeIdsToNodesMap, NodeIdsToParentIdsMap } from "~/types";

interface ImagesProps {
    imageIds: string[];
    removeImageId: (id: string) => void;
}

export const RestaurantImages = (props: ImagesProps) => {
    const { imageIds, removeImageId } = props;
    const [nodeIdsToNodesMap, setNodeIdsToNodesMap] = useRecoilState(nodeIdsToNodesMapState);

    const handleDeleteImage = async (id: string) => {
        const deleteResp = await FrontendNodeGateway.deleteNode(id);
        if (!deleteResp.success) {
            console.log("Error " + deleteResp.message);
            return;
        }
        const newNodeIdsToNodesMap: NodeIdsToNodesMap = {};
        for (const key of Object.keys(nodeIdsToNodesMap)) {
            if (key != id) {
                newNodeIdsToNodesMap[key] = nodeIdsToNodesMap[key];
            }
        }
        
        removeImageId(id);
        setNodeIdsToNodesMap(newNodeIdsToNodesMap);
    }

    return (
        <div>
            {imageIds.map((id) => (
                nodeIdsToNodesMap && nodeIdsToNodesMap[id] && 
                <div className="preview-wrapper" key={id}>
                    <img className="preview" src={nodeIdsToNodesMap[id].content} alt={`Image ${id}`} />
                    <div className="delete-button" onClick={() => handleDeleteImage(id)}>
                        delete
                    </div>
                </div>
            ))}
        </div>
    );
};