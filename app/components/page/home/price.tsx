import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import Image from "next/image";

const Price = () => {
    return (
        <Card className="flex-1 justify-between">
            <div className="flex flex-col">
                <div className="flex gap-2 items-center text-escher-gray500 dark:text-white">
                    <div>U Token</div>
                    <Icon type="FiHelpCircle" />
                </div>
                <div className="font-bold text-2xl text-escher-gray800 dark:text-white flex gap-2 items-center">
                    <Image src={'/images/token-u.png'} alt="" height={24} width={24} />
                    <div>$30.00</div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex gap-2 items-center text-escher-gray500 dark:text-white">
                    <div>LU Token</div>
                    <Icon type="FiHelpCircle" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="font-bold text-2xl text-escher-gray800 dark:text-white flex gap-2 items-center">
                        <Image src={'/images/token-lu.png'} alt="" height={24} width={24} />
                        <div>$30.00</div>
                    </div>
                    <div className="text-escher-valencia bg-escher-valencia_light1 rounded-full text-xs font-medium p-2 leading-none">1 LU token = 1.5 U token</div>
                </div>
            </div>
        </Card>
    );
}

export default Price;