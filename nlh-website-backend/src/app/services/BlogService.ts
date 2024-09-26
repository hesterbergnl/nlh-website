import { Blog } from "../models/ModelSync";

export const getBlogs = async () => {
    return await Blog.findAll();
}

export const addBlog = async (entry: any) => {
    return await Blog.create(entry);
}