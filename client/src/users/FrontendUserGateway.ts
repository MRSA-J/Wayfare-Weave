import { failureServiceResponse, IUser, IServiceResponse } from "../types";
import { endpoint, post, put, remove } from "../global";
import { IUserProperty } from "~/types/IUserProperty";

/** In development mode (locally) the server is at localhost:8000*/
const baseEndpoint = endpoint;

/** This is the path to the users microservice */
const servicePath = "user/";

export const FrontendUserGateway = {
  getUser: async (
    name: string,
    password: string
  ): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + "login",
        {
          name: name,
          password: password,
        }
      );
    } catch (exception) {
      return failureServiceResponse("[getUser] Unable to access backend");
    }
  },

  createUser: async (user: IUser): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + "signin",
        {
          user: user,
        }
      );
    } catch (exception) {
      return failureServiceResponse("[createUser] Unable to access backend");
    }
  },

  updateUser: async (
    userId: string,
    user: IUser
  ): Promise<IServiceResponse<IUser>> => {
    try {
      return await put<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + userId,
        {
          user: user,
        }
      );
    } catch (exception) {
      return failureServiceResponse("[updateUser] Unable to access backend");
    }
  },

  deleteUser: async (userId: string): Promise<IServiceResponse<object>> => {
    try {
      return await remove<IServiceResponse<object>>(
        baseEndpoint + servicePath + userId
      );
    } catch (exception) {
      return failureServiceResponse("[deleteUser] Unable to access backend");
    }
  },

  updateUserInfo: async (
    userId: string,
    properties: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> => {
    try {
      return await put<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + "update/" + userId,
        {
          data: properties,
        }
      );
    } catch (exception) {
      return failureServiceResponse("[updateUser] Unable to access backend");
    }
  },
};
