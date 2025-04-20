import User from "../models/users.model.js";
import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcrypt';

// Consistent secret key name
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (error, salt) => {
      if (error) return reject(error);
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) return reject(error);
        resolve(hash);
      });
    });
  });
};

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error: "Password too weak. Try mixing letters, numbers, and symbols.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ email, password: hashedPassword });

    return res.status(201).json({ message: "Successfully registered", user: newUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: "No user found" });
    }

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // should be true in production with HTTPS
      sameSite: "None", // for cross-origin
    }).json(existingUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.json(null);

  jwt.verify(token, process.env.JWT_SECRET, {}, (error, userData) => {
    if (error) {
      return res.status(401).json(null);
    }
    res.json(userData);
  });
};
