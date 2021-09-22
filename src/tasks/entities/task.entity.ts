import { User } from './../../users/entities/user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from "typeorm";
@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    status: boolean;

    @ManyToMany(type => User, user => user.tasks)
    users: User[];

    @ManyToOne(() => User, user => user.tasks, {onDelete: "CASCADE"})
	user: User;
}
