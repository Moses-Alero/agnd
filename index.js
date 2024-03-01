import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createHash } from "crypto";
import { v2 } from "cloudinary";
import multer from "multer";
import { prisma } from "./prisma.js";

v2.config({
  cloud_name: "alero",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});
const upload = multer({ storage });

const adminHash = process.env.ADMIN_HASH;
const passwordHash = process.env.PASSWORD_HASH;

const app = express();
app.use(express.json());

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
    const username = createHash("md5").update(req.body.phone).digest("hex");
    const password = createHash("md5").update(req.body.password).digest("hex");

    if (adminHash !== username) {
      res.send({ message: "Wrong password or username" });
      return;
    }
    if (password !== passwordHash) {
      res.send({ message: "Wrong password or username" });
      return;
    }

    res.send({ token: process.env.TOKEN });
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

app.listen(8000, () => {
  console.log("server is running on port http://localhost:8000");
});
