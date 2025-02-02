"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Summary from "./components/summary";
import Form from "@/app/ui/component/molecule/form/form-index";
import { FormState } from "@/app/ui/component/molecule/form/form-root";
import { FormTextInput } from "@/app/ui/component/molecule/form/form-textinput";
import { FormSubmitButton } from "@/app/ui/component/molecule/form/form-submit-button";
import { DateSelector } from "./components/date-selector";
import { Card } from "@/app/ui/component/molecule/card/card";
import ProfileImg from "@/app/utils/public/lalalping.png";
import {
  ConsultingResponse,
  fetchCustomerConsultings,
} from "@/app/business/customer/customer-consultings";
import {
  ConsultingDetailResponse,
  fetchConsultingDetail,
} from "@/app/business/customer/customer-consulting-detail";

export default function Home() {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const [startDate, setStartDate] = useState<string>(threeMonthsAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(today.toISOString().slice(0, 10));
  const [searchValue, setSearchValue] = useState<string>("");
  const [records, setRecords] = useState<ConsultingResponse[]>([]);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConsultingDetailResponse | null>(null);

  const handleOpenSummary = async (consultingRoomId: string) => {
    try {
      const response = await fetchConsultingDetail(consultingRoomId);
      if (response.isSuccess) {
        setSelectedRecord(response.data as ConsultingDetailResponse);
        setIsSummaryVisible(true);
      } else {
        console.error("Failed to fetch consulting detail");
      }
    } catch (error) {
      console.error("Error fetching consulting detail:", error);
    }
  };

  const handleCloseSummary = () => {
    setIsSummaryVisible(false);
    setSelectedRecord(null);
    setIsFullScreen(false);
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);

    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); // 1월이 0부터 시작하므로 +1
    const day = formattedDate.getDate().toString().padStart(2, "0");
    const hours = formattedDate.getHours().toString().padStart(2, "0");
    const minutes = formattedDate.getMinutes().toString().padStart(2, "0");
    const seconds = formattedDate.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 초기 렌더링 시 모든 데이터를 불러오기
  useEffect(() => {
    const fetchRecords = async () => {
      const payload = {
        summaryKeyword: searchValue,
        startDate,
        endDate,
      };

      const response = await fetchCustomerConsultings(payload);
      if (response.isSuccess) {
        setRecords(response.data as ConsultingResponse[]);
      } else {
        console.error("Failed to fetch consulting records");
      }
    };

    fetchRecords();
  }, [startDate, endDate, searchValue]);

  const handleSearch = (prevState: FormState, formData: FormData) => {
    const value = formData.get("search") as string;
    setSearchValue(value);
    return {
      isSuccess: true,
      isFailure: false,
      message: "",
      validationError: {},
    };
  };

  const RecordCards = records.map((value, index) => {
    // 주요 주제 추출 로직
    const extractMainTopic = (summary: string) => {
      if (!summary) return "주요 주제 없음"; // summary가 없을 경우 기본값
      const startIndex = summary.indexOf("주요주제 :");
      if (startIndex === -1) return "주요 주제 없음"; // "주요주제 :"가 없을 경우 기본값
      const endIndex = summary.indexOf("-", startIndex);
      return endIndex !== -1
        ? summary.slice(startIndex + 6, endIndex).trim() // "주요주제 :" 이후와 "-" 사이 텍스트 추출
        : summary.slice(startIndex + 6).trim(); // "-"가 없는 경우 끝까지 추출
    };

    const mainTopic = extractMainTopic(value.summary);

    return (
      <main key={index}>
        <Card className="grid grid-cols-7 gap-3 h-20">
          <div className="flex items-center justify-center text-sm md:text-sm">
            <Image
              src={ProfileImg}
              alt="프로필 사진"
              className="object-cover w-10 h-10 rounded-full border-1 border-white shadow-lg"
            />
          </div>
          <div className="flex items-center justify-center text-sm md:text-sm lg:text-base">
            {mainTopic} {/* 추출된 주요 주제 표시 */}
          </div>
          <div className="flex items-center justify-center text-sm md:text-sm lg:text-xl">
            {value.tellerName}
          </div>
          <div className="flex justify-center items-center w-full h-full">
            <div
              className={`flex justify-center items-center w-[80px] h-[40px] 
    ${
      value.type === "개인금융"
        ? "bg-[#dae7fd] text-[#2457be] rounded-md"
        : value.type === "기업금융"
          ? "bg-[#ffe3e3] text-[#8c1a1ad7] rounded-md"
          : ""
    }`}
            >
              {value.type === "개인금융" ? "개인" : value.type === "기업금융" ? "기업" : value.type}
            </div>
          </div>
          <div className="flex items-center justify-center text-sm md:text-sm lg:text-xl">
            {value.category}
          </div>
          <div className="flex items-center justify-center text-sm md:text-sm lg:text-xl">
            {formatDate(value.date)}
          </div>
          <div className="flex items-center justify-center text-sm md:text-sm lg:text-xl">
            <button onClick={() => handleOpenSummary(value.consultingRoomId)}>{"->"}</button>
          </div>
        </Card>
      </main>
    );
  });

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Form id={"search-form"} action={handleSearch} failMessageControl={"alert"}>
          <div className="grid grid-cols-[12fr_1fr] gap-2">
            <FormTextInput
              id={"search"}
              placeholder={"화창 기록을 검색해보세요"}
              className="rounded-lg bg-slate-100 py-1"
            />
            <FormSubmitButton
              className="bg-hwachang-darkgreen px-5 py-6"
              label={"검색"} />
          </div>
        </Form>
      </div>
      <DateSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div style={{ fontSize: "30px", fontWeight: "Bold" }}>화창기록</div>
      <div className="grid grid-rows-1 gap-3 text-hwachang-hwachanggray text-lg text-center">
        <Card className="grid grid-cols-7 gap-3 shadow-none border-white font-semibold text-sm md:text-sm lg:text-xl">
          <div></div>
          <div>주제</div>
          <div>담당자</div>
          <div>유형</div>
          <div>카테고리</div>
          <div>화창 날짜</div>
          <div></div>
        </Card>

        {/* RecordCards가 없으면 기본적인 레이아웃을 유지하면서 메시지 표시 */}
        {records.length === 0 ? (
          <Card className="grid grid-cols-7 gap-3 shadow-none border-white font-semibold text-sm md:text-sm lg:text-xl mt-32">
            <div className="col-span-7 text-center text-lg text-gray-400 py-4">
              상담 내역이 없습니다.
            </div>
          </Card>
        ) : (
          RecordCards
        )}
      </div>

      <div className="flex-col w-full mt-5">
        {isSummaryVisible && (
          <div
            className={`fixed top-0 right-0 h-full ${isFullScreen ? "w-screen" : "w-1/2"}
                      bg-white shadow-lg transition-width duration-300 z-50 
                      overflow-y-auto pt-5 ${isFullScreen ? "p-10" : "py-7 px-8"}`}
          >
            <div className="relative">
              <button
                onClick={handleCloseSummary}
                className="p-1 border-none bg-transparent cursor-pointer text-sm"
              >
                &gt;&gt;
              </button>
              <button
                onClick={handleToggleFullScreen}
                className="absolute top-0 right-0 p-1 border-none bg-transparent cursor-pointer text-sm"
              >
                &lt;&gt;
              </button>
            </div>
            <Summary
              detail={selectedRecord}
              onClose={handleCloseSummary}
              onExpand={handleToggleFullScreen}
            />
          </div>
        )}
      </div>
    </div>
  );
}
