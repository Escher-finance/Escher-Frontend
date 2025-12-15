import Button from "@/components/global/button";
import Image from "next/image";
import Link from "next/link";

interface Props {
    setIsConnectPage(val: boolean): void
}

export default function Screen1(props: Props) {
    return (
        <div className='bg-escher-gray200 flex flex-col items-center h-full rounded-2xl px-10 py-6'>
            <div className="flex flex-col items-center gap-4">
                <Image src={'/images/escher-transparent.svg'} alt='' width={300} height={300} className='w-[228px] mt-8' priority={true} />
                <div className="text-xl font-medium text-escher-primary3">Staking made limitless</div>
            </div>

            <div className='flex-1 flex flex-col justify-center items-center text-center'>
                <div className='font-bold text-[44px] leading-tight mt-6'>"We adore chaos because<br />we love to produce order"</div>
                <div className='text-escher-gray700 text-opacity-50 mt-6'>-M.C ESCHER</div>
                <div className='self-center mt-14 flex items-center gap-4 justify-center'>
                    <Button
                        title='Connect Account'
                        postIcon="FaArrowRight"
                        onClick={() => props.setIsConnectPage(true)}
                    />
                    <Button
                        title='Documentation'
                        preComponent={<Image alt="" src="/icons/assets_icon.svg" />}
                        style="outline"
                        type="link"
                        url="https://docs.escher.finance/"
                        target="_blank"
                        className="font-bold"
                    />
                </div>
                <Link href={"/"} className="flex items-center gap-2 text-escher-text2 dark:text-white font-medium text-sm mt-[14px] hover:border-b border-gray-400">
                    <Image alt="" src={"/icons/arrow-right-03.svg"} />
                    <div className="opacity-40">Skip for now</div>
                </Link>
            </div>
        </div>
    );
}