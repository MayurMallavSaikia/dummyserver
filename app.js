const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");


const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const mongoUrl ='mongodb+srv://mayurDB:Hello123db@cluster0.bgeofph.mongodb.net/MyMovieDB?retryWrites=true&w=majority';

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));



  require("./model/userDetails");
  const User = mongoose.model("users");

  




app.post("/api/users/register", async (req, res) => {
  const { name, email, password, lastname, role, token } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({  success: false });
    }
    await User.create({
      name,
      email,
      password: encryptedPassword,
      lastname,
      role,
      token
    });
    res.send({  success: true });
  } catch (error) {
    res.send({  success: false, error});
  }
});





app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  

    if (!user) {
      return res.json({ loginSuccess: false,  message: "Auth failed, email not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET);
  
    if (res.status(201)) {
        return res.json({  loginSuccess: true, userId: user._id, name:user.name, token:token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ loginSuccess: false, message: "Wrong password" });


});






const port= process.env.PORT || 5000

app.listen(port, () => {
  console.log("Server Started at port "+port);
});

