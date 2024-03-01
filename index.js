import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from 'cors'
import { v2 } from "cloudinary";
import multer from "multer";
import { prisma } from "./prisma.js";

v2.config({
  cloud_name: "alero",
  api_key: "356388273169343",
  api_secret: "ERw3AQeeCW6J7dSuxTlTM9dYE30",
});

const storage = multer.diskStorage({});
const upload = multer({ storage });


const app = express();
app.use(express.json());
app.use(cors('*'))

app.get("/", (req, res) => {
  res.send({ message: "Welcome AgborNigidi" });
});

app.post("/register", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth).toISOString(),
      },
    });
    return res.send({ data: user });
  } catch (error) {
    console.log(error);
    return res.send({ error: "An Error occurred" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const header = `Bearer ${process.env.TOKEN}`;
    if (req.headers.authorization !== header) {
      throw new Error();
    }
    const users = await prisma.user.findMany({
      where: {
        fullName: {
          contains: req.query.s,
        },
      },
    });
    res.send({ data: users });
    return;
  } catch (error) {
    console.log(error);
    return res.send({ error: "An Error occurred" });
  }
});

app.get("/all", async (req, res) => {
  try {
    const header = `Bearer ${process.env.TOKEN}`;
    if (req.headers.authorization !== header) {
      throw new Error();
    }
    const users = await prisma.user.findMany();
    res.send({ data: users });
    return;
  } catch (error) {
    console.log(error);
    return res.send({ error: "An Error occurred" });
  }
});

app.post("/login", (req, res) => {
  try {
    console.log(req.body);
  

    if (req.body.username !== "admin") {
      res.send({ message: "Wrong password or username" });
      return;
    }
    if (req.body.password !== "password") {
      res.send({ message: "Wrong password or username" });
      return;
    }

    res.send({ token: "21232f297a57a5a743894a0e4a801fc3" });
  } catch (error) {
    console.log(error);
    return res.send({ error: "An Error occurred" });
  }
});

app.post("/upload/:id", upload.single("image"), async (req, res) => {
  try {
    const result = await v2.uploader.upload(req.file.path);
    await prisma.user.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        passport: result.secure_url,
      },
    });
    res.send({message: "Passport uploaded successfully"})
  } catch (error) {
    console.log(error);
    return res.send({ error: "An Error occurred" });
  }
});

app.listen(8008, '0.0.0.0' ,() => {
  console.log("server is running on port http://localhost:8000");
});
