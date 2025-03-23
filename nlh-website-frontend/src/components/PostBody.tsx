// src/components/PostBody.tsx
// https://www.npmjs.com/package/react-markdown
import React from 'react';
import { Container } from 'react-bootstrap';
import Markdown from 'react-markdown';

interface PostBodyProps {
    markdown: string;
}

const PostBody: React.FC<PostBodyProps> = ({ markdown }) => (
    <Container>
        <Markdown>{markdown}</Markdown>
    </Container>
);

export default PostBody;