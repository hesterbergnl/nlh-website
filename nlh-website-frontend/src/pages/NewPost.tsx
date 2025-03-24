// src/components/NewPost.tsx
import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
// import { postSubmit } from '../store/slices/postsSlice';
import { useNavigate } from 'react-router-dom';
// import {useDispatch} from "react-redux";
import PostBody from "../components/PostBody.tsx";

const NewPost: React.FC = () => {
    const [postBody, setPostBody] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [postDescription, setPostDescription] = useState('');
    //TODO: Setup the post category so it is a selection of enumerated options
    const [postCategory, setPostCategory] = useState('');
    const navigate = useNavigate();
    // const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: fix the type of loginAction to be correct per typescript rules and link to corrected thunk
        // dispatch(postSubmit({ postBody }) as any);
        navigate('/'); // Redirect to the home page after login
    };

    return (
        <>
            <Container className="mt-5">
                <h2>New Post</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formPostTitle" className="mb-3">
                        <Form.Label column={true}>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Post Title."
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formPostDescription" className="mb-3">
                        <Form.Label column={true}>Description</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Post Description."
                            value={postDescription}
                            onChange={(e) => setPostDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formPostBody" className="mb-3">
                        {/*TODO: Add help option with a link to markdown style guide*/}
                        <Form.Label column={true}>Body</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            placeholder="Enter Post Body. Use Markdown for formatting"
                            value={postBody}
                            onChange={(e) => setPostBody(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formPostCategory" className="mb-3">
                        <Form.Label column={true}>Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Post Category."
                            value={postCategory}
                            onChange={(e) => setPostCategory(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Container>
            <Container className="mt-5">
                <h1>Preview</h1>
                <h2>{postTitle}</h2>
                <p>
                    <em>{postDescription}</em>
                </p>
                <p>
                    <em>Category: {postCategory}</em>
                </p>
                <PostBody markdown={postBody}/>
            </Container>
        </>


    );
};

export default NewPost;