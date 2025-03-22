// src/components/Header.tsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import {Link} from "react-router-dom"; // optional for easier routing

const NavigationBar: React.FC = () => (
    <Navbar bg="light" expand="md" className="bg-body-tertiary">
        <Container>
            <Navbar.Brand href='#' as={Link} to='/'>My Blog</Navbar.Brand>
            <Navbar.Toggle aria-controls='basic-navbar-nav' />
            <Navbar.Collapse id='basic-navbar-nav'>
                <Nav className="me-auto">
                    <Nav.Link href='#' as={Link} to='/'>Home</Nav.Link>
                    <Nav.Link href='#' as={Link} to='/about'>About</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
);

export default NavigationBar;