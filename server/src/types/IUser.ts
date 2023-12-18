// IUser with user metadata
export interface IEvent {
  start: Date;
  end: Date;
  title: string;
}
export interface IUser {
  userId: string;
  name: string;
  password: string;
  markedRestaurantId: string[];
  events: IEvent[];
  isAdmin: boolean;
  dateCreated?: Date; // date that the node was created
}

export function isIUser(object: any): object is IUser {
  const propsDefined: boolean =
    typeof (object as IUser).userId !== "undefined" &&
    typeof (object as IUser).name !== "undefined" &&
    typeof (object as IUser).password !== "undefined" &&
    typeof (object as IUser).markedRestaurantId !== "undefined" &&
    typeof (object as IUser).events !== "undefined" &&
    typeof (object as IUser).isAdmin !== "undefined";

  if (propsDefined) {
    // check if all fields have the right type
    // and verify if filePath.path is properly defined
    return (
      typeof (object as IUser).userId === "string" &&
      typeof (object as IUser).name === "string" &&
      typeof (object as IUser).password === "string" &&
      typeof (object as IUser).isAdmin === "boolean"
    );
  }
}
