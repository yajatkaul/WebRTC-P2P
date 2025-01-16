"use client";
import { usePeerContext } from "@/context/PeerContext";
import { useSocketContext } from "@/context/SocketContext";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

const Page = ({ params }: { params: { roomId: string } }) => {
  const { socket }: any = useSocketContext();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  }: any = usePeerContext();

  const handleUserJoined = async (data: any) => {
    const { emailId } = data;
    const offer = await createOffer();
    socket.emit("call-user", { emailId, offer });
    setRemoteEmailId(emailId);
  };

  const handleIncommingCall = async (data: any) => {
    const { from, offer } = data;
    const ans = await createAnswer(offer);
    socket.emit("call-accepted", { emailId: from, ans });
    setRemoteEmailId(from);
  };

  const handleCallAccepted = async (data: any) => {
    const { ans } = data;
    await setRemoteAnswer(ans);
  };

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.on("call-accepted", handleCallAccepted);
    };
  }, [handleCallAccepted, handleIncommingCall, handleUserJoined, socket]);

  const handleNegosiation = async () => {
    const localOffer = await peer.createOffer();
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  };

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegosiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegosiation);
    };
  }, [handleNegosiation, peer]);

  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteEmailId, setRemoteEmailId] = useState();

  const getUserMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  };

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="h-screen flex justify-center items-center">
      <button
        className="btn"
        onClick={() => {
          sendStream(myStream);
        }}
      >
        Send video
      </button>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing />
    </div>
  );
};

export default Page;
