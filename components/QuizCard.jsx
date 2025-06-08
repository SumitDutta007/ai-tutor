import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import DisplayTechIcons from "./DisplayTechIcons";
import { Button } from "./ui/button";

import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { cn, getRandomInterviewCover } from "@/lib/utils";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-full sm:w-[360px] min-h-[320px] sm:min-h-96">
      <div className="card-interview">
        <div className="p-4 sm:p-6">
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text text-sm sm:text-base">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[70px] sm:size-[90px]"
          />

          {/* Interview Role */}
          <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-3 sm:gap-5 mt-2 sm:mt-3">
            <div className="flex flex-row gap-1.5 sm:gap-2">
              <Image
                src="/calendar.svg"
                width={18}
                height={18}
                alt="calendar"
                className="size-[18px] sm:size-[22px]"
              />
              <p className="text-sm sm:text-base">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-1.5 sm:gap-2 items-center">
              <Image 
                src="/star.svg" 
                width={18} 
                height={18} 
                alt="star" 
                className="size-[18px] sm:size-[22px]"
              />
              <p className="text-sm sm:text-base">{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-4 sm:mt-5 text-sm sm:text-base">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center p-4 sm:p-6 pt-0 sm:pt-0">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary text-sm sm:text-base">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;