import { Request, Response } from 'express';
import { matchedData } from 'express-validator'
import { getBlogs, addBlog } from '../services/BlogService';
import { decodeToken } from '../../utils/auth';

export const getBlogsHandler = async (_req: Request, res: Response) => {
    try {
        const blogs = await getBlogs();
        res.status(200).json(blogs);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Server Error' });
    }
};

export const addBlogHandler = async (req: Request, res: Response) => {
    try {
        const token = decodeToken(req);
        const createdById = token && typeof token === 'object' ? token.id : null;
        console.log(createdById)
        const { title, content, description, published, publishedAt, category } = matchedData(req)
        const blog = await addBlog({ title, content, description, published, publishedAt, category, createdById });
        res.status(201).json(blog);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Server Error' });
    }
};