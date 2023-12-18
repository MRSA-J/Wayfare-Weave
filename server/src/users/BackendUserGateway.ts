import { MongoClient } from "mongodb";
import {
  IUser,
  IServiceResponse,
  failureServiceResponse,
  isIUser,
  successfulServiceResponse,
} from "../types";
import { UserCollectionConnection } from "./UserCollectionConnection";
import { IUserProperty, isIUserProperty } from "../types/IUserProperty";

/**
 * BackendUserGateway handles requests from UserRouter, and calls on methods
 * in UserCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 *
 * Example:
 * Before insertion, BackendUserGateway.createUser() will check whether the database
 * already contains a user with the same name. In comparison, the UserCollectionConnection.insertNode()
 * method simply retrieves the user object, and inserts it into the database.
 */
export class BackendUserGateway {
  userCollectionConnection: UserCollectionConnection;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? "users"
    );
  }

  /**
   * Method to create a user and insert it into the database.
   *
   * @param userId - The userId of the user to be created.
   */
  async createUser(user: any): Promise<IServiceResponse<IUser>> {
    // check whether is valid User
    const isValidUser = isIUser(user);
    if (!isValidUser) {
      return failureServiceResponse("Not a valid user.");
    }
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserByName(
      user.name
    );
    if (userResponse.success) {
      return failureServiceResponse(
        "User with duplicate name already exist in database."
      );
    }
    // if everything checks out, insert user
    const insertUserResp = await this.userCollectionConnection.insertUser(user);
    return insertUserResp;
  }

  /**
   * Method to update the node with the given nodeId.
   * @param nodeId the nodeId of the node
   * @param toUpdate an array of INodeProperty
   *
   * @returns IServiceResponse<INode>
   */
  async updateUser(
    userId: string,
    toUpdate: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> {
    const properties = {};
    for (let i = 0; i < toUpdate.length; i++) {
      if (!isIUserProperty(toUpdate[i])) {
        return failureServiceResponse("toUpdate parameters invalid");
      }
      const fieldName = toUpdate[i].fieldName;
      const value = toUpdate[i].value;
      properties[fieldName] = value;
    }
    const nodeResponse = await this.userCollectionConnection.updateUser(
      userId,
      properties
    );
    if (!nodeResponse.success) {
      return failureServiceResponse(
        "This node does not exist in the database!"
      );
    }
    return nodeResponse;
  }

  /**
   * Method to login with a given username and password.
   *
   * @param name - The name of the user for login purposes.
   * @param password - The password of the user for login purposes.
   * @returns IServiceResponse<IUser>
   */
  async getUserByNameAndPassword(
    name: string,
    password: string
  ): Promise<IServiceResponse<IUser>> {
    const userResponse = await this.userCollectionConnection.findUserByName(
      name
    );
    if (!userResponse.success) {
      return failureServiceResponse(
        "Unable to find user with the username " + name + " in database."
      );
    }
    if (userResponse.payload.password !== password) {
      return failureServiceResponse("Password is incorrect.");
    }
    return successfulServiceResponse(userResponse.payload);
  }
}
