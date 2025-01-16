"use client";
import { useSocketContext } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [details, setDetails] = useState({
    email: "",
    roomId: "",
  });
  const { socket }: any = useSocketContext();

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    socket.emit("room:join", { email: details.email, roomId: details.roomId });
  };

  const handleJoinRoom = (data: any) => {
    const { email, roomId } = data;
    router.push(`/room/${roomId}`);
  };

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-2">
      <form
        onSubmit={handleSubmitForm}
        className="flex flex-col items-center justify-center gap-2"
      >
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full max-w-xs"
          value={details.email}
          onChange={(e) => {
            setDetails({ ...details, email: e.target.value });
          }}
        />
        <input
          type="text"
          placeholder="Room Code"
          className="input input-bordered w-full max-w-xs"
          value={details.roomId}
          onChange={(e) => {
            setDetails({ ...details, roomId: e.target.value });
          }}
        />
        <button className="btn btn-wide">Enter room</button>
      </form>
    </div>
  );
}
