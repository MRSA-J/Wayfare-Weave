import {
  INode,
  isINode,
  isIRestaurantNode,
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  makeINodePath,
  isINodePath,
  IRestaurantNode,
  ICommentNode,
  isICommentNode,
} from "../types";
import { MongoClient } from "mongodb";

/**
 * NodeCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendNodeGateway. NodeCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendNodeGateway has.
 *
 * For example:
 * NodeCollectionConnection.deleteNode() will only delete a single node.
 * BackendNodeGateway.deleteNode() deletes all its children from the database
 * as well.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class NodeCollectionConnection {
  client: MongoClient;
  collectionName: string;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient;
    this.collectionName = collectionName ?? "nodes";
    this.setupSearchFields();
  }

  /**
   * Inserts a new node into the database
   * Returns successfulServiceResponse with INode that was inserted as the payload
   *
   * @param {INode} node
   * @return successfulServiceResponse<INode>
   */
  async insertNode(node: INode): Promise<IServiceResponse<INode>> {
    if (!isINode(node)) {
      return failureServiceResponse(
        "Failed to insert node due to improper input " +
          "to nodeCollectionConnection.insertNode"
      );
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(node);
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0]);
    }
    return failureServiceResponse(
      "Failed to insert node, insertCount: " + insertResponse.insertedCount
    );
  }

  /**
   * Clears the entire node collection in the database.
   *
   * @return successfulServiceResponse on success
   *         failureServiceResponse on failure
   */
  async clearNodeCollection(): Promise<IServiceResponse<null>> {
    const response = await this.client
      .db()
      .collection(this.collectionName)
      .deleteMany({});
    if (response.result.ok) {
      return successfulServiceResponse(null);
    }
    return failureServiceResponse("Failed to clear node collection.");
  }

  /**
   * Clears the entire node collection in the database.
   *
   * @param {string} nodeId
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async findNodeById(nodeId: string): Promise<IServiceResponse<INode>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ nodeId: nodeId });
    if (findResponse == null) {
      return failureServiceResponse("Failed to find node with this nodeId.");
    } else {
      return successfulServiceResponse(findResponse);
    }
  }

  /**
   * Finds nodes when given a list of nodeIds.
   * Returns successfulServiceResponse with empty array when no nodes found.
   *
   * @param {string[]} nodeIds
   * @return successfulServiceResponse<INode[]>
   */
  async findNodesById(nodeIds: string[]): Promise<IServiceResponse<INode[]>> {
    const foundNodes: INode[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ nodeId: { $in: nodeIds } })
      .forEach(function (doc) {
        foundNodes.push(doc);
      });
    return successfulServiceResponse(foundNodes);
  }

  /**
   * Updates node when given a nodeId and a set of properties to update.
   *
   * @param {string} nodeId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async updateNode(
    nodeId: string,
    updatedProperties: Record<string, unknown>
  ): Promise<IServiceResponse<INode>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { nodeId: nodeId },
        { $set: updatedProperties },
        { returnDocument: "after" }
      );
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value);
    }
    return failureServiceResponse(
      "Failed to update node, lastErrorObject: " +
        updateResponse.lastErrorObject.toString()
    );
  }

  /**
   * Deletes node with the given nodeId.
   *
   * @param {string} nodeId
   * @return successfulServiceResponse<null> on success
   *         failureServiceResponse on failure
   */
  async deleteNode(nodeId: string): Promise<IServiceResponse<null>> {
    const collection = await this.client.db().collection(this.collectionName);
    const deleteResponse = await collection.deleteOne({ nodeId: nodeId });
    if (deleteResponse.result.ok) {
      return successfulServiceResponse(null);
    }
    return failureServiceResponse("Failed to delete");
  }

  /**
   * Deletes nodes when given a list of nodeIds.
   *
   * @param {string[]} nodeIds
   * @return successfulServiceResponse<null> on success
   *         failureServiceResponse on failure
   */
  async deleteNodes(nodeIds: string[]): Promise<IServiceResponse<null>> {
    const collection = await this.client.db().collection(this.collectionName);
    const myquery = { nodeId: { $in: nodeIds } };
    const deleteResponse = await collection.deleteMany(myquery);
    if (deleteResponse.result.ok) {
      return successfulServiceResponse(null);
    }
    return failureServiceResponse("Failed to update nodes");
  }

  /**
   * Find roots from database. Roots are defined as nodes with no parent.
   * Returns empty array when no roots found.
   *
   * @return successfulServiceResponse<INode[]>
   */
  async findRoots(): Promise<IServiceResponse<INode[]>> {
    const roots: INode[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ "filePath.path": { $size: 1 } })
      .forEach(function (node) {
        const validNode = isINode(node);
        if (validNode) {
          roots.push(node);
        }
      });
    return successfulServiceResponse(roots);
  }

  /**
   * Update the path of given node.
   *
   * @param {string} nodeId
   * @param {string[]} newPath
   * @return successfulServiceResponse<null>
   */
  async updatePath(
    nodeId: string,
    newPath: string[]
  ): Promise<IServiceResponse<null>> {
    if (
      !isINodePath(makeINodePath(newPath)) ||
      newPath[newPath.length - 1] !== nodeId
    ) {
      return failureServiceResponse(
        "newPath in nodeCollectionConnection is invalid"
      );
    }
    const updatePathResp = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { nodeId: nodeId },
        { $set: { "filePath.path": newPath } }
      );
    if (updatePathResp.ok && updatePathResp.lastErrorObject.n) {
      return successfulServiceResponse(null);
    }
    return failureServiceResponse(
      "Failed to update node " + nodeId + " filePath.path"
    );
  }

  async setupSearchFields(): Promise<IServiceResponse<null>>{
    // const setupResp = await this.client
    //   .db()
    //   .collection(this.collectionName)
    //   .createIndex({
    //     "title": 'text',
    //     "content": "text"
    //   });
    try {
      let getIndexesResp = await this.client
      .db()
      .collection(this.collectionName)
      .indexes();
      let indexes = [];
      
      for (const index of getIndexesResp) {
        if (index.name !== '_id_') {
          indexes.push(index.name);
          await this.client
            .db()
            .collection(this.collectionName)
            .dropIndex(index.name);
        }
      }
      console.log("Delete previous indexes: " + JSON.stringify(indexes));

      await this.client
        .db()
        .collection(this.collectionName)
        .createIndex({
          title: 'text',
          content: 'text'
        });

      getIndexesResp = await this.client
        .db()
        .collection(this.collectionName)
        .indexes();

      indexes = [];

      for (const index of getIndexesResp) {
        if (index.name !== '_id_') {
          indexes.push(index.name);
        }
      }

      console.log("Created indexes: " + JSON.stringify(indexes));
      return successfulServiceResponse(null);
    } catch (error) {
      console.log("Error: " + error);
      console.log("This is normal when database is just initialized");
    }
  }

  /**
   * Search nodes by query string
   */
  async searchNodes(
    query: string
  ): Promise<IServiceResponse<any>> {
    try {
      const searchResp = await this.client
        .db()
        .collection(this.collectionName)
        .find(
          { $text: { $search: query } } as Record<string, any>,
          { score: { $meta: 'textScore' } } as Record<string, any>
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray();
      // If the function call was successful, you can use the result here
      return successfulServiceResponse(searchResp);
    } catch (error) {
      // If an error occurs, it will be caught here
      console.error('Search failed:', error);
      return failureServiceResponse(error);
    }
  }

  // ***************************************************************************
  
    /**
   * Find roots from database. Roots are defined as nodes with no parent.
   * Returns empty array when no roots found.
   *
   * @return successfulServiceResponse<INode[]>
   */
    async findAllRestaurants(): Promise<IServiceResponse<IRestaurantNode[]>> {
      const restaurants: IRestaurantNode[] = [];
      await this.client
        .db()
        .collection(this.collectionName)
        .find({ "type": "restaurant" })
        .forEach(function (node) {
          if (isIRestaurantNode(node)) {
            restaurants.push(node);
          }
        });
      return successfulServiceResponse(restaurants);
    }

  /**
   * Find all nodes from database.
   * Returns empty array when no nodes found.
   *
   * @return successfulServiceResponse<INode[]>
   */
  async findAllNodes(): Promise<IServiceResponse<INode[]>> {
    const nodes: INode[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find()
      .forEach(function (node) {
        nodes.push(node)
      });
    return successfulServiceResponse(nodes);
  }

  /**
   * Find roots from database. Roots are defined as nodes with no parent.
   * Returns empty array when no roots found.
   *
   * @return successfulServiceResponse<INode[]>
   */
  async findCommentsByCommentToId(nodeId: string): Promise<IServiceResponse<ICommentNode[]>> {
    const comments: ICommentNode[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ "commentTo": nodeId })
      .forEach(function (node) {
        if (isICommentNode(node)) {
          comments.push(node);
        }
      });
    return successfulServiceResponse(comments);
  }
}
