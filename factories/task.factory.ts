import { User } from './../src/users/entities/user.entity';
import * as Faker from 'faker';
import { define } from 'typeorm-factories';
import { Task } from '../src/tasks/entities/task.entity';

define(Task, (faker: typeof Faker) => {
  const task = new Task();

  task.id = faker.random.uuid();
  task.name = faker.name.findName();
  task.status = faker.boolean();
  task.user = faker.User();

  return task;
});