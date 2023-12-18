import { useEffect, useState } from "react";
import {
  RecursiveNodeTree,
  makeICommentNode,
  ICommentNode,
  traverseTree,
  makeINodePath,
} from "~/types";
import { FrontendNodeGateway } from "~/nodes";
import { generateObjectId } from "~/global";
import { ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import { refreshState } from "~/global/Atoms";

interface CommentBoardProps {
  tree: RecursiveNodeTree;
}

const CommentBoard: React.FC<CommentBoardProps> = (props) => {
  const { tree } = props;
  const defaultComment = makeICommentNode("", "comment", [], "", "");
  const [newComment, setNewComment] = useState<ICommentNode>(defaultComment);
  const [blockType, setBlockType] = useState<string>("text");
  const [commentToObjects, setCommentToObjects] = useState<string[]>();
  const [refresh, setRefresh] = useRecoilState(refreshState);

  const addBlock = () => {
    const content = newComment.content;
    content.push(blockType + "|");
    setNewComment({
      ...newComment,
      content: content,
    });
  };

  const handleCommentChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewComment({
      ...newComment,
      [name]: value,
    });
  };

  const handleCommentSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const nodeId = generateObjectId(newComment.type);
    const submitComment = {
      ...newComment,
      nodeId: nodeId,
      filePath: makeINodePath([nodeId], []),
    };
    setNewComment(defaultComment);

    console.log(submitComment);
    const createNodeResp = await FrontendNodeGateway.createNode(submitComment);
    if (!createNodeResp.success) {
      console.error(createNodeResp.message);
      return;
    }
    console.log(createNodeResp.payload);
    setRefresh(!refresh);
  };

  interface ShowChildrenCommentsProps {
    nodeTree: RecursiveNodeTree;
  }

  const ShowChildrenComments: React.FC<ShowChildrenCommentsProps> = (props) => {
    const { nodeTree } = props;
    return (
      <div>
        <div>{JSON.stringify(nodeTree.node)}</div>
        <br />
        <ul>
          {nodeTree.children.map((child) => (
            <li key={child.node.nodeId}>
              <ShowChildrenComments nodeTree={child} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    const commentPosibleIds: string[] = [];
    traverseTree(tree, (parent) => {
      commentPosibleIds.push(parent.node.nodeId);
    });
    if (commentPosibleIds.length > 0) {
      setCommentToObjects(commentPosibleIds);
    }
    setNewComment({
      ...newComment,
      commentTo: tree.node.nodeId,
    });
  }, [refresh, tree]);

  return (
    <div>
        {commentToObjects ? (
            <div>
            {/* Comments */}
            <h2>Discussion Board</h2>
            <div style={{ backgroundColor: "lightcyan", flexDirection: "column" }}>
                <div>
                <label>comment to: </label>
                <select
                    style={{ border: "1px solid" }}
                    name="commentTo"
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setNewComment({
                        ...newComment,
                        commentTo: e.target.value,
                    });
                    console.log(e.target.value);
                    console.log(newComment);
                    }}
                >
                    {commentToObjects.map((id: string, i) => {
                    return (
                        <option value={id} key={i}>
                        {id}
                        </option>
                    );
                    })}
                </select>
                </div>
                <div>
                <label style={{ marginRight: 20 }}>select type:</label>
                <select
                    style={{ border: "1px solid" }}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setBlockType(e.target.value);
                    }}
                >
                    <option value="text">text</option>
                    <option value="image">image</option>
                </select>
                </div>
                <div>
                <label>createdBy: </label>
                <input
                    name="createdBy"
                    value={newComment.createdBy}
                    onChange={handleCommentChange}
                    style={{ margin: 5, border: "1px solid" }}
                />
                </div>
                {newComment.content.map((block: string, i: number) => {
                if (block.split("|")[0] === "text") {
                    return (
                    <div key={i}>
                        <label>{block.split("|")[0]}: </label>
                        <input
                        value={block.substring(5)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const content = newComment.content;
                            content[i] = block.split("|")[0] + "|" + e.target.value;
                            setNewComment({
                            ...newComment,
                            content,
                            });
                        }}
                        />
                    </div>
                    );
                } else {
                    return (
                    <div key={i}>
                        <label>{block.split("|")[0]}: </label>
                        <input
                        value={block.substring(6)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const content = newComment.content;
                            content[i] = block.split("|")[0] + "|" + e.target.value;
                            setNewComment({
                            ...newComment,
                            content,
                            });
                        }}
                        />
                    </div>
                    );
                }
                })}
                <div>
                <button
                    style={{
                    margin: 10,
                    padding: 5,
                    backgroundColor: "lightgrey",
                    border: "1px solid",
                    }}
                    onClick={addBlock}
                >
                    Add Block
                </button>
                <button
                    style={{
                    margin: 10,
                    padding: 5,
                    backgroundColor: "lightgreen",
                    border: "1px solid",
                    }}
                    onClick={handleCommentSubmit}
                >
                    submit
                </button>
                </div>
                <ShowChildrenComments nodeTree={tree} />
            </div>
            </div>
        
        ):(<div />)}
    </div>
  )
};

export default CommentBoard;
