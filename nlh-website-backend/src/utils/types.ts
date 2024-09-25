export interface BlogAttributes {
    id: number;
    title: string;
    description: string;
    content: string;
    published: boolean;
    publishedAt: Date;
    createdById: number;
    category: string;
}

export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    username: string;
    password: string;
    createdById: number;
}

export interface UserSubmission {
    name: string;
    email: string;
    username: string;
    password: string;
    createdById: number;
}

export interface BlogEntrySubmission {
    title: string;
    description: string;
    content: string;
    published: boolean;
    publishedAt: Date;
    createdById: number;
    category: string;
}