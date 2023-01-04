import * as Toast from "@radix-ui/react-toast";
import { CSSProperties, useState } from "react";
import { Chat } from "../components/chat";
import { useSocket } from "../context/socketContext";

export default function App() {
  const { socket, ready, clientId, members } = useSocket();
  const [isToastOpen, setIsToastOpen] = useState(false);

  const onClickCreateRoom = () => {
    console.log({ ready });
    if (!ready) return;

    console.log("sending message");

    socket?.send("askCreateRoom");
  };

  return (
    <>
      <Chat />

      {/* Online players count */}
      <div className="fixed bottom-5 right-5 stats shadow">
        <div className="stat py-2 px-5">
          <div className="stat-value countdown">
            <span
              style={
                { "--value": Object.keys(members).length } as CSSProperties
              }
            ></span>
          </div>
          <div className="stat-title">online</div>
        </div>
      </div>

      {/* Navbar */}
      <main className="shadow-md relative max-w-screen-md mx-auto bg-base-100 border-base-content/5 border rounded-box m-4 flex flex-col items-center px-6 pb-6">
        {/* navbar */}
        <div className="navbar bg-base-100 p-0">
          <div className="navbar-start">
            <a href="/" className="text-4xl prose text-primary font-normal">
              🥦
            </a>
          </div>
          <div className="navbar-center"></div>
          <div className="navbar-end">
            <button className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="fixed flex flex-col items-center top-5 right-5 px-5 py-2 bg-base-100 shadow rounded z-50">
          <h1 className="text-primary border-b-[3px] border-primary mb-2">
            Members
          </h1>
          {Object.keys(members).map((memberId) => (
            <div
              key={memberId}
              className={`${
                memberId === clientId ? "font-bold" : ""
              } text-slate-800`}
            >
              {members[memberId].name}{" "}
              {memberId === clientId ? (
                <b className="text-xs font-bold">(you)</b>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>

        <div className="flex w-full my-4 border-b-[3px] border-primary">
          <h1 className="text-primary">Play</h1>
        </div>

        <p className="has-dropcap prose mt-4">
          Welcome to brocolli lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Quidem aliquam accusantium esse perferendis, itaque
          temporibus, neque blanditiis tempora illo omnis autem ut eos eius nemo
          magni numquam voluptatem et sit.{" "}
          <span className="link link-primary">Learn more.</span>{" "}
        </p>

        {/* find match */}
        <div className="max-w-fit flex flex-col items-center w-full border-opacity-50">
          <button
            className="btn btn-secondary btn-wide mt-14 shadow-sm"
            disabled
          >
            Find Match
          </button>
          <div className="divider">OR</div>
          <button
            onClick={onClickCreateRoom}
            className="btn btn-outline btn-wide shadow-sm"
          >
            Create room
          </button>
        </div>
        <div className="flex w-full border-b-[3px] border-primary mt-14 my-4">
          <h1 className="text-primary">Manage deck</h1>
        </div>
        <p className="has-dropcap prose mt-4">
          Crazy deck lorem ipsum dolor sit, amet consectetur adipisicing elit.
          Quidem aliquam accusantium esse perferendis, itaque temporibus, neque
          blanditiis tempora illo omnis autem ut eos eius nemo magni numquam
          voluptatem et sit.{" "}
          <span className="link link-primary">Learn more.</span>{" "}
        </p>
        {/* <ul className="menu bg-base-100 rounded-box absolute top-1/2 -left-8"> */}
        <ul className="menu bg-base-100 shadow-md rounded-box absolute top-1/3 -left-8">
          <li>
            <a className="active">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </a>
          </li>
          <li>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </a>
          </li>
        </ul>
      </main>
    </>
  );
}
