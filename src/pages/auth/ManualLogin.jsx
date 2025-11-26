import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext.jsx';
import './ManualLogin.css';
import logo from '../../assets/lenscape.png';

function ManualLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleBack = () => {
        navigate('/');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the login API with username
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response. json();

            if (! response.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            // Set user data from database response
            setUser({
                id: data.id,
                employeeId: data. employeeId,
                name: data.name || data.username,
                username: data.username,
                email: data.email,
                role: data.role,
                status: data.status,
                // Employee details from database
                firstName: data.firstName,
                middleName: data. middleName,
                lastName: data. lastName,
                position: data.position,
                department: data.department,
                employmentType: data. employmentType,
                dateHired: data.dateHired,
                birthday: data.birthday,
                sex: data.sex,
                nationality: data.nationality,
                maritalStatus: data. maritalStatus,
                address: data.address,
                contactNumber: data.contactNumber,
                emergencyContactName: data.emergencyContactName,
                emergencyContactNumber: data.emergencyContactNumber,
            });

            // Navigate based on role
            switch (data.role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'manager':
                    navigate('/manager/dashboard');
                    break;
                case 'payroll':
                    navigate('/payroll/dashboard');
                    break;
                case 'employee':
                    navigate('/employee/dashboard');
                    break;
                default:
                    setError('Unknown role');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server');
        } finally {
            setLoading(false);
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

                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    {/* Username */}
                    <div className="input-field">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="input-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="show-forgot">
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(! showPassword)}
                            />
                            Show Password
                        </label>
                        <a href="#">Forgot Password? </a>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ManualLogin;