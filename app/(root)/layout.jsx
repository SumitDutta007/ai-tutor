import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import StarryNight from '../../canvas/stars.jsx'

const Rootlayout =async ({children}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated){
    redirect('/sign-in');
  }

  return (
    <div className=" relative overflow-x-hidden">
      <StarryNight className ="z-[-1]"/>
      <nav className="m-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ai-tutor.png"
            alt="Logo"
            width={50}
            height={50}
          />
          <h2 className="text-primary-100">Tutorly</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default Rootlayout
