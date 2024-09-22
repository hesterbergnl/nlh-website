import { Blog } from './../models/ModelSync'
const blogRouter = require('express').Router()

blogRouter.get('/', async (_req: Request, res: any) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})


export default blogRouter