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
    const user = await this.userRepository.findOne(createTaskDto.user?.id || this.user);

    // create task by user loggedin
    const task = await this.taskRepository.create({
      ...createTaskDto,
      user: user
    });
    return await this.taskRepository.save(task);
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
    const task = await this.taskRepository.findOne({
      relations: ['user'],
      where: {
        id
      }
    });

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

  async findOne(id: number) {
    const task = await this.taskRepository.findOne(id);

    if(!task) {
      throw new HttpException({
        message: "Record not found",
      }, HttpStatus.NOT_FOUND);
    }
    return task;
  }

  async remove(id: number) {
    const task = await this.taskRepository.findOne({
      relations: ['user'],
      where: {
        id
      }
    });
    
    if(!task || task.user?.id != this.user){
      throw new HttpException({
        message: "Record not found",
      }, HttpStatus.NOT_FOUND);
    }
    return this.taskRepository.remove(task);
  }
}
