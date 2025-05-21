import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import apiRoutes from "./src/routes/api.route";

const app: express.Express = express();
const port: number = parseInt(process.env.PORT || "5000", 10);

app.use(express.json());

app.use("/api", apiRoutes);

app.listen(port, async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI!);
        console.log(`Server listening at http://localhost:${port}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});
