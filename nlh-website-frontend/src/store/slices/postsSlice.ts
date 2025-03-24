// src/store/slices/postsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import postService from '../../services/post';

export interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    published: boolean;
    publishedAt: Date;
    category: string;
    createdById: number;
}

interface PostsState {
    posts: Post[];
}

const initialState: PostsState = {
    posts: [],
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        addPost: (state, action: PayloadAction<Post>) => {
            state.posts.push(action.payload);
        },
        setPosts: (state, action: PayloadAction<Post[]>) => {
            state.posts = action.payload;
        }
        // additional reducers like removePost, updatePost, etc.
    },
});

export const initializePosts = () => {
    return async (dispatch: any) => {
        try {
            const posts = await postService.getAll();
            dispatch(setPosts(posts));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };
};

//TODO: Setup this method to post to the backend
export const postSubmit = (postBody: string) => {
    console.log(postBody)
}

export const { addPost, setPosts } = postsSlice.actions;
export default postsSlice.reducer;