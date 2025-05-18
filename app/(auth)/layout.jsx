import React from 'react';
import StarryNight from '../../canvas/stars.jsx';

const Authlayout = ({ children }) => {
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
