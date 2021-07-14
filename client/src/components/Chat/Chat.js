import React, { useState, useContext, useEffect } from "react";
import Axios from "axios";
import { useHistory } from "react-router-dom";
import NavBar from "./ChatElements/NavBar/NavBar";
import Header from "./ChatElements/Header/Header";
import Messages from "./ChatElements/Messages/Messages";
import InputMessage from "./ChatElements/InputMessage/InputMessage";
import UserContext from "../../context/UserContext";
import { SocketContext } from "../../context/SocketContext";
import "./Chat.css";

const Chat = () => {
  //#region Instances
  const [newArrivalMessage, setNewArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);

  const { userData, setUserData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);
  const history = useHistory();
  //#endregion

  //#region useEffects

  useEffect(() => {
    //push to login if the user has no token
    if (!userData.user) {
      setUserData({
        token: undefined,
        user: undefined,
      });
      localStorage.setItem("auth-Token", "");
      history.push("/");
    }

    //init the new messaga
    socket.on("newArrivalMessageToClient", (data) => {
      setNewArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [socket, history, setUserData, userData.user]);


  
  useEffect(() => {
    //get the user that send the new message
    const getSender = async () => {
      const result = await Axios.get(
        `${process.env.REACT_APP_SERVER_URL}private/${newArrivalMessage.sender}`,
        { headers: { Authorization: localStorage.getItem("auth-Token") } }
      );
      return result.data;
    };

    //add the new message to the array of all the messages
    newArrivalMessage &&
      getSender().then((res) => {
        if (currentChat?.members.map((m) => m._id === res._id)) {
          newArrivalMessage && setMessages((prev) => [...prev, newArrivalMessage]);
        }
      });
  }, [newArrivalMessage, currentChat]);

  
  useEffect(() => {
    const getMessages = async () => {
      try {
        const result = await Axios.get(
          `${process.env.REACT_APP_SERVER_URL}messages/${currentChat?._id}`
        );
        setMessages(result.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  
  //#endregion


  return (
    <>
      <div className="chat-continer">
        <nav className="chat-nav">
          <NavBar
            setCurrentChat={setCurrentChat}
          />
        </nav>

        {currentChat ? (
          <>
            <header className="chat-header">
              <Header
                currentChat={currentChat}
                setCurrentChat={setCurrentChat}
              />
            </header>

            <section className="chat-group">
              <Messages
                messages={messages}
                user={userData.user}
              />

              <InputMessage
                currentChat={currentChat}
                messages={messages}
                setMessages={setMessages}
              />
            </section>
          </>
        ) : (
          <section className="chat-group">
            <div className="no-chat">No chat selected</div>
          </section>
        )}
      </div>
    </>
  );
};

export default Chat;

