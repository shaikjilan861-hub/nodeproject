// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const User = require("../models/userSchema");


// //REGISTER
// const register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.json({ message: "user already exist" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "user",
//     });
//     res.json(newUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// //LOGIN 
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.json({ message: "User not found" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.json({ message: "Password not match" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000);

//     user.otp = otp;
//     user.otpExpire = Date.now() + 5 * 60 * 1000;

//     await user.save();
//     console.log("OTP:", otp);
//     res.json({
//       message: "OTP sent successfully",
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// //VERIFY OTP
// const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.json({ message: "User not found" });
//     }

//     if (user.otp !== otp) {
//       return res.json({ message: "Invalid OTP" });
//     }

//     if (user.otpExpire < Date.now()) {
//       return res.json({ message: "OTP expired" });
//     }

//     user.otp = null;
//     user.otpExpire = null;
//     await user.save();

//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       message: "Login successful",
//       user,
//       token,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };




// module.exports = {
//   register,
//   login,
//    verifyOtp,
// };
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userSchema");
const sendOtpEmail = require("../utils/sendOtpEmail");


// ================= REGISTER =================
// ================= REGISTER (OTP ONLY FOR NEW USERS) =================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    // If user already exists → stop (NO OTP)
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create new user (unverified)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      otp: otp,
      otpExpire: Date.now() + 5 * 60 * 1000, // 5 minutes
       otpPurpose: "register", 
      isVerified: false,
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP sent for registration verification",
      email: newUser.email,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// ================= LOGIN (SEND OTP EMAIL) =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Password not match" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    user.otpPurpose = "login";
    await user.save();

    // 🔥 REAL-TIME EMAIL SEND
    await sendOtpEmail(email, otp);

    res.json({
      message: "OTP sent successfully to email",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check OTP match
    if (!user.otp || Number(user.otp) !== Number(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check OTP expiry
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // Store purpose before clearing
    const purpose = user.otpPurpose;

    // Clear OTP fields
    user.otp = null;
    user.otpExpire = null;
    user.otpPurpose = null;
    user.isVerified = true;

    await user.save();
  // ===== REGISTRATION FLOW =====
    if (purpose === "register") {
      return res.status(200).json({
        message: "Registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }
    // ===== LOGIN FLOW =====
    if (purpose === "login") {
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      });
    }

  

    
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




module.exports = {
  register,
  login,
  verifyOtp,
};
