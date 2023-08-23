"use client";

import { useEffect, useState } from "react";
import PartySocket from "partysocket";

const readyStates = {
  [PartySocket.CONNECTING]: {
    text: "Connecting",
    className: "bg-yellow-500/70",
  },
  [PartySocket.OPEN]: {
    text: "Connected",
    className: "bg-green-500/70",
  },
  [PartySocket.CLOSING]: {
    text: "Closing",
    className: "bg-orange-500/70",
  },
  [PartySocket.CLOSED]: {
    text: "Not Connected",
    className: "bg-red-500/70",
  },
};

export default function ConnectionStatus(props: {
  socket: PartySocket | WebSocket | null;
}) {
  const { socket } = props;
  const [readyState, setReadyState] = useState<number>(
    socket?.readyState === 1 ? 1 : 0
  );
  const display = readyStates[readyState as keyof typeof readyStates];

  useEffect(() => {
    if (socket) {
      const onStateChange = () => {
        setReadyState(socket.readyState);
      };

      // Initial state
      setReadyState(socket.readyState === 1 ? 1 : 0);

      socket.addEventListener("open", onStateChange);
      socket.addEventListener("close", onStateChange);

      return () => {
        socket.removeEventListener("open", onStateChange);
        socket.removeEventListener("close", onStateChange);
      };
    }
  }, [socket]);

  return (
    <div className="z-20 fixed bottom-1 sm:bottom-2 right-1 sm:right-2 w-full flex justify-end">
      <div className="flex gap-2 justify-center items-center bg-stone-50 rounded-full shadow-md border border-stone-200 pl-2 pr-1 sm:pl-3 sm:pr-2 py-1 sm:py-2">
        <p className="text-xs font-base uppercase tracking-wider leading-none text-stone-400">
          {display.text}
        </p>
        <div className={`w-3 h-3 rounded-full ${display.className}`}></div>
      </div>
    </div>
  );
}
