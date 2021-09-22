import { User } from './../users/entities/user.entity';
import { Task } from './entities/task.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  // fake user info
  private user = 1;
  private admin = 2;
  
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async create(createTaskDto: CreateTaskDto) {
    // find user logged in
    const user = await this.userRepository.findOne(this.user);

    // create task by user loggedin
    const task = await this.taskRepository.create({
      ...createTaskDto,
      user: user
    });
    return this.taskRepository.save(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    // load info user
    const task = await this.taskRepository.preload({
      id: +id,
      ...updateTaskDto,
    });
    
    // check task and user info
    if(!task || task.user?.id != this.user){
      throw new HttpException({
        message: "Record not found",
      }, HttpStatus.NOT_FOUND);
    }

    return this.taskRepository.save(task);
  }

  async changeStatus(id: number) {
    // find task 
    const task = await this.taskRepository.findOne(id);

    // check task info
    if(!task || task.user?.id != this.user){
      throw new HttpException({
        message: "Record not found",
      }, HttpStatus.NOT_FOUND);
    }
    
    // load new task
    const newTask = await this.taskRepository.preload({
      id: +id,
      status: !task.status
    });

    return this.taskRepository.save(newTask);
  }

  async remove(id: number) {
    // find task
    const task = await this.taskRepository.findOne(id);

    // check task and user info
    if(!task || task.user?.id != this.user){
      throw new HttpException({
        message: "Record not found",
      }, HttpStatus.NOT_FOUND);
    }
    return this.taskRepository.remove(task);
  }
}
