import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
    @ApiProperty()
    userName: string;

    @ApiProperty()
    password: string;
}