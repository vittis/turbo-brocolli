import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SOCKET_SERVER_URL = "ws://localhost:8787/socket";

interface SocketContextType {
  socketState: number;
  socket: WebSocket | undefined;
}

const SocketContext = createContext<SocketContextType>({
  socketState: 0,
  socket: undefined,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socketState, setSocketStateState] = useState<number>(0);

  const socketRef = useRef<WebSocket>();

  const setup = () => {
    console.log("connecting");
    const socket = new WebSocket(SOCKET_SERVER_URL);
    socket.addEventListener("message", (event) => {
      console.log("Message received from server");
      console.log(event.data);
    });

    socket.addEventListener("open", (event) => {
      console.log("setting socket.readyState ", socket.readyState);
      setSocketStateState(socket.readyState);
      socketRef.current = socket;
      console.log("OPEN", event);
      socket.send("Hello Server!");
    });

    socket.addEventListener("close", (event) => {
      console.log("setting socket.readyState ", socket.readyState);
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
  }, []);

  const state = useMemo(() => {
    return {
      socketState,
      socket: socketRef.current,
    };
  }, [socketState]);

  //console.log("RENDER PROVIDER", { clientState });

  return (
    <SocketContext.Provider value={state}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
