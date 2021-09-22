import { Task } from './../tasks/entities/task.entity';
import { User } from './entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  // fake info user
  private user = 1;
  private admin = 2;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}
  async follow(idFollow: number) {
    // find user and task user follow
    const user = await this.userRepository.findOne({
      relations: ['tasks'],
      where: {
        id: this.user
      }
    });

    // find task user want follow
    const task = await this.taskRepository.findOne(idFollow);

    // check info task
    if(!task) {
      throw new HttpException({
        message: "Task not found",
      }, HttpStatus.NOT_FOUND);
    }

    /*
      create new list task
      if user loggedin have list task
      => new list task is current list task and new task follow
      else 
      => new list task is new task follow
    */
    let newListTask = [task];
    if(user.tasks) {
      newListTask = [
        ...user.tasks,
        task
      ]
    }
    
    // load update info user and save
    const newUser = await this.userRepository.preload({
      id: +this.user,
      tasks: newListTask
    });

    return this.userRepository.save(newUser);
  }

  async unfollow(idUnfollow) {
    // find user and task user follow
    const user = await this.userRepository.findOne({
      relations: ['tasks'],
      where: {
        id: this.user
      }
    });

    // find index of id task user want unfollow in list task user follow
    const index = user.tasks.findIndex(function(t){
        return t.id == idUnfollow
      }
    );

    // if have in list task user follow, remove it
    if(index > -1) {
      user.tasks.splice(index, 1);
    }
    
    
    // load new info user and update
    const newUser = await this.userRepository.preload({
      id: +this.user,
      tasks: user.tasks
    });

    return this.userRepository.save(newUser);
  }

  async taskUnfinisheds() {
    // find info user loggedin
    const user = await this.userRepository.findOne(this.user);
    
    // find all task current user create and have status = false
    const tasks = await this.taskRepository.find({
      where: {
        user: user,
        status: false
      }
    });

    return tasks;
  }

  async taskFinisheds() {
    // find info user loggedin
    const user = await this.userRepository.findOne(this.user);
    
    // find all task current user create and have status = true
    const tasks = await this.taskRepository.find({
      where: {
        user: user,
        status: true
      }
    });

    return tasks;
  }

  async taskFollowing() {
    // find user logged in and all task user following
    const user = await this.userRepository.findOne({
      relations: ['tasks'],
      where: {
        id: this.user
      }
    });

    return user.tasks;
  }

  async remove(id: number) {
    // find info user logged in 
    const currentUser = await this.userRepository.findOne(this.admin);

    // check role of user
    if(currentUser.admin) {
      // if user is admin can remove record
      const user = await this.userRepository.findOne({
        id: id
      });
      return await this.userRepository.remove(user);
    }

    // if user isn't admin throw exception
    throw new HttpException({
      message: "Permission denied",
    }, HttpStatus.FORBIDDEN);
  }
}
