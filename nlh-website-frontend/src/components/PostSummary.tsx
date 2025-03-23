import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const PostSummary: React.FC = () => {
    const posts = useSelector((state: RootState) => state.posts).posts
    console.log(posts)

    return (
        <div>
            <h1> Posts </h1>
            { posts.map((post) => (
                <div key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                </div>
            ))}
        </div>
    )
};

export default PostSummary;