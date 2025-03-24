import React from 'react';
import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import About from './pages/About';
import Login from './pages/Login'
import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { initializePosts } from './store/slices/postsSlice';
import NewPost from "./pages/NewPost.tsx";

const App: React.FC = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        // @ts-ignore
        dispatch(initializePosts())
    }, [dispatch])

    return (
        <Container>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />}/>
                <Route path="/newpost" element={<NewPost />}/>
            </Routes>
            <Footer />
        </Container>
    );
};


export default App;
