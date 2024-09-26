import { Router } from 'express';
import { addBlogHandler, getBlogsHandler } from '../controllers/BlogController';
import { validateBlogEntry } from '../../utils/validation';

const blogRouter = Router();

blogRouter.get('/', getBlogsHandler);

blogRouter.post('/', validateBlogEntry, addBlogHandler);

export default blogRouter;