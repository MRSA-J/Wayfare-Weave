import React, { FormEvent, useState } from "react";
import { IUser } from "../../types";
import { FrontendUserGateway } from "~/users";
import { generateObjectId } from "~/global";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { IEvent } from "../../types";
interface IUserLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLogin: (user: IUser) => void;
}

export const UserLogin = (props: IUserLoginProps) => {
  const { isOpen, onClose } = props;
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const handleUserLogin = async (e: FormEvent) => {
    e.preventDefault();
    const userResp = await FrontendUserGateway.getUser(username, password);
    if (!userResp.success) {
      setLoginError("Incorrect username or password");
      return;
    }
    if (userResp.payload) {
      setLoginError(null);
      setSignUpError(null);
      console.log("user logged in");
      props.onUserLogin(userResp.payload);
      props.onClose();
    }
  };
  const handleClose = () => {
    setSignUpError(null);
    props.onClose();
  };
  const handleUserSignIn = async (e: FormEvent) => {
    e.preventDefault();
    const createUserResp = await FrontendUserGateway.createUser({
      userId: generateObjectId("user"),
      password: password,
      name: username,
      markedRestaurantId: [],
      events: [],
      isAdmin: false,
    });
    if (!createUserResp.success) {
      setSignUpError("Name already exists");
      return;
    }
    setSignUpError(null);
    setLoginError(null);

    // signup login
    if (createUserResp.payload) {
      props.onUserLogin(createUserResp.payload);
      props.onClose();
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {signUpError && <div>{signUpError}</div>}
          {loginError && <div>{loginError}</div>}
          <form onSubmit={handleUserLogin}>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                onChange={(e) => setUserName(e.target.value)}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" mt={4}>
              LOGIN
            </Button>
          </form>
          <form onSubmit={handleUserSignIn}>
            <Button type="submit" colorScheme="green" mt={4}>
              SIGN UP
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
