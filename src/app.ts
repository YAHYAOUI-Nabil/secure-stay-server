import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express from "express";
import { scheduleGetReservation } from "./utils/scheduler.util";
import { createRouting } from "./utils/router.util";
import { appDatabase } from "./utils/database.util";
import { errorHandler } from "./middleware/error.middleware";
import path from "path";

const main = async () => {
  const app = express();
  app.listen(process.env.PORT);
  app.use(errorHandler);
  // app.use(express.static(path.join(__dirname, "uploads")));

  scheduleGetReservation();
  createRouting(app);
  console.log(
    "Express application is up and running on port " + process.env.PORT
  );
  await appDatabase.initialize();
};

main().catch((err) => {
  console.error(err, "-------------------------");
});
