const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const User = require("./Models/Users");


const authRoutes = require('./routes/auth.routes'); // ✅ REQUIRED
const projectRoutes = require('./routes/project.routes'); // ✅ REQUIRED

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// SECRET KEY for JWT
const JWT_SECRET = "MY_SUPER_SECRET_KEY";


// ----- MongoDB Connection -----
mongoose.connect("mongodb+srv://Medha:Mihit@cluster0.gcz3h.mongodb.net/wordware")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ----- Routes -----
// app.get("/", (req, res) => {
//   res.send("Server is running and MongoDB is connected!");
// });

// 📝 API Route: User Registration
// app.post("/register", async (req, res) => {
//     try {

//        console.log("Received data from frontend:", req.body);  //ADD THIS
//         const { name, email, password } = req.body;

//         // Check if user exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "Email already registered" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Save new user
//         const user = new User({
//             name,
//             email,
//             password: hashedPassword
//         });

//        // await user.save();

//         console.log("Saving user:", email);
// await user.save();
// console.log("User saved!");


//         // Generate JWT token
//         const token = jwt.sign(
//             { id: user._id, email: user.email },
//             JWT_SECRET,
//             { expiresIn: "1d" }   // token valid for 1 day
//         );

//         return res.json({
//             message: "User registered successfully",
//             token: token
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Server error" });
//     }
// });

// app.get("/", (req, res) => {
//   res.send("API working!");
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, name:user.name,email: user.email },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.json({
//       message: "Login successful",
//       token: token,
//       user: {
//     id: user._id,
//     name: user.name,
//     email: user.email
//   }
//     });
   

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

  

app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);


    //res.json({ message: "User registered successfully!" });

// ----- Start Server -----
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
