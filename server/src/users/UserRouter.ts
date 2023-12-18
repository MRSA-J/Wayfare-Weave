import express, { Request, Response, Router } from "express";
import { MongoClient } from "mongodb";
import { IUser, isIUser, IServiceResponse } from "../types";
import { BackendUserGateway } from "./BackendUserGateway";
import { IUserProperty } from "../types/IUserProperty";
import { json } from "body-parser";
const bodyJsonParser = json();

export const UserExpressRouter = express.Router();

/**
 * UserRouter uses UserExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/user'.
 * E.g. a post request to '/user/create' would create a user.
 * The UserRouter contains a BackendUserGateway so that when an HTTP request
 * is received, the UserRouter can call specific methods on BackendUserGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up UserRouter - you don't need to know the details of this just yet.
 */
export class UserRouter {
  BackendUserGateway: BackendUserGateway;

  constructor(mongoClient: MongoClient) {
    this.BackendUserGateway = new BackendUserGateway(mongoClient);

    /**
     * Request to create user
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.post("/signin", async (req: Request, res: Response) => {
      try {
        const user = req.body.user;
        if (!isIUser(user)) {
          res.status(400).send("not IUser!");
        } else {
          const response = await this.BackendUserGateway.createUser(user);
          res.status(200).send(response);
        }
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    /**
     * Request to retrieve user by username and password
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.post("/login", async (req: Request, res: Response) => {
      try {
        const { name, password } = req.body;
        const response: IServiceResponse<IUser> =
          await this.BackendUserGateway.getUserByNameAndPassword(
            name,
            password
          );
        res.status(200).send(response);
        // res.status(200);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    // /**
    //  * Request to update the node with the given nodeId
    //  *
    //  * @param req request object coming from client
    //  * @param res response object to send to client
    //  */
    // UserExpressRouter.put(
    //   "/:userId",
    //   bodyJsonParser,
    //   async (req: Request, res: Response) => {
    //     try {
    //       const userId = req.params.userId;
    //       const toUpdate: IUserProperty[] = req.body.data;
    //       const response = await this.BackendNodeGateway.updateNode(
    //         nodeId,
    //         toUpdate
    //       );
    //       res.status(200).send(response);
    //     } catch (e) {
    //       res.status(500).send(e.message);
    //     }
    //   }
    // );

    // /**
    //  * Request to delete the node with the given nodeId
    //  *
    //  * @param req request object coming from client
    //  * @param res response object to send to client
    //  */
    // NodeExpressRouter.delete(
    //   "/:nodeId",
    //   async (req: Request, res: Response) => {
    //     try {
    //       const nodeId = req.params.nodeId;
    //       const response = await this.BackendNodeGateway.deleteNode(nodeId);
    //       res.status(200).send(response);
    //     } catch (e) {
    //       res.status(500).send(e.message);
    //     }
    //   }
    // );
    /**
     * Request to update the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */

    UserExpressRouter.put(
      "/update/:userId",
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const userId = req.params.userId;
          const toUpdate: IUserProperty[] = req.body.data;
          const response = await this.BackendUserGateway.updateUser(
            userId,
            toUpdate
          );
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );
  }
  /**
   * @returns UserRouter class
   */
  getExpressRouter = (): Router => {
    return UserExpressRouter;
  };
}
