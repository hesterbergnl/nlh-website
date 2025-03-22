// src/components/Footer.tsx
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => (
    <footer className="bg-light py-3 mt-auto">
        <Container>
            <div className="text-left">
                <p className="mb-0">&copy; {new Date().getFullYear()} My Blog. All rights reserved.</p>
            </div>
        </Container>
    </footer>
);

export default Footer;