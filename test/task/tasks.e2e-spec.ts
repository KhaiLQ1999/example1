import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { testApp } from '../utils';

describe('[Feature] Tasks - /tasks', () => {
  let app: INestApplication;
  let taskTest;
  let requests;
  const task = {
    name: "bla bla",
    status: false,
    user: {
      id: 1,
      username: 'user',
      password: 'user',
      admin: false
    }
  }

  const task2 = {
    name: "hahah haha",
    status: true,
    user: {
      id: 2,
      username: 'admin',
      password: 'admin',
      admin: true
    }
  }

  beforeAll(async () => {
    app = await testApp();
    requests = request(app.getHttpServer());
  });

  describe('Create task', () => {
    it('Create [POST /]', () => {
      return requests
        .post('/tasks')
        .send(task as CreateTaskDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedTask = expect.objectContaining(task);
          taskTest = body;
          expect(body).toEqual(expectedTask);
        })
    });
  })

  describe('change status task', () => {
    it('Change status [PATCH /tasks/change-status/:id]', () => {
      return requests.patch('/tasks/change-status/' + taskTest.id)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          let expectedTask = {
            id: taskTest.id,
            name: taskTest.name,
            status: true
          }
          expect(body).toEqual(expectedTask);
        })
    });

    it('Change status with task not exist [PATCH /tasks/change-status/:id]', () => {
      return requests.patch('/tasks/change-status/-1')
        .expect(HttpStatus.NOT_FOUND)
    });

    it('Change status with permission denined [PATCH /tasks/change-status/:id]', () => {
      return requests.post('/tasks')
        .send(task2 as CreateTaskDto)
        .then(({ body }) => {
          return requests.patch('/tasks/change-status/' + body.id)
            .expect(HttpStatus.NOT_FOUND)
        });
    });
  });

  describe('update task', () => {
    let taskUpdate = {};
    const updateTaskDto = {
      ...task,
      name: 'new task name'
    }

    it('Update ok task [PATCH /:id]', () => {
      return requests.post('/tasks')
        .send(task as CreateTaskDto)
        .then(({ body }) => {
          return requests.patch('/tasks/' + body.id)
            .send(updateTaskDto)
            .then(({ body }) => {
              taskUpdate = body;
              expect(body.name).toEqual(updateTaskDto.name);
            })
        });
    });

    it('Update with not exist task [PATCH /:id]', () => {
      return requests.patch('/tasks/-1')
        .send(updateTaskDto)
        .expect(HttpStatus.NOT_FOUND)
    });

    it('Update with permission denied [PATCH /:id]', () => {
      return requests.post('/tasks')
        .send(task2 as CreateTaskDto)
        .then(({ body }) => {
          return requests.patch('/tasks/'+body.id)
            .send({name: "new new haha"})
            .expect(HttpStatus.NOT_FOUND)
        });
    });
  });

  describe('delete task', () => {
    it('Delete ok task [DELETE /:id]', () => {
      return request(app.getHttpServer())
        .delete('/tasks/' + taskTest.id)
        .expect(HttpStatus.OK)
        .then(() => {
          return request(app.getHttpServer())
            .get('/tasks/' + taskTest.id)
            .expect(HttpStatus.NOT_FOUND);
        });
    });

    it('Delete with permission denied [DELETE /:id]', () => {
      return requests.post('/tasks')
        .send(task2 as CreateTaskDto)
        .then(({ body }) => {
          return requests.delete('/tasks/' + body.id)
            .expect(HttpStatus.NOT_FOUND);
        });
    });

    it('Delete with not exist task [DELETE /:id]', () => {
      return requests.delete('/tasks/-1')
        .expect(HttpStatus.NOT_FOUND);
    });
  })

  afterAll(async () => {
    await app.close();
  })
});
