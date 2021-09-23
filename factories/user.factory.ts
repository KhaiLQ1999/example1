import * as Faker from 'faker';
import { User } from '../src/users/entities/user.entity';
import { Factory } from "typeorm-factory";
 
const UsertFactory = new Factory(User)
  .sequence("username", () => Faker.name.findName())
  .attr("password", "abc")
  .attr("admin", Faker.random.boolean)

export const build = async () => {
  await UsertFactory.buildList(1)
  await UsertFactory.createList(1)
}