from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from deepface import DeepFace
import shutil, os, json, datetime

app = FastAPI()

# Enable CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("faces_db", exist_ok=True)
os.makedirs("attendance_logs", exist_ok=True)

# Serve employee images to frontend
app.mount("/faces_db", StaticFiles(directory="faces_db"), name="faces_db")

# Employee mapping: employee_id -> name (can be replaced by a DB)
employees = {
    "john_doe": "John Doe",
    "jane_smith": "Jane Smith",
    "bill_gates": "Bill Gates",
}

# POST /recognize endpoint with action logging
@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...), action: str = Form(...)):
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = DeepFace.find(img_path=path, db_path="faces_db", enforce_detection=False)

        # DeepFace.find() can return a list of DataFrames — we’ll pick the first one
        if isinstance(result, list):
            result = result[0]

        records = result.to_dict(orient="records")


        if not records:
            return {"matched": False}

        # Pick the best match
        best_match = records[0]
        emp_filename = os.path.basename(best_match["identity"])
        employee_id = os.path.splitext(emp_filename)[0]

        # Log attendance
        timestamp = datetime.datetime.now().isoformat()
        log_entry = {
            "employee_id": employee_id,
            "name": employees.get(employee_id, "Unknown"),
            "timestamp": timestamp,
            "action": action
        }
        log_file = f"attendance_logs/{employee_id}.json"
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                logs = json.load(f)
        else:
            logs = []
        logs.append(log_entry)
        with open(log_file, "w") as f:
            json.dump(logs, f, indent=2)

        if best_match.get("VGG-Face_cosine", best_match.get("cosine", best_match.get("distance"))) > 0.6:
            return {"matched": False, "message": "Face not similar enough"}

        return {
            "matched": True,
            "employee_id": employee_id,
            "name": employees.get(employee_id, "Unknown"),
            "similarity": best_match.get("VGG-Face_cosine") or best_match.get("cosine") or best_match.get("distance")
        }

    except Exception as e:
        return {"matched": False, "error": str(e)}

@app.post("/register")
async def register_face(
    file: UploadFile = File(...),
    employee_id: str = Form(...),
    name: str = Form(...)
):
    try:
        # Save the uploaded face image to faces_db
        save_path = f"faces_db/{employee_id}.jpg"
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Optionally update your employees dictionary
        employees[employee_id] = name

        return {"success": True, "message": f"Employee {name} registered successfully!"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Optional: GET endpoint to fetch attendance history for an employee
@app.get("/attendance/{employee_id}")
def get_attendance(employee_id: str):
    log_file = f"attendance_logs/{employee_id}.json"
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            logs = json.load(f)
        return logs
    return []
