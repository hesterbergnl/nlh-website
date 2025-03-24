// src/components/Header.tsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {RootState} from '../store';
import {useNavigate} from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

const NavigationBar: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login'); // Redirect to login after logout
    };

    return (
        <Navbar bg="light" expand="md" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href='#' as={Link} to='/'>
                    NH
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className="me-auto">
                        <Nav.Link href='#' as={Link} to='/'>
                            Home
                        </Nav.Link>
                        <Nav.Link href='#' as={Link} to='/about'>
                            About
                        </Nav.Link>
                    </Nav>
                    {user ? (
                        <Nav>
                            <Nav.Link href='#' as={Link} to='/newpost'>
                                New Post
                            </Nav.Link>
                            <Navbar.Text className="me-2">
                                Signed in as: {user.email}
                            </Navbar.Text>
                            <Button variant="outline-secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </Nav>
                    ) : (
                        <Nav>
                            <Nav.Link as={Link} to="/login">
                                Login
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;