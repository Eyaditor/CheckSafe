import React from 'react';
import { Link } from 'react-router-dom';
import '../components/style/Header.css';

const Header = () => {
    return (
        <nav>
            <h1>CheckSafe</h1>
            <ul>
                <li><Link to="/">URL Scanner</Link></li>
                <li><Link to="/chat">Chat</Link></li>
                <li><Link to="/email-check">Email Check</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
        </nav>);
}
export default Header;