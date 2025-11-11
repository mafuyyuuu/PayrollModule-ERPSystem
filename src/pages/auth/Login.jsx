import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";
import * as faceapi from "face-api.js";
import logo from "../../assets/lenscape.png";
import "./Login.css";

function Login() {
    const videoRef = useRef();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [status, setStatus] = useState("Initializing camera...");
    const [loading, setLoading] = useState(false);

    // Load face-api models and start webcam
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                setStatus("Camera ready. Please position your face.");
            } catch (err) {
                console.error(err);
                setStatus("Camera access denied or unavailable.");
            }
        };
        loadModels();
    }, []);

    // Capture face and send for recognition
    const handleFaceLogin = async () => {
        setLoading(true);
        setStatus("Detecting face...");

        const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        );

        if (!detection) {
            setStatus("No face detected. Please try again.");
            setLoading(false);
            return;
        }

        const { x, y, width, height } = detection.box;

        // Crop face
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);

        const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
        const formData = new FormData();
        formData.append("file", blob, "face.jpg");
        formData.append("action", "time_in"); // optional for attendance

        try {
            const response = await fetch("http://127.0.0.1:8000/recognize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.matched) {
                setStatus(`Welcome ${data.name}! Logging you in...`);

                // simulate login by setting the user context
                const userData = {
                    name: data.name,
                    role: data.role || "employee",
                    employee_id: data.employee_id,
                };
                setUser(userData);

                // redirect based on role
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
                        case "employee":
                        default:
                            navigate("/employee/dashboard");
                            break;
                    }
                }, 1500);
            } else {
                setStatus("Face not recognized. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setStatus("Error during face recognition.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="left-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="right-container">
                <h2>Facial Recognition Login</h2>

                <video ref={videoRef} autoPlay muted width="400" height="300" style={{ borderRadius: "10px" }} />
                <p>{status}</p>

                <button
                    onClick={handleFaceLogin}
                    className="login-btn"
                    disabled={loading}
                    style={{ marginTop: "10px" }}
                >
                    {loading ? "Processing..." : "Login with Face"}
                </button>
            </div>
        </div>
    );
}

export default Login;
