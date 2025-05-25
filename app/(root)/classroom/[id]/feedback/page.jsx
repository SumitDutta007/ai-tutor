import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getClassroomById,
  getFeedbackByClassroomId,
} from "@/lib/actions/general.action";

const CategoryCard = ({ category, index }) => (
  <div className="bg-gray-900/50 rounded-lg p-6 hover:bg-gray-900/60 transition-all h-full">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-primary-200/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xl font-bold text-primary-200">{index + 1}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
        <div className="flex items-center gap-3">
          <div className="h-2 w-full max-w-[120px] bg-gray-700 rounded-full">
            <div 
              className="h-full bg-primary-200 rounded-full transition-all duration-500" 
              style={{ width: `${category.score}%` }}
            />
          </div>
          <span className="text-primary-200 font-semibold whitespace-nowrap">{category.score}/100</span>
        </div>
      </div>
    </div>
    <p className="text-gray-300 leading-relaxed">{category.comment}</p>
  </div>
);

const ListSection = ({ title, items, icon }) => (
  <div className="bg-gray-900/50 rounded-lg p-6 h-full">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-primary-200/20 flex items-center justify-center">
        <Image src={icon} width={20} height={20} alt={title.toLowerCase()} className="text-primary-200" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <ul className="space-y-3">
      {items?.map((item, index) => (
        <li key={index} className="flex items-start gap-3 group">
          <span className="text-primary-200 mt-1.5 text-lg">•</span>
          <span className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
    <div className="text-center space-y-6 p-8 rounded-xl bg-gray-900/50 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-transparent rounded-full animate-spin mx-auto" />
      <h1 className="text-4xl font-bold text-white">Loading Feedback...</h1>
      <p className="text-gray-400 text-lg">Please wait while we fetch your feedback.</p>
    </div>
  </div>
);

const FeedbackContent = async ({ params }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { id } = params;
  const classroom = await getClassroomById({ id });
  if (!classroom) redirect("/");

  const feedback = await getFeedbackByClassroomId({
    classroomId: id,
    userId: user.id
  });

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center space-y-6 p-8 rounded-xl bg-gray-900/50 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-4xl font-bold text-white">Generating Feedback...</h1>
          <p className="text-gray-400 text-lg">Please wait while we analyze your classroom session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-white">Session Feedback</h1>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-3 bg-gray-900/50 px-6 py-3 rounded-full">
              <Image src="/star.svg" width={28} height={28} alt="star" />
              <p className="text-lg text-gray-200">
                Overall Score:{" "}
                <span className="text-primary-200 font-bold text-2xl ml-1">
                  {feedback.totalScore}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 px-6 py-3 rounded-full">
              <Image src="/calendar.svg" width={28} height={28} alt="calendar" />
              <p className="text-lg text-gray-200">
                {dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}
              </p>
            </div>
          </div>
        </div>

        {/* Final Assessment */}
        <div className="bg-gray-900/50 rounded-lg p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Overall Assessment</h2>
          <p className="text-gray-300 leading-relaxed text-lg">{feedback.finalAssessment}</p>
        </div>

        {/* Performance Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Performance Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feedback.categoryScores.map((category, index) => (
              <CategoryCard key={index} category={category} index={index} />
            ))}
          </div>
        </div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListSection 
            title="Key Strengths" 
            items={feedback.strengths}
            icon="/checkmark.svg"
          />
          <ListSection 
            title="Areas for Improvement" 
            items={feedback.areasForImprovement}
            icon="/improvement.svg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg transition-all text-lg">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/home.svg" width={24} height={24} alt="home" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          <Button className="bg-primary-200 hover:bg-primary-300 text-black px-8 py-4 rounded-lg transition-all text-lg">
            <Link href={`/classroom`} className="flex items-center gap-3">
              <Image src="/retry.svg" width={24} height={24} alt="retry" />
              <span>Retake Class</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Feedback = ({ params }) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <FeedbackContent params={params} />
    </Suspense>
  );
};

export default Feedback;