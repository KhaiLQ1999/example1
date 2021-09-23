import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from '../../src/tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';

describe('[Feature] Tasks - /tasks', () => {
  let app: INestApplication;
  let taskTest;
  const task = {
    name: "bla bla",
    status: true,
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TasksModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'test-db',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'qldt',

          entities: ["dist/**/*.entity{.ts,.js}"],
          synchronize: true,
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    }));
    await app.init();
  });

  it('Create [POST /]', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send(task as CreateTaskDto)
      .expect(HttpStatus.CREATED)
      .then(({body}) => {
        const expectedTask = expect.objectContaining(task);
        taskTest = body;
        expect(body).toEqual(expectedTask);
      })
  });
  it('Change status [GET change-status/:id]', () => {
    console.log(taskTest);
    console.log('sdaaaaaaaaaaaaaaaaaa');
    
    const requests = request(app.getHttpServer());
    return requests.post('/change-status/'+taskTest.id)
      .expect(HttpStatus.OK)
      .then(({body}) => {
        let expectedTask = {
          id: taskTest.id,
          name: taskTest.name,
          status: true
        }
        expect(body).toEqual(expectedTask);
      })
  });
  // it.todo('Update one [PATCH /:id]');
  it('Delete oke task [DELETE /:id]', () => {
    return request(app.getHttpServer())
      .delete('/tasks/'+taskTest.id)
      .expect(HttpStatus.OK)
      .then(() => {
        return request(app.getHttpServer())
          .get('/tasks/'+taskTest.id)
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  it('Delete with permission denied [DELETE /:id]', () => {
    const requests = request(app.getHttpServer());
    return requests.post('/tasks')
      .send(task2 as CreateTaskDto)
      .then(({body}) => {
        return requests.delete('/tasks/'+body.id)
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  afterAll(async () => {
    await app.close();
  })
});
