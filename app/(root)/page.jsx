import Spline from '@splinetool/react-spline/next';
import Image from 'next/image';
import Link from 'next/link';

const Home = () => {
  return (
      <main className="flex lg:mt-20 flex-col lg:flex-row items-center justify-between min-h-[calc(90vh-4.3rem)]">
        <Image src="/hero blur img.png" alt="hero" width={1000} height={1000} className="absolute top-0 left-0 w-full h-full object-cover blur-[2px] opacity-50 z-0" />
        <Image src="/hero rings img.png" alt="hero" width={600} height={600} className="absolute top-25 left-10 opacity-50 z-0" />
        <div className="max-w-xl ml-[10%] z-10 mt-20 lg:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-wider my-8">Tutorly</h1>
          <p className="text-base sm:text-lg tracking-wider text-gray-400 max-w-[25rem] lg:max-w-[30rem]">Your personalised AI tutor</p>
          <Link href="/classroom">
            <div className="relative w-full h-8 rounded-full bg-[linear-gradient(to_right,_#656565,_#ba5af6,_#472a85,_#5300a0,_#757575,_#656565)] bg-[length:200%] animate-gradient shadow-[0_0_15px_rgba(255,255,255,0.3)] py-6 my-4">
              <div className="absolute inset-[3px] bg-black rounded-full flex justify-center items-center transition duration-500 ease-in-out hover:text-[#c55af6] text-white cursor-pointer">
                Let's get started
              </div>
            </div>
          </Link>
          <Link href="/quiz">
          <div className='relative w-full h-8 rounded-full bg-[linear-gradient-to-r from-[#656565] via-[#eaa471] to-[#441f04] bg-[length:200%] animate-gradient shadow-[0_0_15px_rgba(255,255,255,0.4)] py-6 my-4'>
            <div className='absolute inset-[3px] bg-black rounded-full flex justify-center items-center gap-1 hover:text-[#e99b63] text-white cursor-pointer'>
            Take a Quiz
            </div>
          </div>
          </Link>
        </div>

        {/* Right Section */}
        <Spline className="absolute top-[40%] md:top-[40%] lg:top-0 bottom-0 lg:left-[25%] sm:left-[-2%] h-full"
          scene="https://prod.spline.design/3gnrm1vc-3LjfsuV/scene.splinecode"
        />
      </main>
  );
};

export default Home
