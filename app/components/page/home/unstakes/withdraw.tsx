import Button from "@/components/global/button";
import IconCircle from "@/components/global/iconCircle";
import Icon from "@/components/global/icons";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import Image from "next/image";

const Withdraw = () => {
    return (
        <DialogEmpty>
            <DialogTrigger className="text-xs text-escher-gray400 dark:text-escher-777e90 font-medium">withdraw</DialogTrigger>
            <DialogContent className="p-6 min-w-[380px] gap-0 rounded-4xl">
                <DialogTitle className="hidden" />
                <IconCircle icon="FaTimes" className="bg-escher-electricblue_light8" />

                <div className="flex flex-col gap-2 items-center leading-none mt-10">
                    <div className="text-sm text-escher-gray500 dark:text-white">Unstaking eU</div>
                    <div className="flex items-center gap-2">
                        <Image src={'/images/token-eu.png'} alt="" width={30} height={30} />
                        <div className="text-[32px] font-bold text-escher-gray900 dark:text-white">0.00345</div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-escher-gray800 dark:text-white bg-escher-gray100 rounded-t-lg px-4 py-2 mt-5">
                    <div>19 days left</div>
                    <Icon type="FiClock" />
                </div>
                <div className="w-full h-1.5 bg-escher-electricblue_light8 relative">
                    <div className="h-full w-1/2 bg-escher-electricblue" />
                </div>

                <div className="flex flex-col gap-4 mt-4 text-sm font-medium">
                    <div className="flex items-center gap-1">
                        <Icon type="FaCheckCircle" />
                        <div className="flex-1 text-escher-gray400 dark:text-escher-777e90">Batched</div>
                        <div className="text-escher-gray600 dark:text-white">Done</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon type="FaCheckCircle" />
                        <div className="flex-1 text-escher-gray400 dark:text-escher-777e90">Unstaking</div>
                        <div className="text-escher-gray600 dark:text-white">19 days left</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon type="FaRegCircle" />
                        <div className="flex-1 text-escher-gray400 dark:text-escher-777e90">Ready to Withraw</div>
                        <div className="text-escher-gray600 dark:text-white">Manual</div>
                    </div>
                </div>

                <div className="flex flex-col bg-escher-gray100 rounded-lg p-2 mt-6 gap-2">
                    <div className="text-sm text-escher-gray600 dark:text-white font-medium">LIQUID STAKING DETAILS</div>
                    <div className="flex flex-col px-2 bg-white rounded-lg">
                        <div className="flex justify-between items-center py-2">
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">From</div>
                            <div className="text-sm text-escher-gray900 dark:text-white">0.0332 eU</div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-escher-gray100 dark:border-escher-30425b">
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">To</div>
                            <div className="text-sm text-escher-gray900 dark:text-white">0.0332 eU</div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-escher-gray100 dark:border-escher-30425b">
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">Exchange rate</div>
                            <div className="text-sm text-escher-gray900 dark:text-white">1.5</div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-escher-gray100 dark:border-escher-30425b">
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">Receiver address</div>
                            <div className="text-sm text-escher-gray900 dark:text-white">0xaef...n7r3b</div>
                        </div>
                    </div>
                </div>

                <Button title="Withdraw" className="mt-4 text-sm font-medium" />
            </DialogContent>
        </DialogEmpty>
    );
}

export default Withdraw;