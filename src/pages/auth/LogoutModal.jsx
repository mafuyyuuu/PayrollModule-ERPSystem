// javascript
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";
import * as faceapi from "face-api.js";
import "./Logout.css";

function LogoutModal({ show, onClose }) {
    const THRESHOLD = 75.0; // percent - adjust as needed

    const videoRef = useRef();
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [status, setStatus] = useState("Initializing camera...");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show) return;

        let isMounted = true;

        const loadModels = async () => {
            try {
                setStatus("Loading face detection models...");

                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);

                if (!isMounted) return;
                setStatus("Starting camera...");

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });

                if (videoRef.current && isMounted) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setStatus("Camera ready. Please verify your identity to log out.");
                    };
                }
            } catch (err) {
                console.error("Setup error:", err);
                if (isMounted) {
                    setStatus(`Error: ${err.message}`);
                }
            }
        };

        loadModels();

        return () => {
            isMounted = false;
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [show]);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const parseConfidence = (data) => {
        if (data == null) return null;
        if (data.confidence != null && !Number.isNaN(parseFloat(data.confidence))) {
            return parseFloat(data.confidence);
        }
        if (data.similarity != null && !Number.isNaN(parseFloat(data.similarity))) {
            return parseFloat(data.similarity) * 100;
        }
        return null;
    };

    const handleFaceLogout = async () => {
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

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);

            const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
            if (!blob) {
                setStatus("Failed to capture face. Please try again.");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("file", blob, "face.jpg");
            formData.append("action", "time_out");
            formData.append("employee_id", user.employee_id);

            const response = await fetch("http://127.0.0.1:8000/recognize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Backend response:", data);

            const matched = !!data.matched;
            const attendanceRecorded = !!data.attendance_recorded;
            const message = (data.message || "").toString().toLowerCase();
            const name = data.name || null;
            const confidenceValue = parseConfidence(data); // percent or null

            // Determine if identity is verified:
            // - backend explicit `matched`
            // - OR name exists and confidence >= THRESHOLD
            // - OR backend message indicates "already checked in"
            const confidenceOk = confidenceValue != null && confidenceValue >= THRESHOLD;
            const messageAllows = message.includes("already checked in");
            const identityVerified = matched || (name && confidenceOk) || (name && messageAllows);

            if (identityVerified) {
                const confDisplay = confidenceValue != null ? `${confidenceValue.toFixed(2)}%` : "N/A";
                const timeOutText = attendanceRecorded ? `Time out recorded at ${data.time_out || "unknown"}.` : "Identity verified (no new time out recorded).";
                setStatus(`✅ Goodbye ${name || "User"}! ${timeOutText} (Confidence: ${confDisplay})`);

                stopCamera();

                // Small delay so user sees confirmation, then clear session and navigate
                setTimeout(async () => {
                    try {
                        // try session logout on backend; ignore if it fails
                        await fetch("/api/logout", { method: "POST", credentials: "include" });
                    } catch (err) {
                        console.error("Session logout failed:", err);
                    }

                    setUser(null);
                    localStorage.removeItem("user");
                    onClose();
                    navigate("/", { replace: true });
                }, 900);

            } else {
                const confDisplay = confidenceValue != null ? `${confidenceValue.toFixed(2)}%` : "N/A";
                const msg = data.message || "Face verification failed. Please try again.";
                setStatus(`❌ ${msg} (Confidence: ${confDisplay})`);
            }
        } catch (err) {
            console.error("Error during face logout:", err);
            setStatus("Error during face verification. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="logout-modal-overlay" onClick={onClose}>
            <div className="logout-container" onClick={(e) => e.stopPropagation()}>
                <div className="right-container">
                    <h2>Facial Recognition Logout</h2>

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
                        onClick={handleFaceLogout}
                        className="login-btn"
                        disabled={loading}
                        style={{ marginTop: "10px" }}
                    >
                        {loading ? "Processing..." : "Logout with Face"}
                    </button>

                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="login-btn"
                        style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;
