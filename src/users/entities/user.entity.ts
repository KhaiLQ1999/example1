import { OneToMany } from 'typeorm';
import { Entity } from 'typeorm';
import { Task } from './../../tasks/entities/task.entity';
import { type } from 'os';
import { Column, JoinTable, ManyToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
    @PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	password: string;

	@Column()
	admin: boolean;

    @JoinTable()
    @ManyToMany(type => Task, task => task.users, {cascade: true})
    tasks: Task[];

    @OneToMany(type => Task, task => task.user)
	myTasks: Task[];
}
