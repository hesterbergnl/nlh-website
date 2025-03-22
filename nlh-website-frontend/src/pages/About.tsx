import '../assets/styles/About.css';
import React from "react";
import headShot from "../assets/images/headshot.jpeg";


const About: React.FC = () => (
    <>
        <img src={headShot} alt="Headshot"/>
        <p> This is the about page </p>
    </>
);

export default About;