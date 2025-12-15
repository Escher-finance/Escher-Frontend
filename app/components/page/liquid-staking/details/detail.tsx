interface Props {
    icon: string
    iconDark: string
    value: string
    title: string
    themeIsDark: boolean
}

const Detail = (props: Props) => {
    return (
        <div className="flex justify-between items-center border-t border-escher-gray200 dark:border-escher-darkblue_border py-4">
            <div className="flex gap-4 items-center">
                <Image alt="" src={props.themeIsDark ? props.iconDark : props.icon} width={24} height={24} alt="" />
                <div className="font-semibold text-escher-gray900 dark:text-white">{props.value}</div>
            </div>
            <div className="text-escher-777e90">{props.title}</div>
        </div>
    );
}

export default Detail;