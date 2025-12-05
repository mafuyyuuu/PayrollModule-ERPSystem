import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext.jsx';
import * as faceapi from "face-api.js";
import './ManualLogin.css';

function Login() {
    const videoRef = useRef();
    const navigate = useNavigate();
    const { setUser } = useUser();
    
    // Face recognition states
    const [faceStatus, setFaceStatus] = useState("Initializing camera...");
    const [faceLoading, setFaceLoading] = useState(false);
    
    // Manual login states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load face-api models and start webcam
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setFaceStatus("Position your face and click to login");
            } catch (err) {
                console.error(err);
                setFaceStatus("Camera unavailable");
            }
        };
        loadModels();

        // Cleanup camera on unmount
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const handleBack = () => {
        navigate('/');
    };

    // Face recognition login
    const handleFaceLogin = async () => {
        setFaceLoading(true);
        setFaceStatus("Detecting face...");

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (!detection) {
                setFaceStatus("No face detected. Try again.");
                setFaceLoading(false);
                return;
            }

            const { x, y, width, height } = detection.box;

            // Crop face into canvas
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);

            // Convert face image to Blob
            const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
            if (!blob) {
                setFaceStatus("Failed to capture. Try again.");
                setFaceLoading(false);
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append("file", blob, "face.jpg");
            formData.append("action", "time_in");

            // Send to backend
            const response = await fetch("http://127.0.0.1:8000/recognize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.matched) {
                const confidence = data.confidence || (data.similarity * 100).toFixed(2);
                setFaceStatus(`✅ Welcome ${data.name}!`);

                const userData = {
                    name: data.name,
                    role: data.role,
                    role_id: data.role_id,
                    employee_id: data.employee_id,
                };
                setUser(userData);

                setTimeout(() => {
                    switch (userData.role) {
                        case "admin":
                            navigate("/admin/dashboard");
                            break;
                        case "manager":
                            navigate("/manager/dashboard");
                            break;
                        case "payroll":
                            navigate("/payroll/dashboard");
                            break;
                        default:
                            navigate("/employee/dashboard");
                            break;
                    }
                }, 1500);
            } else {
                setFaceStatus("Face not recognized. Try again.");
            }
        } catch (err) {
            console.error("Error during face login:", err);
            setFaceStatus("Recognition error. Try again.");
        } finally {
            setFaceLoading(false);
        }
    };

    // Manual login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            setUser({
                id: data.id,
                employeeId: data.employeeId,
                name: data.name || data.username,
                username: data.username,
                email: data.email,
                role: data.role,
                status: data.status,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                position: data.position,
                department: data.department,
                employmentType: data.employmentType,
                dateHired: data.dateHired,
                birthday: data.birthday,
                sex: data.sex,
                nationality: data.nationality,
                maritalStatus: data.maritalStatus,
                address: data.address,
                contactNumber: data.contactNumber,
                emergencyContactName: data.emergencyContactName,
                emergencyContactNumber: data.emergencyContactNumber,
            });

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
            {/* Left side - Face Recognition */}
            <div className="left-container">
                <button className="back-icon" onClick={handleBack}>
                    <i className="bx bx-arrow-back"></i>
                </button>
                
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{ 
                        width: "280px", 
                        height: "210px", 
                        borderRadius: "15px", 
                        border: "2px solid rgba(255,255,255,0.3)",
                        objectFit: "cover"
                    }}
                />
                
                <p style={{ 
                    color: "#fff", 
                    fontSize: "0.85rem", 
                    textAlign: "center", 
                    marginTop: "10px",
                    fontFamily: "'TTHoves-Regular', sans-serif"
                }}>
                    {faceStatus}
                </p>
                
                <button 
                    className="login-btn" 
                    onClick={handleFaceLogin}
                    disabled={faceLoading}
                    style={{ width: "200px", marginTop: "10px" }}
                >
                    {faceLoading ? "Processing..." : "Login with Face"}
                </button>
            </div>

            {/* Right side - Manual Login */}
            <div className="right-container">
                <h2>Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

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
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            Show Password
                        </label>
                        <a href="#">Forgot Password?</a>
                    </div>
                    {error && <p style={{ color: 'red', alignSelf: 'center' }}>{error}</p>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;