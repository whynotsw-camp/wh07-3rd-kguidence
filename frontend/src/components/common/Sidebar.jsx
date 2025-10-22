import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sidebar.css';

const MENU_ITEMS = [
    { name: '메인 페이지', path: '/' },
    { name: '축제/공연 목록', path: '/festival' },
    { name: '여행 플래너', path: '/dashboard' },
];

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                {isOpen ? '✕' : '☰'} 
            </button>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <ul>
                        {MENU_ITEMS.map((item) => (
                            <li key={item.name}>
                                <Link 
                                    to={item.path} 
                                    onClick={toggleSidebar}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Sidebar;