import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceCapture() {
    const videoRef = useRef();
    const [employeeId, setEmployeeId] = useState("");
    const [name, setName] = useState("");
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const start = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        };
        start();
    }, []);

    const captureFaceBlob = async () => {
        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        );
        if (!detections) {
            alert("No face detected");
            return null;
        }
        const { x, y, width, height } = detections.box;
        const face = document.createElement("canvas");
        face.width = width;
        face.height = height;
        face.getContext("2d").drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);
        return new Promise((res) => face.toBlob(res, "image/jpeg"));
    };

    const registerFace = async () => {
        if (!employeeId || !name) return alert("Please enter both Employee ID and Name");
        const blob = await captureFaceBlob();
        if (!blob) return;

        const formData = new FormData();
        formData.append("file", blob, `${employeeId}.jpg`);
        formData.append("employee_id", employeeId);
        formData.append("name", name);

        try {
            const response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            alert(data.message || "Registered successfully");
        } catch (err) {
            console.error(err);
            alert("Error registering employee");
        }
    };

    return (
        <div>
            <h2>Register New Employee Face</h2>
            <video ref={videoRef} autoPlay muted width="400" height="300" />

            <div style={{ marginTop: "10px" }}>
                <input
                    type="text"
                    placeholder="Employee ID (e.g. bill_gates)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginLeft: "10px" }}
                />
            </div>

            <button onClick={registerFace} style={{ marginTop: "10px" }}>
                Register Face
            </button>
        </div>
    );
}
