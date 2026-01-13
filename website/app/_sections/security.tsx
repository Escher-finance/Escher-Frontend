import ButtonLink from "@/components/global/buttonLink";
import { URL } from "@/config/app";

const Security = () => {
    return (
        <div className="bg-white py-16 md:py-28">
            <div className="container mx-auto flex flex-col md:flex-row justify-between px-4">
                <div className="md:w-[60%] flex flex-col items-start justify-center bg-primary text-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl p-8 md:p-10">
                    <div className="font-funnel-display font-bold text-2xl md:text-[32px] leading-none">Security You Can Trust</div>
                    <div className="text-sm md:text-base mt-4">At Escher Finance, your peace of mind is our priority. Our audited contracts and industry-leading safeguards let you stake with confidence.</div>

                    <ButtonLink
                        title="See Documentation"
                        url={URL.documentation}
                        postImage="/icons/arrow-up-right-03.svg"
                        className="bg-custom-e1e2ff text-primary mt-8"
                    />
                </div>
                <div className="flex-1 bg-custom-cccdff rounded-b-2xl md:rounded-b-none md:rounded-r-2xl flex justify-center items-center p-8">
                    <img src="/images/locks-2.svg" />
                </div>
            </div>
        </div>
    );
}

export default Security;