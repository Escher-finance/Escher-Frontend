import { URL } from "@/config/app";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="bg-primary text-white z-10 px-8 md:p-0">
            <div className="container mx-auto flex flex-col py-8 md:py-14">
                <div className="flex flex-col-reverse gap-8 md:gap-0 md:flex-row justify-between">
                    <div className="flex flex-col">
                        <Image src={"/images/logo-wide-1.svg"} alt="Escher" width={512} height={512} className="w-1/2 md:w-[363px]" />
                        <div className="mt-3">Staking made limitless.</div>
                        <div className="flex items-center gap-4 mt-8">
                            <Link href={URL.twitter} target="_blank">
                                <Image src={"/icons/new-twitter.svg"} alt="twitter" width={24} height={24} />
                            </Link>
                            <Link href={URL.mailto}>
                                <Image src={"/icons/mail-02.svg"} alt="twitter" width={24} height={24} />
                            </Link>
                            <Link href={URL.discord} target="_blank">
                                <Image src={"/icons/discord.svg"} alt="discord" width={24} height={24} />
                            </Link>
                            <Link href={URL.github} target="_blank">
                                <Image src={"/icons/github-01.svg"} alt="twitter" width={24} height={24} />
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-8 text-sm md:text-base">
                        <div className="flex flex-col gap-2 font-medium">
                            <div className="font-semibold">Resources</div>
                            <Link href={"/brand"} className="hover:underline mt-2">Brand Asset</Link>
                            <Link href={"/faq"} className="hover:underline">FAQ</Link>
                        </div>
                        <div className="flex flex-col gap-2 font-medium">
                            <div className="font-semibold">Developers</div>
                            <Link href={URL.documentation} className="hover:underline mt-2" target="_blank">Docs</Link>
                        </div>
                        <div className="flex flex-col gap-2 font-medium">
                            <div className="font-semibold">Company</div>
                            <Link href={"/privacy-policy"} className="hover:underline mt-2">Privacy Policy</Link>
                            <Link href={"/terms-of-use"} className="hover:underline">Terms of use</Link>
                            <Link href={URL.mailto} className="hover:underline">Contact</Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white mt-16" />
                <div className="mt-8">&copy; 2026 ESCHER. All rights reserved.</div>
            </div>
        </div>
    );
}

export default Footer;