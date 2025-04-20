import express from 'express';
import { login, signUp, getProfile } from '../controllers/users.controller.js';
const userRoutes = express.Router();

userRoutes.post('/login', login);
userRoutes.post('/register', signUp)
userRoutes.get('/profile', getProfile)

export default userRoutes;