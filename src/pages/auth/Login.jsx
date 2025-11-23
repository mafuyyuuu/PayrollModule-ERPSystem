import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";
import * as faceapi from "face-api.js";
import ActionButton from "../../components/ActionButton.jsx";

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

            // // Optional: preview cropped face
            // const previewImg = document.getElementById("face-preview");
            // if (previewImg) {
            //     previewImg.src = canvas.toDataURL("image/jpeg");
            // }

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
                    role: data.role,  // Use 'role' (string) for navigation
                    role_id: data.role_id,  // Keep role_id for reference
                    employee_id: data.employee_id,
                };
                setUser(userData);

                // Redirect after 1.5s delay
                setTimeout(() => {
                    switch (userData.role) {  // Use 'role' not 'role_id'
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
        <Box
            sx={{
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "4rem",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                p: 4,
                width: { xs: "90%", sm: "600px", md: "800px" },
                height: { xs: "auto", sm: "70%", md: "600px" },
                maxHeight: "90vh",
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "30px", color: "#FFFFFF", mb: 2,
                    }}
                >
                    Facial Recognition Login
                </Typography>

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

                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "18px", color: "#FFFFFF", mb: 2,
                    }}
                >
                    {status}
                </Typography>

                <ActionButton
                    text={loading ? "Processing..." : "Login with Face"}
                    width="200px"
                    onClick={handleFaceLogin}
                    disabled={loading}
                />
            </Box>
        </Box>
    );
}

export default Login;