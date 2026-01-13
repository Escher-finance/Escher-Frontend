import Link from "next/link";
import Icon from "./icons";

interface Props {
    role: string
    onLogout(): void
}

const Header = (props: Props) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <img
                className=" w-[200px]"
                src="/wide-white.svg"
                alt="Next.js logo"
            />
            {props.role === "admin" &&
                <>
                    <Link href={"/"} className="bg-sky-700 hover:bg-sky-600 transition-all px-4 py-1.5 rounded font-medium text-sm">Babylon</Link>
                    <Link href={"/union"} className="bg-sky-700 hover:bg-sky-600 transition-all px-4 py-1.5 rounded font-medium text-sm">Union</Link>
                    <div>|</div>
                    <Link href={"/lucky-draw"} className="bg-sky-700 hover:bg-sky-600 transition-all px-4 py-1.5 rounded font-medium text-sm">Lucky draw</Link>
                </>
            }
            <div className="flex-1" />
            <button onClick={props.onLogout} className="cursor-pointer text-rose-400 hover:text-rose-200"> <Icon type="FiLogOut" /> </button>
        </div>
    );
}

export default Header;