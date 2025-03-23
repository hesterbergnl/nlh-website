// src/components/PostBody.tsx
// https://www.npmjs.com/package/react-markdown
import React from 'react';
import { Container } from 'react-bootstrap';
import Markdown from 'react-markdown';

const markdown = '# Hi, *Pluto*!'

const PostBody: React.FC = () => (
    <Container>
        <Markdown>{markdown}</Markdown>
    </Container>
);

export default PostBody;