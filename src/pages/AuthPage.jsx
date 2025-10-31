import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../css/AuthPage.css';

const AuthPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, signup } = useAuth();

    const toggleMode = () => {
        setIsLoginMode(prevMode => !prevMode);
        setEmail('');
        setPassword('');
        setUsername('');
        setFirstName('');
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                const userData = { username, firstName, email, password };
                await signup(userData);
                setSuccessMessage('Signup successful! Please log in.'); // Use the success state
                setIsLoginMode(true);
            }
        } catch (err) {
            setError(err.message || (isLoginMode ? 'Login failed.' : 'Signup failed.'));
            console.error(err);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-form-card">

                <div className="auth-header">
                    <img src="/movie_logo.jpg" alt="Movie App Logo" className="auth-logo" />
                    <h1 className="auth-title">Movie App</h1>
                </div>

                <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>

                    {!isLoginMode && (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="auth-error-message">{error}</p>}
                    {successMessage && <p className="auth-success-message">{successMessage}</p>}

                    <button type="submit" className="auth-submit-btn">
                        {isLoginMode ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <button
                    onClick={toggleMode}
                    className="auth-toggle-btn"
                >
                    {isLoginMode
                        ? 'Need an account? Sign Up'
                        : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;