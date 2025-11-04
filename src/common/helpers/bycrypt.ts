import * as bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt.
 * @param password - The plain text password to hash.
 * @param saltRounds - The number of salt rounds to use (default: 10).
 * @returns The hashed password as a Promise<string>.
 */
const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password.
 * @param hash - The hashed password.
 * @returns True if the passwords match, false otherwise.
 */
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
}

export { hashPassword, comparePassword };