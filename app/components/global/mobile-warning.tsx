import Image from "next/image";

const MobileWarning = () => {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 px-6 text-center">
            <Image src={'/images/escher-transparent.svg'} alt='' width={253} height={253} className='w-2/3 md:w-[253px]' priority />
            <p className="text-gray-600 mt-4">
                This app can only be accessed from a desktop device.
            </p>
            <p className="text-gray-500 text-sm mt-2">
                Don&apos;t worry — mobile support is coming soon!
            </p>
        </div>
    );
}

export default MobileWarning;