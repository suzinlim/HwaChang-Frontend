"use client";
import AchromaticButton from "@/app/ui/component/atom/button/achromatic-button";
import { Dialog, DialogContent, DialogTrigger } from "@/app/ui/component/molecule/dialog/dialog";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { MatchingAlarm } from "@/app/ui/consulting-room/modal/matching-alarm";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import { Video, VideoView } from "../../components/video-view";
import { createMockMyProfile } from "../../mock/mock-profiles";
import { useRouter, useSearchParams } from "next/navigation";
import { addCustomerToQueue } from "@/app/business/waiting-room/waiting-queue.service";
import { useCustomerStore } from "@/app/stores/customerStore";

export default function Home() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  const params = useSearchParams();
  const ctg = params.get("categoryId");
  const type = params.get("type");

  // 현재 접속한 고객의 이름
  const { customerName } = useCustomerStore();

  useEffect(() => {
    console.log(type);
    addCustomerToQueue(type, ctg).then((response) => {
      console.log(response);
    });
  }, []);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 800, height: 450 },
        });
        setVideoStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        audioContext.current = new window.AudioContext();
        gainNode.current = audioContext.current.createGain();
      } catch (error) {
        throw new Error(error as string);
      }
    };

    getMedia();

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [isVideoEnabled]);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // To-Do: 내가 비디오를 끌 경우, 나의 비디오 상태를 상대방에게 보내는 api 추가: isCam: false
  const toggleVideo = () => {
    if (videoStream) {
      videoStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // To-Do: 내가 오디오를 끌 경우, 나의 오디오 상태를 상대방에게 보내는 api 추가: isCam: false
  const toggleAudio = () => {
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <main>
      <div className="grid grid-row-1 gap-1 px-10 py-6">
        <p className={`mb-6 text-5xl text-black font-bold text-center`}>
          <strong>상담 대기실</strong>
        </p>
        <div className="flex justify-between items-center space-x-4 bg-white p-4 rounded-lg">
          <p className="text-2xl text-gray-600 font-medium">
            상담사를 기다리는 중입니다...
          </p>
          <Dialog>
          <DialogTrigger asChild>
            <AchromaticButton className="px-8 py-5 bg-hwachang-darkgreen hover:bg-[#225b4e] text-white rounded-full shadow-lg transition-transform transform hover:scale-105">
              매칭 시작
            </AchromaticButton>
            </DialogTrigger>
            <DialogContent>
              <MatchingAlarm categoryId={ctg} typeId={type} />
            </DialogContent>
          </Dialog>
        </div>
        <VideoView
          video={<Video ref={videoRef as LegacyRef<HTMLVideoElement>} />}
          onCam={isVideoEnabled}
          profile={createMockMyProfile(false, customerName)}
        />
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex justify-center gap-4">
          <AchromaticButton
            onClick={toggleAudio}
            className="rounded-full bg-hwachang-gray2 hover:bg-hwachang-gray3"
          >
            <div className="p-2">
              {isAudioEnabled ? (
                <MicIcon color="black" size={20} />
              ) : (
                <MicOffIcon color="black" size={20} />
              )}
            </div>
          </AchromaticButton>
          <AchromaticButton
            onClick={toggleVideo}
            className="rounded-full bg-hwachang-gray2 hover:bg-hwachang-gray3"
          >
            <div className="p-2">
              {isVideoEnabled ? (
                <VideoIcon color="black" size={20} />
              ) : (
                <VideoOffIcon color="black" size={20} />
              )}
            </div>
          </AchromaticButton>
          <AchromaticButton
            className="rounded-full bg-hwachang-gray2 hover:bg-hwachang-gray3 text-black"
            onClick={() => {
              router.push("/customer/main");
            }}
          >
            나가기
          </AchromaticButton>
        </div>
      </div>
    </main>
  );
}
