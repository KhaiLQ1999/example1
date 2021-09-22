import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('follow/:id')
  follow (@Param('id') id: string) {
    return this.usersService.follow(+id);
  }

  @Get('unfollow/:id')
  unfollow (@Param('id') id: string) {
    return this.usersService.unfollow(+id);
  }

  @Get('task-unfinisheds')
  taskUnfinisheds() {
    return this.usersService.taskUnfinisheds();
  }

  @Get('task-finisheds')
  taskFinisheds() {
    return this.usersService.taskFinisheds();
  }

  @Get('task-following')
  taskFollowing() {
    return this.usersService.taskFollowing();
  }

  @Get('remove/:id') 
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
