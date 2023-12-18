import { IUser } from "./IUser";

type UserFields = keyof IUser;

//Modified: add IImageNode's metaheight. metawidth and curheight, curwidth
export const allUserFields: string[] = [
  "userId",
  "name",
  "password",
  "markedRestaurantId",
  "events",
  "isAdmin",
];

export interface IUserProperty {
  fieldName: UserFields;
  value: any;
}

export function makeIUserProperty(
  fieldName: UserFields,
  newValue: any
): IUserProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  };
}

export function isIUserProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as IUserProperty).fieldName !== "undefined" &&
    typeof (object as IUserProperty).value !== "undefined";
  if (
    propsDefined &&
    allUserFields.includes((object as IUserProperty).fieldName)
  ) {
    switch ((object as IUserProperty).fieldName) {
      case "userId":
        return typeof (object as IUserProperty).value === "string";
      case "name":
        return typeof (object as IUserProperty).value === "string";
      case "password":
        return typeof (object as IUserProperty).value === "string";
      case "isAdmin":
        return typeof (object as IUserProperty).value === "boolean";
      default:
        return true;
    }
  }
  return false;
}
