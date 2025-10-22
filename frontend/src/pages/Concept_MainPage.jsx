import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Concept_LoginPage.css';
import { FaMicrophone, FaStar, FaHamburger } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const ConceptCard = ({ title, subTitle, icon: Icon, colorClass, destination }) => (
    <Link 
        to={destination}
        className={`concept-card-link ${colorClass}`}
    >
        <div className={`concept-card-content`}> 
            <h3 className="card-title">{title}</h3>
            <p className="card-subtitle">{subTitle}</p>
            <div className="card-icon-wrapper">
                <Icon className="card-icon" />
                <span className="arrow">→</span>
            </div>
        </div>
    </Link>
);

const ConceptLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setIsLoggedIn(true);
                setCurrentUser(userData);
            }
        } catch (err) {
            setIsLoggedIn(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const userData = await response.json();
            
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            setIsLoggedIn(true);
            setCurrentUser(userData);
            setFormData({ username: '', password: '' });
        } catch (err) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setCurrentUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <>
            {/* Sidebar를 페이지 밖으로 */}
            {isLoggedIn && <Sidebar />}
            
            <div className="login-page-container" style={{
                marginLeft: '0',  // 로그인 시 Sidebar 공간 확보
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Header/Sidebar (왼쪽 영역) */}
                <div className="main-content-area">
                    <header className="page-header">
                        <h1 className="header-title">K-Guidance</h1>
                        
                        {/* 로그인 후 사용자 정보 */}
                        {isLoggedIn && currentUser && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '10px 20px',
                                borderRadius: '25px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                zIndex: 100
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    👤 {currentUser.username || currentUser.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: '#ff4757',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#ff3838'}
                                    onMouseLeave={(e) => e.target.style.background = '#ff4757'}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </header>

                    <section className="welcome-section">
                        <h2 className="welcome-title">Welcome! We are K-Guidance,</h2>
        
                        <p className="welcome-text">
                            We serve as your personalized travel planner for foreign visitors, ensuring you never lose your way amidst Korea's diverse charms.
                            Don't get lost in a sea of complex information.
                        </p>

                        <p className="welcome-text">
                            Based on the single concept you choose, we instantly recommend the trendiest and most meaningful destinations.
                        </p>

                        <p className="welcome-text">
                            Using the recommended itinerary as a foundation, freely adjust the travel route and timing to perfectly match your preferences, creating a one-of-a-kind, perfect Korean travel plan.
                        </p>

                        <p className="welcome-text">
                            Decide on your concept right now and start your most enjoyable trip to Korea!
                        </p>
                    </section>

                    <section className="concept-selection">
                        <h3 className="concept-prompt"> Please decide the concept ✔</h3>
                        <div className="concept-cards-grid">
                            <ConceptCard 
                                title="K-POP DEMON HUNTERS" 
                                subTitle="Dive into the world of K-Pop and fantasy."
                                icon={FaMicrophone} 
                                colorClass="card-kpop-demon"
                                destination="/chatbot/demon-hunters"
                            />
                            <ConceptCard 
                                title="K-POP STAR" 
                                subTitle="Experience the glamorous life of a K-Pop idol."
                                icon={FaStar} 
                                colorClass="card-kpop-star"
                                destination="/chatbot/kpop-star"
                            />
                            <ConceptCard 
                                title="K-FOOD" 
                                subTitle="Explore Korea through its delicious culinary journey."
                                icon={FaHamburger} 
                                colorClass="card-kfood"
                                destination="/chatbot/k-food"
                            />
                        </div>
                    </section>
                </div>

                {/* Login Form (오른쪽 영역) - 로그인 전에만 표시 */}
                {!isLoggedIn && (
                    <div className="login-form-sidebar">
                        <div className="login-box">
                            <h2 className="login-title">✈ Sign In</h2>
                            <p className="login-subtitle">Join your K-Experience journey</p>
                            
                            {error && (
                                <div style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #fecaca',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{error}</span>
                                    <button 
                                        onClick={() => setError('')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '20px',
                                            cursor: 'pointer',
                                            color: '#991b1b',
                                            padding: '0 4px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            
                            <form className="login-form" onSubmit={handleSubmit}>
                                <label htmlFor="username">User ID</label>
                                <input 
                                    type="text" 
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="text-input"
                                    required
                                    autoComplete="username"
                                />
                                
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••••" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="text-input"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <span 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </span>
                                </div>

                                <div className="remember-forgot">
                                    <label className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        Remember me
                                    </label>
                                    <Link to="/forgot-password" className="forgot-password">Forgot?</Link>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="sign-in-button"
                                    disabled={loading}
                                    style={{
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="social-login-divider"></div>
                            
                            <div className="sign-up-prompt">
                                Don't have an account? <Link to="/signup" className="sign-up-link">Sign up</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ConceptLoginPage;