import dynamic from 'next/dynamic';

const Hub1 = dynamic(() => import('../../components/pages/hubs/hub1'), {
    ssr: false,
});
const Hub2 = dynamic(() => import('../../components/pages/hubs/hub2'), {
    ssr: false,
});
const Hub3 = dynamic(() => import('../../components/pages/hubs/hub3'), {
    ssr: false,
});

const Hub = () => {
    return (
        <div className="bg-white">
            <div className="container mx-auto flex flex-col items-center pt-8 px-4 md:px-0">
                <div className="text-primary font-bold text-xs bg-custom-d6d7ff p-2 rounded tracking-[3.84px]">A NEW EXPERIENCE</div>
                <div className="font-funnel-display text-2xl md:text-5xl font-semibold text-primary mt-6">You are the HUB</div>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

                    {/* HUB 1 */}
                    <Hub1 />

                    {/* HUB 2 */}
                    <Hub2 />

                    {/* HUB 3 */}
                    <Hub3 />

                </div>

            </div>
        </div>
    );
}

export default Hub;