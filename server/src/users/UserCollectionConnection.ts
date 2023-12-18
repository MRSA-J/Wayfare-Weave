import {
  IServiceResponse,
  IUser,
  failureServiceResponse,
  isIUser,
  successfulServiceResponse,
} from "../types";
import { MongoClient } from "mongodb";

/**
 * UserCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendUserGateway. UserCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendUserGateway has.
 *
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class UserCollectionConnection {
  client: MongoClient;
  collectionName: string;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient;
    this.collectionName = collectionName ?? "users";
  }

  /**
   * Inserts a new user into the database
   * Returns successfulServiceResponse with IUser that was inserted as the payload
   *
   * @param {IUser} user
   * @return successfulServiceResponse<IUser>
   */
  async insertUser(user: IUser): Promise<IServiceResponse<IUser>> {
    if (!isIUser(user)) {
      return failureServiceResponse(
        "Failed to insert user due to improper input " +
          "to userCollectionConnection.insertUser"
      );
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(user);
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0]);
    }
    return failureServiceResponse(
      "Failed to insert user, insertCount: " + insertResponse.insertedCount
    );
  }

  /**
   * Find the user with the given username.
   *
   * @param {string} name
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserByName(name: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ name: name });
    if (findResponse == null) {
      return failureServiceResponse("Failed to find user with this username.");
    } else {
      return successfulServiceResponse(findResponse);
    }
  }
  /**
   * Updates node when given a nodeId and a set of properties to update.
   *
   * @param {string} nodeId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async updateUser(
    userId: string,
    updatedProperties: Record<string, unknown>
  ): Promise<IServiceResponse<IUser>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { userId: userId },
        { $set: updatedProperties },
        { returnDocument: "after" }
      );
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value);
    }
    return failureServiceResponse(
      "Failed to update user, lastErrorObject: " +
        updateResponse.lastErrorObject.toString()
    );
  }
}
