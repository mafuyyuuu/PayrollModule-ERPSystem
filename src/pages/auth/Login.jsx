import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext.jsx';
import './Login.css';
import logo from '../../assets/lenscape.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleBack = () => {
        navigate('/');
    };

    const handleLogin = (e) => {
        e.preventDefault();

        // ===== HARDCODED LOGIN =====
        // You can change email/password checks and roles as needed
        let hardcodedUser = null;

        if (email === 'admin@example.com' && password === 'admin123') {
            hardcodedUser = { id: 1, username: 'Admin', role: 'admin', name: 'Admin User' };
        } else if (email === 'manager@example.com' && password === 'manager123') {
            hardcodedUser = { id: 2, username: 'Manager', role: 'manager', name: 'Manager User' };
        } else if (email === 'payroll@example.com' && password === 'payroll123') {
            hardcodedUser = { id: 3, username: 'Payroll', role: 'payroll', name: 'Payroll User' };
        } else if (email === 'employee@example.com' && password === 'employee123') {
            hardcodedUser = { id: 4, username: 'Employee', role: 'employee', name: 'Employee User' };
        }

        if (!hardcodedUser) {
            setError('Invalid email or password');
            return;
        }

        // Set user in context
        setUser(hardcodedUser);

        // Navigate based on role
        switch (hardcodedUser.role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'manager':
                navigate('/manager');
                break;
            case 'payroll':
                navigate('/payroll');
                break;
            case 'employee':
                navigate('/employee');
                break;
            default:
                alert('Unknown role');
        }
    };

    return (
        <div className="login-container">
            <div className="left-container">
                <button className="back-icon" onClick={handleBack}>
                    <i className="bx bx-arrow-back"></i>
                </button>
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="right-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <i className="bx bx-envelope"></i>
                    </div>

                    <div className="input-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i className="bx bx-lock"></i>
                    </div>

                    <div className="show-forgot">
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            Show Password
                        </label>
                        <a href="#">Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-btn">Login</button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default Login;
