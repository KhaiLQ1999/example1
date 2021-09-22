import { User } from './../../users/entities/user.entity';
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    status: boolean;

    user: User;
}
