"use client";

import ButtonLink from "@/components/global/buttonLink";

const Logo = (props: { image: string, svg: string, png: string, isLight: boolean }) => {
    return (
        <div className={`flex items-center justify-center rounded-2xl h-[200px] md:h-[240px] relative ${props.isLight ? "bg-white" : "border border-white"} p-4 md:p-0`}>
            <img src={props.image} className="" />
            <div className="absolute bottom-4 right-4 text-red-500 flex items-center gap-2">
                <a
                    href={props.svg}
                    download
                    className="flex items-center gap-2 bg-text hover:bg-gray-700 transition-all text-white rounded p-2 py-1 font-bold text-xs"
                >
                    <img src="/icons/download.svg" />
                    <div>SVG</div>
                </a>
                <a
                    href={props.png}
                    download
                    className="flex items-center gap-2 bg-text hover:bg-gray-700 transition-all text-white rounded p-2 py-1 font-bold text-xs"
                >
                    <img src="/icons/download.svg" />
                    <div>PNG</div>
                </a>
            </div>
        </div>
    );
}

const Color = (props: { title: string, hexText: string, rgbText: string, isWhite?: boolean }) => {
    return (
        <div className={`bg-[${props.hexText}] aspect-square rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-end p-2 md:p-8 ${props.isWhite ? "border border-text text-text" : ""}`}>
            <div className="flex-1 flex flex-col justify-center md:justify-start">
                <div className="font-semibold">{props.title}</div>
                <div className="text-xs md:text-sm font-semibold opacity-60">{props.hexText}</div>
                <div className="text-xs md:text-sm font-semibold opacity-60">{props.rgbText}</div>
            </div>
            <button
                className="self-end gap-2 bg-text hover:bg-gray-700 transition-all text-white rounded p-2 py-2 font-bold text-xs cursor-pointer border border-gray-500"
                onClick={async () => {
                    await navigator.clipboard.writeText(props.hexText)
                }}
            >
                <img src="/icons/copy.svg" />
            </button>
        </div>
    );
}

export default function Page() {
    const classCache = <div className="bg-[#0008FF] bg-[#666BFF] bg-[#23262F] bg-[#F8F8FF]" />;

    return (
        <div className="flex flex-col bg-white z-10">
            <div className="container mx-auto mt-4">
                <img src="/images/brand.svg" className="w-full" />
            </div>
            <div className="bg-primary text-white mt-28">
                <div className="container mx-auto flex flex-col py-4 md:py-14 px-4 md:px-0">
                    <div className="w-full flex items-center justify-between">
                        <div className="text-5xl font-semibold">Logos</div>
                        <ButtonLink
                            title="Download logo assets"
                            url={"/escher-brand-assets.zip"}
                            postImage="/icons/download-blue.svg"
                            className="bg-custom-e1e2ff text-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 mt-10">
                        <Logo
                            image="/brand/wide-black.svg"
                            svg="/brand/wide-black.svg"
                            png="/brand/wide-black.png"
                            isLight={true}
                        />
                        <Logo
                            image="/brand/wide-white.svg"
                            svg="/brand/wide-white.svg"
                            png="/brand/wide-white.png"
                            isLight={false}
                        />
                        <Logo
                            image="/brand/wide-blue.svg"
                            svg="/brand/wide-blue.svg"
                            png="/brand/wide-blue.png"
                            isLight={true}
                        />

                        <Logo
                            image="/brand/square-black.svg"
                            svg="/brand/square-black.svg"
                            png="/brand/square-black.png"
                            isLight={true}
                        />
                        <Logo
                            image="/brand/square-white.svg"
                            svg="/brand/square-white.svg"
                            png="/brand/square-white.png"
                            isLight={false}
                        />
                        <Logo
                            image="/brand/square-blue.svg"
                            svg="/brand/square-blue.svg"
                            png="/brand/square-blue.png"
                            isLight={true}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto my-28 p-4 md:p-0">
                <div className="text-text text-5xl font-semibold">Colors</div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 text-white">
                    <Color
                        title="Blue"
                        hexText="#0008FF"
                        rgbText="rgb(0,8,255,100)"
                    />
                    <Color
                        title="Neon Blue"
                        hexText="#666BFF"
                        rgbText="rgb(102,107,255,100)"
                    />
                    <Color
                        title="Raisin Black"
                        hexText="#23262F"
                        rgbText="rgb(35,38,47,100)"
                    />
                    <Color
                        title="Ghost White"
                        hexText="#F8F8FF"
                        rgbText="rgb(248,248,255,100)"
                        isWhite={true}
                    />
                </div>
            </div>
        </div>
    );
}
