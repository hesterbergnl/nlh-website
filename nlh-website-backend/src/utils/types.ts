interface BlogAttributes {
    id: number;
    title: string;
    description: string;
    content: string;
    published: boolean;
    publishedAt: Date;
    createdById: number;
    category: string;
}


export default BlogAttributes