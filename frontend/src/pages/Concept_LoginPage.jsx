import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Concept_LoginPage.css';
import { FaMicrophone, FaStar, FaHamburger } from 'react-icons/fa';
import authService from '../services/authService';  // ← 기존 서비스 사용!

const ConceptCard = ({ title, subTitle, icon: Icon, colorClass, destination }) => (
    <Link to={destination} className={`concept-card-link ${colorClass}`}>
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
            // 기존 authService 사용 ✅
            await authService.login(formData.username, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            {/* 왼쪽 영역 */}
            <div className="main-content-area">
                <header className="page-header">
                    <h1 className="header-title">K-Guidance</h1>
                </header>
                <section className="welcome-section">
                    <h2 className="welcome-title">Welcome! We are K-Guidance,</h2>
                    <p className="welcome-text">
                        We serve as your personalized travel planner for foreign visitors...
                    </p>
                    {/* 나머지 텍스트 */}
                </section>

                <section className="concept-selection">
                    <h3 className="concept-prompt">Please decide the concept ✔</h3>
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

            {/* 오른쪽 로그인 영역 */}
            <div className="login-form-sidebar">
                <div className="login-box">
                    <h2 className="login-title">✈ Sign In</h2>
                    <p className="login-subtitle">Join your K-Experience journey</p>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError('')}>×</button>
                        </div>
                    )}
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <label htmlFor="username">User ID</label>
                        <input 
                            type="text" 
                            id="username"
                            name="username"
                            placeholder="your username" 
                            value={formData.username}
                            onChange={handleChange}
                            className="text-input"
                            required
                        />
                        
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                placeholder="••••••••••" 
                                value={formData.password}
                                onChange={handleChange}
                                className="text-input"
                                required
                            />
                            <span className="password-toggle">👁️</span>
                        </div>

                        <div className="remember-forgot">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot?</a>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="sign-in-button"
                            disabled={loading}
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
        </div>
    );
};

export default ConceptLoginPage;