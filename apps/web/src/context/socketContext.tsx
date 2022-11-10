import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SOCKET_SERVER_URL = "wss://broccoli.vittis.workers.dev/socket";

interface SocketContextType {
  ready: boolean;
  socket: WebSocket | undefined;
  clientId: string | undefined;
  members: { [key: string]: any };
  name: string;
}

const SocketContext = createContext<SocketContextType>({
  ready: false,
  socket: undefined,
  clientId: undefined,
  members: {},
  name: "",
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [clientId, setClientId] = useState<string>("");
  const [members, setMembers] = useState<any>({});

  const [socketState, setSocketStateState] = useState<number>(0);
  const socketRef = useRef<WebSocket>();

  const setup = () => {
    const socket = new WebSocket(SOCKET_SERVER_URL);

    socket.addEventListener("message", (event) => {
      /* console.log("Message received from server");
      console.log(event.data);
      console.log("---"); */

      const parsedEvent = JSON.parse(event.data);
      if (parsedEvent.eventName === "receiveInfo") {
        console.log("receiveInfo");
        const {
          payload: { id, sessions },
        } = parsedEvent;

        if (!id) {
          throw Error("No id received");
        }
        if (!sessions) {
          throw Error("No sessions received");
        }
        console.log("setting id", id);
        setMembers(sessions);
        setClientId(id);
      }

      if (parsedEvent.eventName === "receiveMembersInfo") {
        console.log("receiveMembersInfo");
        const {
          payload: { sessions },
        } = parsedEvent;
        if (!sessions) {
          throw Error("No sessions received");
        }
        setMembers(sessions);
      }
    });

    socket.addEventListener("open", (event) => {
      // console.log("setting socket.readyState ", socket.readyState);
      setSocketStateState(socket.readyState);
      socketRef.current = socket;
      console.log("OPEN", event);
      socket.send("askInfo");
    });

    socket.addEventListener("close", (event) => {
      // console.log("setting socket.readyState ", socket.readyState);
      setSocketStateState(socket.readyState);

      console.log(
        "WebSocket closed, todo: reconnecting:",
        event.code,
        event.reason
      );
    });

    socket.addEventListener("error", (event) => {
      console.log("setting socket.readyState ", socket.readyState);
      setSocketStateState(socket.readyState);

      console.log("WebSocket error, todo: reconnecting:", event);
    });
  };

  useEffect(() => {
    setup();
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const state = useMemo(() => {
    return {
      ready: socketState === 1 && !!clientId,
      clientId,
      socket: socketRef.current,
      members,
      name: members?.[clientId]?.name || "",
    };
  }, [socketState, clientId, members]);

  //console.log("RENDER PROVIDER", { clientState });

  return (
    <SocketContext.Provider value={state}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
