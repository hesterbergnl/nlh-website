import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import About from './pages/About';
import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from "react-bootstrap";

const App: React.FC = () => {
    return (
        <Container>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/about" element={<About />} />
            </Routes>
            <Footer />
        </Container>
    );
};


export default App;
