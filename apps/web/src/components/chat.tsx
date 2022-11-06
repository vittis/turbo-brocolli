import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiMessageSquare } from "react-icons/fi";

export const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef?.current?.focus();
    }
    if (isOpen && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed left-4 bottom-4">
        <button
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
      <div className="flex flex-col w-80 border-2 rounded-md border-primary pt-2 pb-0 focus:outline-none focus-within:ring-1 focus-within:ring-primary">
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-primary p-3 btn-ghost absolute top-0 right-0 focus:outline-none focus:ring focus:ring-inset"
        >
          <FiChevronDown size="20" />
        </button>

        <div
          ref={chatBoxRef}
          className="prose min-h-[165px] max-h-[165px] flex-1 mb-3 overflow-y-scroll px-2"
        >
          asdasda
        </div>

        <form className="prose border-t-2 border-primary">
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
