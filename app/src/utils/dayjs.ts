import dayjs from "dayjs";

export const dayFormatter = (date: Date) => dayjs(date).format("YYYY-MM-DD");