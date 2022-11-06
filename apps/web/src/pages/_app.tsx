import type { AppProps } from "next/app";
import { SocketProvider } from "../context/socketContext";
import "../styles/main.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
}
