"use client";
import { useSocketContext } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { socket }: any = useSocketContext();
  const [details, setDetails] = useState({
    email: "",
    roomId: "",
  });

  const handleJoinRoom = () => {
    socket.emit("join-room", {
      emailId: details.email,
      roomId: details.roomId,
    });
  };

  const handleRoomJoined = ({ roomId }: any) => {
    router.push(`/room/${roomId}`);
  };

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);
  }, [socket]);

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-2">
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
      <button className="btn btn-wide" onClick={handleJoinRoom}>
        Enter room
      </button>
    </div>
  );
}
