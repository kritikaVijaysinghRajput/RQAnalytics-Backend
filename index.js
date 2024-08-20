import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

mongoose
  .connect(
    "mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.n10ox.mongodb.net/RQ_Analytics?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.json());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Connected to database: RQ_ANALYTICS`);
});
