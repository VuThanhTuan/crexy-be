import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll() {
        return await this.userService.findAll();
    }

    @Get(':id') 
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @Post()
    async create(@Body() createUserDto: any) {
        return await this.userService.create(createUserDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: any) {
        return await this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.userService.remove(id);
    }
}
