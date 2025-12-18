import Button from "@/components/global/button";

const Promo = () => {
    return (
        <div className="flex flex-col bg-white rounded-lg border border-escher-gray100 dark:border-escher-30425b p-6 bg-promo-bg-1 bg-no-repeat bg-bottom-right bg-size-[auto_100%]">
            <div className="text-2xl font-bold text-escher-gray600 dark:text-white">Liquid Stake now and get an airdrop</div>
            <div className="text-escher-gray400 dark:text-escher-777e90 mt-2">Turn complexity into opportunity—stake seamlessly and unlock endless rewards.</div>
            <Button
                title="Liquid Stake Now"
                style="fill"
                type="link"
                url="/liquid-staking"
                className="self-start text-sm font-medium py-3.5 mt-6"
            />
        </div>
    );
}

export default Promo;