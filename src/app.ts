import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";
import express from "express";
import { scheduleGetReservation } from "./utils/scheduler.util";
import { createRouting } from "./utils/router.util";
import { appDatabase } from "./utils/database.util";
import { errorHandler } from "./middleware/error.middleware";

const main = async () => {
    const app = express();
    app.listen(5173);
    app.use(errorHandler)
    scheduleGetReservation()
    createRouting(app)
    console.log("Express application is up and running on port " + 5173);
    await appDatabase.initialize();
};

main().catch(err => {
    console.error(err);
});
