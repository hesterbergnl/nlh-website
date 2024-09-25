import User from '../models/UserModel'
import {UserSubmission} from "../../utils/types";
import {generateToken, hashPassword} from "../../utils/auth";

export const createUser = async (data: UserSubmission): Promise<string> => {
    // TODO fix bug, where the token is not correctly returned to the user
    if(validateUserData(data)) {
        const { name, username, email, password, createdById } = data;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = await User.create({ name, username, email, password: hashedPassword, createdById });

        // Generate JWT token
        const token = generateToken(newUser.id);

        console.log(`Token: ${token}`)

        return token;
    }

    throw new Error('User validation failed');
}

const validateUserData = (data: any): data is UserSubmission => {
    if (!data) return false;
    if (!data.name) return false;
    if (!data.username) return false;
    if (!data.password) return false;
    if (!data.createdById) return false;
    return true;
}