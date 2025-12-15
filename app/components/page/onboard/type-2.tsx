'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Screen1 from './screen-1';

export default function Type2() {
    const [isConnectPage, setIsConnectPage] = useState(false);

    return (
        <div className="container mx-auto relative h-screen overflow-hidden">
            <motion.div
                key="first"
                initial={{ x: 0 }}
                animate={
                    !isConnectPage ? {
                        x: 0
                    } : {
                        x: '-100%'
                    }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute left-0 top-0 bottom-0 w-[60%] py-4 pr-2"
            >
                <Screen1
                    setIsConnectPage={setIsConnectPage}
                />
            </motion.div>

            <motion.div
                key="first-illustration"
                initial={{ y: 0 }}
                animate={
                    !isConnectPage ? {
                        y: 0
                    } : {
                        y: '100%'
                    }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute right-0 top-0 bottom-0 w-[40%] py-4 pl-2"
            >
                <Image alt=""
                    src={"/images/onboard/onboard-1.jpeg"}
                    className='rounded-2xl h-full object-cover'
                />
            </motion.div>

            {/* Second */}
            <motion.div
                key="second"
                initial={{ x: '100%' }}
                animate={
                    isConnectPage ? {
                        x: 0
                    } : {
                        x: '100%'
                    }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute right-0 top-0 bottom-0 w-[60%] py-4 pl-2"
            >
                {/* <Screen2
                    setIsConnectPage={setIsConnectPage}
                /> */}
            </motion.div>

            <motion.div
                key="second-illustration"
                initial={{ y: '-100%' }}
                animate={
                    isConnectPage ? {
                        y: 0
                    } : {
                        y: '-100%'
                    }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute left-0 top-0 bottom-0 w-[40%] py-4 pr-2"
            >
                <Image alt=""
                    src={"/images/onboard/onboard-2.jpg"}
                    className='rounded-2xl h-full object-cover'
                />
            </motion.div>
        </div>
    );
}
