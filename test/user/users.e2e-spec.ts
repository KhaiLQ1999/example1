import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testApp } from '../utils';
import { getRepository } from 'typeorm';
import { Task } from '../../src/tasks/entities/task.entity';
import { User } from '../../src/users/entities/user.entity';
import { build } from '../../factories/user.factory';

describe('[Feature] User - /users', () => {
  let app: INestApplication;
  let taskTest;
  let requests;
  let taskRepository;
  let userRepository;
  let currentUser;

  const user1 = {
    id: 1,
    username: 'user',
    password: 'user',
    admin: false,
  }

  const task = {
    name: "bla bla",
    status: false,
    user: user1
  }

  const user2 = {
    id: 2,
    username: 'admin',
    password: 'admin',
    admin: true,
  }
  const task2 = {
    name: "hahah haha",
    status: true,
    user: user2
  }

  beforeAll(async () => {
    app = await testApp();
    taskRepository = getRepository(Task);
    userRepository = getRepository(User);
    requests = request(app.getHttpServer());
    await build();
  });

  describe('Follow task', () => {
    it('follow task [GET users/follow/:id]', async () => {
      let newTask = await taskRepository.create(task);
      newTask = await taskRepository.save(newTask);
      taskTest = newTask;

      return requests
        .get('/users/follow/' + newTask.id)
        .then(async ({ body }) => {
          currentUser = await userRepository.findOne(1, {
            relations: ['tasks']
          });
          expect(body.tasks).toEqual(currentUser.tasks)
        })
    });

    it('follow with task not exist [GET users/follow/:id]', () => {
      return requests
        .get('/users/follow/-1')
        .expect(HttpStatus.NOT_FOUND)
    });
  })

  describe('Unfollow task', () => {
    it('unfollow task [GET /users/unfollow/:id]', () => {
      return requests.get('/users/unfollow/' + taskTest.id)
        .expect(HttpStatus.OK)
        .then(async ({ body }) => {
          currentUser = await userRepository.findOne(1, {
            relations: ['tasks']
          });
          expect(body.tasks).toEqual(currentUser.tasks)
        })
    });
  });

  describe('get unfinished task', () => {
    it('Get unfinished task [GET users/task-unfinisheds]', () => {
      return requests.get('/users/task-unfinisheds')
        .expect(HttpStatus.OK)
        .then(async ({body}) => {
          const tasksUnfinished = await taskRepository.find({
            user: currentUser,
            status: false
          });

          expect(body).toEqual(tasksUnfinished);
        });
    });
  });

  
  describe('get finished task', () => {
    it('Get finished task [GET users/task-finisheds]', () => {
      return requests.get('/users/task-finisheds')
        .expect(HttpStatus.OK)
        .then(async ({body}) => {
          const tasksFinished = await taskRepository.find({
            user: currentUser,
            status: true
          });

          expect(body).toEqual(tasksFinished);
        });
    });
  });

  describe('get following task', () => {
    it('Get following task [GET users/task-following]', () => {
      return requests
        .get('/users/task-following')
        .then(async ({ body }) => {
            currentUser = await userRepository.findOne(1, {
            relations: ['tasks']
          });
          expect(body).toEqual(currentUser.tasks)
        });
    });
  });

  describe('remove user', () => {
    it('Remove admin user [DELETE users/:currentUser/remove/:id]', async () => {
      const admin = await userRepository.findOne({
        admin: true,
      });
      
      return requests
        .delete(`/users/${user2.id}/remove/${admin.id}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Remove user with permission denied [DELETE users/:currentUser/remove/:id]', async () => {
      return requests
        .delete(`/users/${user1.id}/remove/${user2.id}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Remove user ok [DELETE users/:currentUser/remove/:id]', async () => {
      const user = await userRepository.findOne({
        where: {
          admin: false,
        },
        order: { id: 'DESC' },
      });

      return requests
        .delete(`/users/${user2.id}/remove/${user.id}`)
        .expect(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  })
});
