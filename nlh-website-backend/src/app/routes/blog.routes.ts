const blogRouter = require('express').Router()
import { getBlogs, addBlog } from '../services/BlogService'

//TODO properly define these routes with TS definitions and validation and separate out to the service files
blogRouter.get('/', async (_req: Request, res: any) => {
    res.json(getBlogs())
})

blogRouter.post('/', async (req: any, res: any) => {
    res.json(addBlog(req.body))
})

export default blogRouter