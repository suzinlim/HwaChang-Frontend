import ConsultationStartContent from "@/app/ui/consulting-room/consultation-start-content";
import InfoBar from "@/app/ui/consulting-room/info-bar";
import React from "react";

export default function PrepareCounsel() {
  const waitingCount = 6;
  return (
    <div>
      <InfoBar />
      <ConsultationStartContent waitingCount={waitingCount} />
    </div>
  )
}