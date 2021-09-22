import { Task } from './../../tasks/entities/task.entity';
export class CreateUserDto {
    username: string;
    
    password: string;

    admin: boolean;

    tasks: Task[];
}
