import React from "react";
import Message from "./Message/Message";
import "./Messages.css";

const Messages = ({ messages, user, scrollRef }) => {
  return (
    <div className="chats">
        {messages.map((message, i) => (
          <div key={i} ref={scrollRef}>
            <Message message={message} user={user} />
          </div>
        ))}
    </div>
  );
};

export default Messages;
