import Image from "next/image";
import {cn} from "@/lib/utils";

const CallStatus = {
    INACTIVE : 'INACTIVE',
    CONNECTING : 'CONNECTING',
    ACTIVE : 'ACTIVE',
    FINISHED : 'FINISHED',
}

const Agent = ({ userName }) => {
    const callStatus = CallStatus.FINISHED;
    const isSpeaking = true;
    const messages = [
        'Whats your name?',
        'My name is John Doe, nice to meet you!'
    ];
    const lastMessage = messages[messages.length - 1];

    return (
        <>
        <div className="call-view z-[10]">
            <div className="card-interviewer m-4">
                <div className="avatar">
                    <Image src="/ai-tutor.png" alt="vapi" width={65} height={54} className="object-cover" />
                    {isSpeaking && <span className="animate-speak" />}
                </div>
                <h3>AI Tutor</h3>
            </div>

            <div className="card-border m-4">
                <div className="card-content">
                    <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                    <h3>{userName}</h3>
                </div>
            </div>
        </div>
            {messages.length > 0 && (
                <div className="transcript-border my-4">
                    <div className="transcript m-1">
                        <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center m-4">
                {callStatus !== 'ACTIVE' ? (
                    <button className="relative btn-call">
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !=='CONNECTING' & 'hidden')}
                             />

                            <span>
                                {callStatus === 'INACTIVE' || callStatus === 'FINISHED' ? 'Call' : '. . . '}
                            </span>
                    </button>
                ) : (
                    <button className="btn-disconnect">
                        End
                    </button>
                )}
            </div>
        </>
    )
}
export default Agent