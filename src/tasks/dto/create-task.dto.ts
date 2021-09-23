import { User } from './../../users/entities/user.entity';
import { IsBoolean, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    status: boolean;

    @IsObject()
    user: User;
}
