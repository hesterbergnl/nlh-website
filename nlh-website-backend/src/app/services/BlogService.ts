import {Blog} from "../models/ModelSync";
import {BlogAttributes, BlogEntrySubmission} from '../../utils/types';

export const getBlogs = async (): Promise<BlogAttributes[]> => {
    return await Blog.findAll()
}

export const addBlog = async (data: any): Promise<BlogAttributes> => {
    if(validateBlogEntry(data)) {
        // @ts-ignore
        // TODO fix this error
        return await Blog.create(data)
    }
    throw new Error('Invalid blog entry')
}

const validateBlogEntry = (data: any): data is BlogEntrySubmission => {
    if (!data) return false
    if (!data.title) return false
    if (!data.description) return false
    if (!data.content) return false
    if (!data.published) return false
    if (!data.publishedAt) return false
    if (!data.createdById) return false
    if (!data.category) return false
    return true
}