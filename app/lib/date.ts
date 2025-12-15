import { APP_CONFIG } from "@/configs/app";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string) => {
    const diffInDays = dayjs().diff(dayjs(date), 'day');
    return diffInDays > 1
        ? dayjs(date).format('YYYY-MM-DD')
        : dayjs(date).fromNow();
};

export const formatDateOnly = (date: string, format: string = 'YYYY-MM-DD') => {
    return dayjs(date).format(format);
};

export const formatDateOnlyUnix = (date: number, format: string = 'YYYY-MM-DD') => {
    return dayjs.unix(date).format(format);
};

export const isExpired = (timestamp: string, seconds: number) => {
    const now = new Date().getTime();
    const endTime = new Date(timestamp).getTime() + (seconds * 1000);
    const timeDiff = Math.floor((endTime - now) / 1000);
    if (timeDiff <= 0) {
        return true;
    }
}

export const incrementDateWithSeconds = (timestamp: string, seconds: number) => {
    return dayjs(timestamp).add(seconds, "second").format('YYYY-MM-DDTHH:mm:ss');
}

export const getDateNow = () => {
    return dayjs().utcOffset(0).format(APP_CONFIG.dateTimeFormat);
}

export const hoursAgo = (date: string) => {
    const diffInHours = dayjs().diff(dayjs(date), 'hour');
    return diffInHours;
};

const totalSecondsPerDay = 24 * 60 * 60;
const totalSecondsPerHour = 60 * 60;

export const convertSecondsToTimeParts = (totalSeconds: number) => ({
    days: Math.floor(totalSeconds / totalSecondsPerDay),
    hours: Math.floor((totalSeconds % totalSecondsPerDay) / totalSecondsPerHour),
    minutes: Math.floor((totalSeconds % totalSecondsPerHour) / 60),
    seconds: Math.floor(totalSeconds % 60)
})