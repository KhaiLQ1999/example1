import { ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./../src/users/users.module";
import { TasksModule } from "./../src/tasks/tasks.module";

export const testApp = async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			TasksModule,
			UsersModule,
			TypeOrmModule.forRoot({
				type: 'mysql',
				host: 'mysql',
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

	const app = moduleFixture.createNestApplication();
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		transformOptions: {
			enableImplicitConversion: true
		}
	}));
	await app.init();
	return app;
}