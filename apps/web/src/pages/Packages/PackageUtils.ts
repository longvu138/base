import dayjs from 'dayjs';

export const formatPackageDate = (value?: string) =>
    value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '---';
