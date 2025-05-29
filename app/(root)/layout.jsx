import { Button } from '@/components/ui/button'
import { isAuthenticated, signOut } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import StarryNight from '../../canvas/stars.jsx'

const Rootlayout =async ({children}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated){
    redirect('/sign-in');
  }

  return (
    <div className="relative overflow-x-hidden">
      <StarryNight className="z-[-1]"/>
      <nav className="m-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ai-tutor.png"
            alt="Logo"
            width={50}
            height={50}
          />
          <h2 className="text-primary-100">Tutorly</h2>
        </Link>
        <form action={signOut} className='z-10'>
          <Button 
            type="submit"
            variant="outline"
            className="text-primary-100 hover:text-primary-200 border-primary-100 hover:border-primary-200"
          >
            Logout
          </Button>
        </form>
      </nav>
      {children}
    </div>
  )
}

export default Rootlayout
