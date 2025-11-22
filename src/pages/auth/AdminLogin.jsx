import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext.jsx';
import './AdminLogin.css';
import logo from '../../assets/lenscape.png';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { user } = useUser();

    const handleBack = () => {
        navigate('/');
    };

    const handleLogin = (e) => {
        e.preventDefault(); // prevent page reload

        if (!user) return;

        // redirect based on role
        switch (user.role) {
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
                        <label htmlFor="username">Username</label>
                        <input
                            type="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <i className='bx bx-envelope'></i>
                    </div>
                    <div className="input-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i className='bx bx-lock'></i>
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
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;