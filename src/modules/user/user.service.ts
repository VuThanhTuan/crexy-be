import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '@/database/entities/user.entity';
import { UserRepository } from './user.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { hashPassword, comparePassword } from '@/common/helpers/bycrypt';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async findOne(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async create(createUserDto: Partial<User>): Promise<User> {
        return await this.userRepository.create(createUserDto);
    }

    async update(id: string, updateUserDto: Partial<User>): Promise<User | null> {
        const exists = await this.userRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('User not found');
        }
        return (await this.userRepository.update(id, updateUserDto)) ?? null;
    }

    async remove(id: string): Promise<void> {
        const affected = await this.userRepository.delete(id);
        if (affected === 0) {
            throw new NotFoundException('User not found');
        }
    }

    /**
     * Register a new user
     */
    async register(registerDto: RegisterUserDto): Promise<User> {
        // Check if email already exists
        const existingUser = await this.userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email đã được sử dụng');
        }

        // Validate password match
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException('Mật khẩu xác nhận không khớp');
        }

        // Hash password
        const hashedPassword = await hashPassword(registerDto.password);

        // Create user
        const user = await this.userRepository.create({
            email: registerDto.email,
            fullname: registerDto.fullname,
            phoneNumber: registerDto.phone,
            password: hashedPassword,
            address: registerDto.address,
            isStaff: false,
            isSuperAdmin: false,
        });

        // Remove password from response
        delete (user as any).password;
        return user;
    }

    /**
     * Get user profile by id
     */
    async getProfile(id: string): Promise<User | null> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // Remove password from response
        delete (user as any).password;
        return user;
    }

    /**
     * Update user information (email cannot be updated)
     */
    async updateProfile(id: string, updateDto: UpdateUserDto): Promise<User | null> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Prepare update data
        const updateData: Partial<User> = {};
        if (updateDto.fullname !== undefined) {
            updateData.fullname = updateDto.fullname;
        }
        if (updateDto.phone !== undefined) {
            updateData.phoneNumber = updateDto.phone;
        }
        if (updateDto.address !== undefined) {
            updateData.address = updateDto.address;
        }

        const updatedUser = await this.userRepository.update(id, updateData);
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        // Remove password from response
        delete (updatedUser as any).password;
        return updatedUser;
    }

    /**
     * Change user password
     */
    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate new password match
        if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
            throw new BadRequestException('Mật khẩu xác nhận không khớp');
        }

        // Verify old password
        const isOldPasswordValid = await comparePassword(changePasswordDto.oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new UnauthorizedException('Mật khẩu cũ không đúng');
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(changePasswordDto.newPassword);

        // Update password
        await this.userRepository.update(id, { password: hashedNewPassword });
    }
}
