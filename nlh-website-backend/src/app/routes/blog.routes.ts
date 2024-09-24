import { Request, Response } from 'express';
import { getBlogs, addBlog } from '../services/BlogService';
import { Router } from 'express';

const blogRouter = Router();

//TODO properly define these routes with TS definitions and validation and separate out to the service files
blogRouter.get('/', (_req: Request, res: Response) => {
    res.json(getBlogs());
});

blogRouter.post('/', (req: Request, res: Response) => {
    res.json(addBlog(req.body));
});

export default blogRouter;