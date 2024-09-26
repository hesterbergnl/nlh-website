import User from '../models/UserModel'

export const createUser = async (name: string, username: string, email: string, hashedPassword: string, createdById: number) => {
    // Create a new user
    return await User.create({name, username, email, password: hashedPassword, createdById});
};
