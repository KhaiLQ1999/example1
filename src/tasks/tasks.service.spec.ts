import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../users/entities/user.entity';
import { Connection, getRepository, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: Connection, useValue: {} },
        { provide: getRepositoryToken(Task), useValue: createMockRepository() },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get<MockRepository>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when task with id exists', () => {
      it('should return the task object', async () => {
        const taskId  = '1';
        const expectedTask = {name: 'hahaha'};

        taskRepo.findOne.mockReturnValue(expectedTask);
        const task = await service.findOne(+taskId);
        
        expect(task).toEqual(expectedTask);
      })
    });

    describe('otherwise', () => {
      it('shold throw "not found exception"', async () => {
        const taskId = '1';
        taskRepo.findOne.mockReturnValue(undefined);
        try {
          const task = await service.findOne(+taskId);
          
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toEqual('Record not found');
        }
      })
    })
  })
});
