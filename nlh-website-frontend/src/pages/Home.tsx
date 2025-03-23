import React from 'react';
import PostBody from '../components/PostBody.tsx';
import PostSummary from '../components/PostSummary.tsx';

const Home: React.FC = () => (
    <div>
        <PostSummary/>
        <PostBody/>
        <p> This is the home page </p>
    </div>
);

export default Home;