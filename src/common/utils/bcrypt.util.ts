import { compare, hashSync } from 'bcrypt';

export class BcryptUtil {
    static validateHashPassword(password: string | undefined, hash: string | undefined | null): Promise<boolean> {
        if (!password || !hash) {
            return Promise.resolve(false);
        }

        return compare(password, hash);
    }
    static generateHash(password: string): string {
        return hashSync(password, 10);
    }
}
