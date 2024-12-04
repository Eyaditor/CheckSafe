import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/style/Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); // Clear previous errors
        if (isReset) {
            try {
                await resetPassword(email);
                alert('Password reset email sent. Please check your inbox.');
                setIsReset(false);
                clearForm();
            } catch (error) {
                setError('Failed to reset password. Please check the email address.');
            }
        } else {
            try {
                if (isLogin) {
                    await login(email, password);
                } else {
                    await signup(email, password, name);
                }
                clearForm();
                navigate('/dashboard');
            } catch (error) {
                setError(`Failed to ${isLogin ? 'login' : 'register'}. ${error.message}`);
            }
        }
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1>CheckSafe</h1>
                {error && <div className="error-message">{error}</div>}

                <div className="input-container">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {!isReset && (
                    <>
                        {!isLogin && (
                            <div className="input-container">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="input-container">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="submit-button">
                    {isReset ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
                </button>

                {!isReset && (
                    <p className="reset-password">
                        Forgot your password?{' '}
                        <span onClick={() => setIsReset(true)} className="link-text">
                            Reset here
                        </span>
                    </p>
                )}

                {!isReset && (
                    <div className="switch-auth">
                        {isLogin ? (
                            <p>
                                Don't have an account?{' '}
                                <span onClick={() => setIsLogin(false)} className="link-text">
                                    Register here
                                </span>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <span onClick={() => setIsLogin(true)} className="link-text">
                                    Login here
                                </span>
                            </p>
                        )}
                    </div>
                )}

                {isReset && (
                    <p className="reset-link">
                        Remembered your password?{' '}
                        <span onClick={() => setIsReset(false)} className="link-text">
                            Go back to login
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
}
