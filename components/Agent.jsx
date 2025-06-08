"use client"

import { teacher } from "@/constants/workflow";
import { createFeedback } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import FileUpload from "./FileUpload";

const CallStatus = {
    INACTIVE: 'INACTIVE',
    CONNECTING: 'CONNECTING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    INITIAL_GREETING: 'INITIAL_GREETING'
};

const Agent = ({ userName, userId, avatar, classroomId }) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [lastMessage, setLastMessage] = useState('');
    const [feedbackId, setFeedbackId] = useState(null);

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // Create initial greeting assistant and start call when component mounts
    // useEffect(() => {
    //     const initializeGreeting = async () => {
    //         try {
    //             // Create Assistant (POST /assistant)
    //             const response = await fetch("https://api.vapi.ai/assistant", {
    //                 method: "POST",
    //                 headers: {
    //                 "Authorization": `Bearer ${process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN}`,
    //                 "Content-Type": "application/json"
    //                 },
    //                 body: JSON.stringify({
    //                 "transcriber": {
    //                     "provider": "11labs"
    //                 },
    //                 "model": {
    //                     "provider": "openai",
    //                     "model": "chatgpt-4o-latest"
    //                 },
    //                 "voice": {
    //                     "provider": "11labs",
    //                     "voiceId": "andrea"
    //                 },
    //                 "firstMessage": `Hi ${userName}! I'm Tutorly, your personalized AI tutor. To get started, please upload your notes or study materials in the section below. Once you do that, I'll be able to help you learn the material effectively!`,
    //                 "firstMessageMode": "assistant-speaks-first"
    //                 }),
    //             });
  
    //             const greetingAssistant = await response.json();
    //             if (!greetingAssistant.id) {
    //                 throw new Error('Failed to create greeting assistant');
    //             }
    //             setCallStatus(CallStatus.INITIAL_GREETING);
    //             await vapi.start(greetingAssistant.id)
                
    //         } catch (error) {
    //             console.error('Error in initial greeting:', error);
    //             setError('Failed to initialize. Please refresh the page.');
    //         }
    //     };

    //     initializeGreeting();
    // }, [userName, userId]);

    const handleUpload = useCallback(async (file) => {
        setIsUploading(true);
        setError(null);
        try {
            console.log(file);
            console.log('Processing file:', file.type);
            
            // Process with Gemini

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: file.type,
                        data: file.file
                    }
                },
                'summarize this document',
            ]);
            const extractedText = result.response.text();
            
            console.log('Extracted text:', extractedText);

            if (!extractedText) {
                throw new Error('Failed to extract text from document');
            }

            setCallStatus(CallStatus.INACTIVE);

            // Start new call with the learning assistant
            await vapi.start(teacher, {
                variableValues: {
                    notes: extractedText
                }
            });

        } catch (error) {
            console.error('Error in upload process:', error);
            setError(error.message || 'Failed to process your document. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, []);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            if (callStatus === CallStatus.INITIAL_GREETING) {
                setCallStatus(CallStatus.INACTIVE);
            } else {
                setCallStatus(CallStatus.FINISHED);
            }
            setIsSpeaking(false);
        };

        const onMessage = (message) => {
            console.log('Message received:', message);
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error) => {
            console.error('Conversation error:', error);
            setError('Error in conversation. Please try refreshing.');
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, [callStatus]);

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async () => {
            if (callStatus === CallStatus.FINISHED && messages.length > 0) {
                try {
                    const formData = new FormData();
                    formData.append('classroomId', classroomId);
                    formData.append('userId', userId);
                    formData.append('transcript', JSON.stringify(messages));

                    const { success, feedbackId: id, error } = await createFeedback(formData);

                    if (success && id) {
                        toast.success('Feedback generated successfully!');
                        router.push(`/classroom/${classroomId}/feedback`);
                    } else {
                        console.error("Error generating feedback:", error);
                        toast.error(error || "Failed to generate feedback");
                        router.push("/");
                    }
                } catch (error) {
                    console.error("Error generating feedback:", error);
                    toast.error(error.message || "Failed to generate feedback");
                    router.push("/");
                }
            }
        };

        handleGenerateFeedback();
    }, [messages, callStatus, userId, router, classroomId]);

    const handleDisconnect = async () => {
        toast.success('Generating your feedback...');
        setIsSpeaking(false);
        vapi.stop();
        setCallStatus(CallStatus.FINISHED);
    };

    return (
        <>
            <div className="call-view z-[10] max-w-5xl mx-auto">
                <div className="card-classroomer m-4">
                    <div className="avatar">
                        <Image src="/ai-tutor.png" alt="vapi" width={50} height={50} className="object-cover size-[50px] sm:size-[65px]" />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3 className="text-base sm:text-lg">AI Tutor</h3>
                </div>

                <div className="card-border m-4">
                    <div className="card-content">
                        {avatar && <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[80px] sm:size-[120px]" />}
                        <h3 className="text-base sm:text-lg">{userName}</h3>
                    </div>
                </div>
            </div>

            {error && (
                <div className="my-4 max-w-xl mx-auto">
                    <p className="text-center text-destructive-100 text-sm sm:text-base">{error}</p>
                </div>
            )}

            <div className="my-4 max-w-xl mx-auto">
                <FileUpload onUpload={handleUpload} isUploading={isUploading} />
            </div>

            {messages.length > 0 && (
                <div className="transcript-border my-4 max-w-3xl mx-auto">
                    <div className="transcript m-1">
                        <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0 text-sm sm:text-base', 'animate-fadeIn opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center m-4">
                {callStatus === CallStatus.ACTIVE && (
                    <button 
                        className="btn-disconnect"
                        onClick={handleDisconnect}
                    >
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;