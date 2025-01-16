//@ts-nocheck
"use client";
import { useSocketContext } from "@/context/SocketContext";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../../../services/PeerService";

const Page = () => {
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const { socket }: any = useSocketContext();

  const handleUserJoined = ({ email, id }: any) => {
    setRemoteSocketId(id);
  };

  const handleIncommingCall = async ({ from, offer }: any) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log("Incomming Call");
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  };

  const sendStream = () => {
    for (const track of myStream?.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  };

  const handleCallAccepted = ({ from, ans }: any) => {
    peer.setLocalDescription(ans);
    console.log("Call Accepted");
    sendStream();
  };

  const handleNegoIncomming = async ({ from, offer }: any) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  };

  const handleNegoFinal = async ({ ans }) => {
    await peer.setLocalDescription(ans);
  };

  const handleNegoNeeded = async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  };

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleCallUser = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  };

  useEffect(() => {
    const handleTrack = async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    };

    peer.peer.addEventListener("track", handleTrack);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncomming);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleNegoFinal,
    handleCallAccepted,
    handleNegoIncomming,
  ]);

  return (
    <div className="flex h-screen items-center justify-center">
      {myStream && <button onClick={sendStream}>Send STREAM</button>}
      <button className="btn" onClick={handleCallUser}>
        Call
      </button>
      {myStream && <ReactPlayer url={myStream} playing muted />}
      {remoteStream && <ReactPlayer url={remoteStream} playing />}
    </div>
  );
};

export default Page;
