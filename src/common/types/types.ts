import { MEDIA_TYPE, MEDIA_CATEGORY, DISCOUNT_TYPE } from '../consts/app';

export type JwtPayload = {
    sub: string;
    username: string;
    exp: number;
}

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];
export type MediaCategory = (typeof MEDIA_CATEGORY)[keyof typeof MEDIA_CATEGORY];
export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];
