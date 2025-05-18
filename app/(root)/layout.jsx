import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Rootlayout = ({children}) => {
  return (
    <div className=" relative overflow-x-hidden">
      <nav className="">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ai-tutor.png"
            alt="Logo"
            width={50}
            height={50}
          />
          <h2 className="text-primary-100">AI Tutor</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default Rootlayout
