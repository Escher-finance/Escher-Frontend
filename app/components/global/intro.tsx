import Image from "next/image";
import LdrsAnimation from "./ldrsAnimation";

const Intro = () => {
    return (
        <div
            className='absolute inset-0 bg-white dark:bg-escher-darkblue z-50 flex flex-col gap-4 items-center justify-center'
        >
            <Image src={'/images/escher-transparent.svg'} alt='' width={253} height={253} className='w-2/3 md:w-[253px] dark:hidden' priority />
            <Image src={'/images/escher-transparent-white.svg'} alt='' width={253} height={253} className='w-2/3 md:w-[253px] hidden dark:block' priority />
            <LdrsAnimation color='#0008FF' />
        </div>
    );
}

export default Intro;