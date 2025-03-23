import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams } from 'react-router-dom';
import {Container} from "react-bootstrap";
import PostBody from '../components/PostBody';

interface RouteParams {
    id: string;
    [key: string]: string | undefined;
}

const Post: React.FC = () => {
    const posts = useSelector((state: RootState) => state.posts).posts
    const { id } = useParams<RouteParams>();
    const post = posts.find((post) => post.id === Number(id))

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <Container>
            <h1>{post.title}</h1>
            <i> {post.description} </i>
            <p> Written by: {post.createdById} </p>
            <PostBody markdown={post.content}/>
        </Container>
    );
}

export default Post;