"use client";
import { useSocketContext } from "@/context/SocketProvider";
import { useEffect } from "react";

const Page = ({ params }: { params: { roomId: string } }) => {
  const { socket }: any = useSocketContext();

  const handleUserJoined = (data: any) => {
    const { emailId } = data;
    console.log(emailId);
  };

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
  }, [socket]);

  return <div>Page</div>;
};

export default Page;
