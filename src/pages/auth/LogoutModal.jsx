import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";
import * as faceapi from "face-api.js";
import { Modal, Box, Typography, Button } from "@mui/material";

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
        <Modal open={show} onClose={onClose}>
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    p: 4,
                    borderRadius: 10,
                    width: 450,
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: "24px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#fff",
                        mb: 1
                    }}
                >
                    Facial Recognition Logout
                </Typography>

                <Box
                    component="video"
                    ref={videoRef}
                    autoPlay
                    muted
                    sx={{
                        width: 320,
                        height: 240,
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    }}
                />

                <Typography
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#fff",
                        mt: 2,
                        mb: 2
                    }}
                >
                    {status}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignContent:"center" }}>
                    <Box
                        variant="outlined"
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        sx={{
                            fontSize: "14px",
                            backgroundColor: "#bdbdbd",
                            color: "#333",
                            padding: "10px 24px",
                            borderRadius: "15px",
                            cursor: "pointer",
                            border: "none",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            "&:hover": { backgroundColor: "#a0a0a0" }
                        }}
                    >
                        Cancel
                    </Box>
                    <Box
                        variant="contained"
                        onClick={handleFaceLogout}
                        disabled={loading}
                        sx={{
                            fontSize: "14px",
                            backgroundColor: "#172224",
                            color: "#fff",
                            padding: "10px 24px",
                            borderRadius: "15px",
                            cursor: "pointer",
                            border: "none",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            "&:hover": { backgroundColor: "#1f2f31" }
                        }}
                    >
                        {loading ? "Processing..." : "Logout with Face"}
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

export default LogoutModal;
