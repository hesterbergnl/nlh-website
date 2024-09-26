import User from '../models/UserModel'
import {generateToken, hashPassword} from "../../utils/auth";

export const createUser = async (name: string, username: string, email: string, password: string, createdById: number) => {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = await User.create({ name, username, email, password: hashedPassword, createdById });

    // Generate JWT token
    const token = generateToken(newUser.id);

    return { message: 'User created successfully', token: token };
};
