import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from 'react';

const Page = async () => {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="m-4">
                <h3>Please sign in to access the virtual classroom</h3>
            </div>
        );
    }

    return (
        <>
            <h3 className="m-4">Welcome to your virtual classroom</h3>

            <Agent 
                userName={user.name}
                userId={user.id}
            />
        </>
    );
};

export default Page;