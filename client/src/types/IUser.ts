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

export function makeIUser(
  userId: string,
  name: string,
  password: string,
  markedRestaurantId: string[],
  events: IEvent[],
  isAdmin: boolean,
  dateCreated: Date
): IUser {
  return {
    userId: userId,
    name: name,
    password: password,
    markedRestaurantId: markedRestaurantId,
    events: events,
    isAdmin: isAdmin,
    dateCreated: dateCreated,
  };
}
