from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from deepface import DeepFace
import math
import numpy as np
import pickle
import shutil, os, json, datetime

app = FastAPI()

# CORS setup
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("faces_db", exist_ok=True)
os.makedirs("attendance_logs", exist_ok=True)

app.mount("/faces_db", StaticFiles(directory="faces_db"), name="faces_db")

# === Persistent Data Files ===
embeddings_file = "embeddings_db.pkl"
employees_file = "employees.json"

# Load embeddings
if os.path.exists(embeddings_file):
    with open(embeddings_file, "rb") as f:
        embeddings_db = pickle.load(f)
else:
    embeddings_db = {}

# Load employees
if os.path.exists(employees_file):
    with open(employees_file, "r") as f:
        employees = json.load(f)
else:
    employees = {}

# Helpers
def save_embeddings():
    with open(embeddings_file, "wb") as f:
        pickle.dump(embeddings_db, f)

def save_employees():
    with open(employees_file, "w") as f:
        json.dump(employees, f, indent=2)

# POST /register - Register new employee or add samples
@app.post("/register")
async def register_face(
        file: UploadFile = File(...),
        employee_id: str = Form(...),
        name: str = Form(...)
):
    try:
        # Each employee has their own folder
        emp_dir = f"faces_db/{employee_id}"
        os.makedirs(emp_dir, exist_ok=True)

        # Save uploaded image with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        save_path = f"{emp_dir}/{timestamp}.jpg"
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Generate embedding
        embedding = DeepFace.represent(
            img_path=save_path,
            model_name="VGG-Face",
            enforce_detection=False
        )[0]["embedding"]

        # Store embedding in the database
        if employee_id not in embeddings_db:
            embeddings_db[employee_id] = []
        embeddings_db[employee_id].append(embedding)
        save_embeddings()

        # Update employee list
        employees[employee_id] = name
        save_employees()

        return {
            "success": True,
            "message": f"Added new face sample for {name}. Total samples: {len(embeddings_db[employee_id])}"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# POST /recognize - Face recognition
@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...), action: str = Form(...)):
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        if not embeddings_db:
            return {"matched": False, "error": "No employees registered yet."}

        uploaded_embedding = DeepFace.represent(
            img_path=path,
            model_name="VGG-Face",
            enforce_detection=False
        )[0]["embedding"]
        uploaded_embedding = np.array(uploaded_embedding)

        if np.any(np.isnan(uploaded_embedding)) or np.any(np.isinf(uploaded_embedding)):
            return {"matched": False, "error": "Invalid face embedding."}

        best_match_id = None
        min_dist = float("inf")

        for emp_id, embeddings in embeddings_db.items():
            for emb in embeddings:
                emb_array = np.array(emb)
                if np.any(np.isnan(emb_array)) or np.any(np.isinf(emb_array)):
                    continue
                dist = np.linalg.norm(emb_array - uploaded_embedding)
                if dist < min_dist:
                    min_dist = dist
                    best_match_id = emp_id

        if best_match_id and math.isfinite(min_dist) and min_dist < 0.6:
            employee_id = best_match_id
            name = employees.get(employee_id, "Unknown")

            log_file = f"attendance_logs/{employee_id}.json"
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_entry = {"action": action, "timestamp": now}

            if os.path.exists(log_file):
                with open(log_file, "r") as f:
                    logs = json.load(f)
            else:
                logs = []

            logs.append(log_entry)
            with open(log_file, "w") as f:
                json.dump(logs, f, indent=2)

            return {
                "matched": True,
                "employee_id": employee_id,
                "name": name,
                "similarity": float(min_dist),
                "samples": len(embeddings_db[employee_id]),
                "attendance": log_entry
            }

        else:
            return {
                "matched": False,
                "similarity": float(min_dist) if math.isfinite(min_dist) else None
            }

    except Exception as e:
        return {"matched": False, "error": str(e)}


# GET /attendance/{employee_id} - Fetch logs
@app.get("/attendance/{employee_id}")
def get_attendance(employee_id: str):
    log_file = f"attendance_logs/{employee_id}.json"
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            logs = json.load(f)
        return logs
    return []


# GET /employees - List all employees and sample counts
@app.get("/employees")
def list_employees():
    return {
        "total": len(embeddings_db),
        "employees": [
            {
                "employee_id": emp_id,
                "name": employees.get(emp_id, "Unknown"),
                "samples": len(embeddings_db[emp_id])
            }
            for emp_id in embeddings_db
        ]
    }
