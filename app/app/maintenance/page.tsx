import Image from "next/image";

const PageMaintenance = () => {
    return (
        <html>
            <body>
                <div className="container mx-auto py-12 flex flex-col leading-none">
                    <Image alt="" src="/images/maintenance-1.svg" width={153} />
                    <div className="mt-6 text-escher-text2 dark:text-white text-3xl font-bold">Temporary Maintenance</div>
                    <div className="mt-4 text-escher-text4 dark:text-white text-lg">
                        Escher is undergoing a system upgrade and is temporarily in maintenance mode. <br />
                        We&apos;ll be back shortly—thanks for your patience!
                    </div>
                </div>
            </body>
        </html>
    );
}

export default PageMaintenance;