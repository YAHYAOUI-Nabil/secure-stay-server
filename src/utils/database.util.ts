import { DataSource } from "typeorm";

export const appDatabase = new DataSource({
  type: "mariadb",
  host: process.env.DATABASE_URL,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "boarding-pass",
  synchronize: true,
  entities: ["src/entity/*.ts"],
  subscribers: ["src/subscriber/*.ts"],
  migrations: ["src/migration/*.ts"],
});

appDatabase
  .connect()
  .then((connection) => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
