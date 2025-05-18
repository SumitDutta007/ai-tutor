import React from 'react'
import Agent from "@/components/Agent";

const Page = () => {
    return (
        <>
            <h3 className="m-4">Generating your virtual classroom</h3>

            <Agent className="m-4" userName="You" userId="user1" type="generate" />
        </>
    )
}
export default Page