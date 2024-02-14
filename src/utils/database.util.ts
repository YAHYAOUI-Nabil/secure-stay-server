import {DataSource} from "typeorm";

export const appDatabase = new DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: Number(process.env.DATABASE_PORT),
    username: 'root',
    password: 'temp',
    database: 'boarding-pass',
    synchronize: true,
    entities: ['src/entity/*.ts'],
    subscribers: ['src/subscriber/*.ts'],
    migrations: ['src/migration/*.ts']
})