import Agent from "@/components/Agent";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import React from 'react';

const Page = async () => {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
                <div className="text-center space-y-6 p-8 rounded-xl bg-gray-900/50 backdrop-blur-sm max-w-md w-full">
                    <div className="w-20 h-20 mx-auto relative">
                        <Image 
                            src="/ai-tutor.png" 
                            alt="AI Tutor" 
                            width={80} 
                            height={80}
                            className="rounded-full border-2 border-primary-200"
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Authentication Required</h3>
                    <p className="text-gray-400">Please sign in to access the virtual classroom and start your learning journey.</p>
                    <Link 
                        href="/sign-in" 
                        className="inline-block bg-primary-200 text-black px-8 py-3 rounded-lg font-semibold hover:bg-primary-300 transition-all"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Create a new classroom session
    const classroomRef = await db.collection("classrooms").add({
        userId: user.id,
        createdAt: new Date().toISOString(),
        status: "active"
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Welcome to Your Virtual Classroom
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Upload your study materials and interact with your AI tutor to enhance your learning experience.
                    </p>
                </div>

                {/* Quick Tips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            title: "Upload Materials",
                            description: "Start by uploading your notes or study materials",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            )
                        },
                        {
                            title: "Interactive Learning",
                            description: "Engage in conversations with your AI tutor",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            )
                        },
                        {
                            title: "Get Feedback",
                            description: "Receive detailed feedback on your performance",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )
                        }
                    ].map((tip, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-full bg-primary-200/20 flex items-center justify-center mb-4">
                                <div className="text-primary-200">
                                    {tip.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{tip.title}</h3>
                            <p className="text-gray-400">{tip.description}</p>
                        </div>
                    ))}
                </div>

                {/* Agent Component */}
                <div className="bg-gray-900/30 rounded-xl p-6 backdrop-blur-sm">
                    <Agent 
                        userName={user.name}
                        userId={user.id}
                        classroomId={classroomRef.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;