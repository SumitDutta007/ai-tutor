import React from 'react';
import StarryNight from '../../canvas/stars.jsx';
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';

const Authlayout =async ({ children }) => {
  const isUserAuthenticated = await isAuthenticated();
    if(isUserAuthenticated){
      redirect('/');
    }
  return (
    <div className='relative'>
      <StarryNight />
      <div className='relative auth-layout'>
        {children}
      </div>
    </div>
  );
};

export default Authlayout;
