import React, { FormEvent, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiMessageSquare } from "react-icons/fi";
import { useSocket } from "../context/socketContext";

const SOCKET_SERVER_URL = "ws://localhost:8787/chat/global";

interface ChatMessage {
  senderName: string;
  body: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { name } = useSocket();

  useEffect(() => {
    if (isOpen) {
      inputRef?.current?.focus();
    }
    if (isOpen && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [isOpen]);

  const [socketState, setSocketStateState] = useState<number>(0);
  const socketRef = useRef<WebSocket>();
  const [hasSentReadyMsg, setHasSentReadyMsg] = useState(false);

  useEffect(() => {
    // todo only send ready msg when open chat bubble
    if (socketState !== 1 || !socketRef.current || hasSentReadyMsg) return;
    console.log("sending ready");
    socketRef.current.send("ready");
    setHasSentReadyMsg(true);
  }, [socketState, hasSentReadyMsg]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const setup = () => {
    const socket = new WebSocket(SOCKET_SERVER_URL);

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (Array.isArray(payload)) {
        const parsedMessages = payload.map((msg) => JSON.parse(msg));
        setMessages((messages) => [...messages, ...parsedMessages]);
        return;
      }
      setMessages((messages) => [...messages, payload]);
    });

    socket.addEventListener("open", (event) => {
      setSocketStateState(socket.readyState);
      socketRef.current = socket;
      console.log("Chat OPEN", event);
    });

    socket.addEventListener("close", (event) => {
      // console.log("setting socket.readyState ", socket.readyState);
      setSocketStateState(socket.readyState);

      console.log(
        "Chat WebSocket closed, todo: reconnecting:",
        event.code,
        event.reason
      );
    });

    socket.addEventListener("error", (event) => {
      console.log("Chat WebSocket error, todo: reconnecting:", event);
      setSocketStateState(socket.readyState);
    });
  };

  useEffect(() => {
    setup();
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const onSubmitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socketRef.current?.send(
      JSON.stringify({
        senderName: name,
        body: inputRef.current?.value || "",
      } as ChatMessage)
    );
    if (inputRef.current?.value) {
      inputRef.current.value = "";
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed left-4 bottom-4">
        <button
          disabled={socketState === 0 || !name}
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-circle shadow-lg"
        >
          <FiMessageSquare color="#fff" size="24" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ animation: "button-pop 0.2s ease-out" }}
      className="fixed left-2 bottom-2 z-50 bg-base-100 shadow-lg"
    >
      <div className="flex flex-col w-80 border-2 rounded-md border-[#1d191924] pt-2 pb-0 focus:outline-none focus-within:ring-1 focus-within:ring-[#1d191924]">
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-primary p-3 btn-ghost absolute top-0 right-0 focus:outline-none focus:ring focus:ring-inset"
        >
          <FiChevronDown size="20" />
        </button>

        <div
          ref={chatBoxRef}
          className="min-h-[165px] max-h-[165px] flex-1 mb-3 overflow-y-scroll px-2"
        >
          {messages.map((message, index) => {
            return (
              <React.Fragment key={index}>
                <p>
                  <b className="font-bold">{message.senderName}</b>:{" "}
                  <span>{message.body}</span>
                </p>
              </React.Fragment>
            );
          })}
        </div>

        <form
          className="prose border-t-2 border-[#1d191924]"
          onSubmit={onSubmitMessage}
        >
          <input
            className=" input h-10 input-ghost w-full border-0 text-base focus:outline-0"
            placeholder="Speak thy mind, friend"
            ref={inputRef}
          />
        </form>
      </div>
    </div>
  );
};
