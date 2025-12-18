'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Screen1 from './screen-1';
import Screen2 from './screen-2';

export default function Type3() {
    const [isConnectPage, setIsConnectPage] = useState(false);

    return (
        <div className="max-w-[1440px] mx-auto relative h-screen overflow-hidden">
            {/* First Section */}
            <motion.div
                key="first"
                initial={{ x: 0 }}
                animate={isConnectPage ? { x: '100%' } : { x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute right-0 top-0 bottom-0 w-[60%] py-4 pl-8 pr-4"
            >
                <Screen1
                    setIsConnectPage={setIsConnectPage}
                />
            </motion.div>

            {/* Illustration */}
            <motion.div
                key="first-illustration"
                initial={{ x: 0, width: '40%' }}
                animate={isConnectPage ? { x: '66%', width: '60%' } : { x: 0, width: '40%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-4 top-0 bottom-0"
            >
                <motion.div
                    className='w-full h-full py-4'
                    key="illustration-image"
                    initial={{ opacity: 1 }}
                    animate={isConnectPage ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    {/* First Image (Always Visible) */}
                    <Image alt=""
                        src="/images/onboard/onboard-1-1440p.jpg"
                        className="rounded-2xl h-full w-full object-cover"
                    />
                </motion.div>

                <motion.div
                    className='absolute inset-0 p-4 pr-8'
                    key="illustration-connect"
                    initial={{ opacity: 0 }}
                    animate={isConnectPage ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className='w-full h-full rounded-2xl bg-escher-e4e8ed py-7 flex flex-col items-center justify-between'>
                        <Image src={'/images/escher-transparent.svg'} alt='' width={150} height={150} className='w-[150px]' priority={true} />
                        <div className='flex-1 flex items-center w-full'>
                            <div className='h-[75%] w-full bg-no-repeat bg-center bg-contain bg-[url(/images/onboard/onboard-rubick.jpg)]' />
                        </div>
                        <div className='text-escher-777e90 font-medium'>“We adore chaos because we love to produce order” - MC Escher</div>
                    </div>
                </motion.div>
            </motion.div >


            {/* Second Section */}
            <motion.div
                key="second"
                initial={{ x: '-100%' }}
                animate={isConnectPage ? { x: 0 } : { x: '-100%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-4 top-0 bottom-0 w-[40%] py-4 pr-4"
            >
                <Screen2
                    setIsConnectPage={setIsConnectPage}
                />
            </motion.div >
        </div >
    );
}
