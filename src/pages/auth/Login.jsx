import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";
import * as faceapi from "face-api.js";
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

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (!detection) {
                setStatus("No face detected. Please position yourself in front of the camera.");
                setLoading(false);
                return;
            }

            const { x, y, width, height } = detection.box;

            // Crop face into canvas
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);

            // Optional: preview cropped face
            const previewImg = document.getElementById("face-preview");
            if (previewImg) {
                previewImg.src = canvas.toDataURL("image/jpeg");
            }

            // Convert face image to Blob
            const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
            if (!blob) {
                setStatus("Failed to capture face. Please try again.");
                setLoading(false);
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
            console.log("Backend response:", data);

            // Handle backend results
            if (data.matched) {
                const confidence = data.confidence || (data.similarity * 100).toFixed(2);
                setStatus(`✅ Welcome ${data.name}! (Confidence: ${confidence}%)`);

                const userData = {
                    name: data.name,
                    role: data.role || "employee",
                    employee_id: data.employee_id,
                };
                setUser(userData);

                // Redirect after 1.5s delay
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
                // Handle failed match or low confidence
                const confidence = data.confidence ? `${data.confidence}%` : "N/A";
                const msg =
                    data.message ||
                    (data.error
                        ? `Error: ${data.error}`
                        : "Face not recognized. Please try again.");

                setStatus(`${msg} (Confidence: ${confidence})`);
            }
        } catch (err) {
            console.error("Error during face login:", err);
            setStatus("Error during face recognition. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="right-container">
                <h2>Facial Recognition Login</h2>

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    width="400"
                    height="300"
                    style={{ borderRadius: "10px", border: "2px solid #ccc" }}
                />
                <img
                    id="face-preview"
                    alt="Face preview"
                    style={{ marginTop: "10px", width: "120px", borderRadius: "10px" }}
                />
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
