from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from deepface import DeepFace
from PIL import Image
import mysql.connector
from mysql.connector import Error
import numpy as np
import pickle
import shutil, os, json, datetime

# MySQL configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "payrollsystem",
    "password": "payroll",
    "database": "testdb"
}

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

def log_attendance_to_db(employee_id, name, action, timestamp):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        date_str = timestamp.split(" ")[0]
        time_str = timestamp.split(" ")[1]

        # Check if there's already a record for this employee today
        cursor.execute("""
                       SELECT timesheet_id, time_in, time_out
                       FROM timesheets
                       WHERE employee_id = %s AND date = %s
                       """, (employee_id, date_str))
        record = cursor.fetchone()

        if action == "check_in":
            if record:
                print(f"ℹ️ {name} already checked in today (ID: {employee_id})")
            else:
                cursor.execute("""
                               INSERT INTO timesheets (employee_id, date, time_in)
                               VALUES (%s, %s, %s)
                               """, (employee_id, date_str, time_str))
                print(f"✅ {name} checked in at {time_str}")

        elif action == "check_out":
            if record and record[2] is None:  # only update if no time_out
                time_in = record[1]
                if time_in:
                    # Calculate overtime hours
                    cursor.execute("SELECT TIMESTAMPDIFF(MINUTE, %s, %s)", (time_in, time_str))
                    total_minutes = cursor.fetchone()[0]
                    total_hours = total_minutes / 60.0
                    overtime = max(0, total_hours - 8)  # Overtime after 8 hours

                    cursor.execute("""
                                   UPDATE timesheets
                                   SET time_out = %s, overtime_hours = %s
                                   WHERE timesheet_id = %s
                                   """, (time_str, round(overtime, 2), record[0]))
                    print(f"✅ {name} checked out at {time_str} (Overtime: {round(overtime, 2)}h)")
                else:
                    print(f"⚠️ Missing time_in for {employee_id}")
            else:
                print(f"ℹ️ {name} already checked out today (ID: {employee_id})")

        connection.commit()
        cursor.close()
        connection.close()

    except Error as e:
        print(f"⚠️ Database error: {e}")


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
        files: list[UploadFile] = File(...),
        employee_id: int = Form(...),
        name: str = Form(...)
):
    try:
        os.makedirs(f"faces_db/{employee_id}", exist_ok=True)
        embeddings_db[employee_id] = []

        all_embeddings = []

        for idx, file in enumerate(files):
            save_path = f"faces_db/{employee_id}/{employee_id}_{idx}.jpg"
            with open(save_path, "wb") as f:
                shutil.copyfileobj(file.file, f)

            # Extract embedding
            result = DeepFace.represent(
                img_path=save_path,
                model_name="Facenet512",
                detector_backend="mtcnn",
                enforce_detection=True
            )[0]["embedding"]

            emb = np.array(result, dtype=np.float32)
            emb /= np.linalg.norm(emb)  # normalize
            all_embeddings.append(emb)

        # Average embeddings for stability
        mean_embedding = np.mean(all_embeddings, axis=0)
        embeddings_db[employee_id] = mean_embedding.tolist()

        with open(embeddings_file, "wb") as f:
            pickle.dump(embeddings_db, f)

        employees[employee_id] = name
        save_employees()

        return {"success": True, "message": f"Registered {name} with {len(files)} samples."}

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

        # Resize to speed up processing (safe)
        try:
            img = Image.open(path)
            img = img.resize((224, 224))
            img.save(path)
        except Exception as resize_error:
            print("Warning: Could not resize image:", resize_error)

        # 1) Get uploaded face embedding
        try:
            result = DeepFace.represent(
                img_path=path,
                model_name="Facenet512",
                detector_backend="retinaface",
                enforce_detection=True
            )
            if not result or not isinstance(result, list):
                return {"matched": False, "error": "Failed to compute embedding."}
            result = result[0].get("embedding")
            if result is None:
                return {"matched": False, "error": "No embedding returned."}
        except Exception as e:
            # more explicit error for face detection / model issues
            print("❌ DeepFace error:", e)
            return {"matched": False, "error": f"Face detection/embedding error: {str(e)}"}

        uploaded_embedding = np.array(result, dtype=np.float32)
        norm = np.linalg.norm(uploaded_embedding)
        if norm == 0 or np.isnan(norm) or np.isinf(norm):
            return {"matched": False, "error": "Invalid face embedding detected."}
        uploaded_embedding /= norm

        # 2) Find best match (cosine similarity)
        best_match_id = None
        best_score = -1.0

        for emp_id, emb in embeddings_db.items():
            try:
                emb_array = np.array(emb, dtype=np.float32)
            except Exception:
                continue
            emb_norm = np.linalg.norm(emb_array)
            if emb_norm == 0 or np.isnan(emb_norm) or np.isinf(emb_norm):
                continue
            emb_array /= emb_norm
            sim = float(np.dot(emb_array, uploaded_embedding))  # ensure native float
            if sim > best_score:
                best_score = sim
                best_match_id = emp_id

        THRESHOLD = 0.75  # tighten/loosen after testing

        # If no good match found -> return not matched
        if not best_match_id or best_score < THRESHOLD:
            return {
                "matched": False,
                "message": "Face not recognized or confidence too low.",
                "similarity": float(best_score) if best_score != -1.0 else None,
                "confidence": float(round(best_score * 100, 2)) if best_score != -1.0 else None
            }

        # 3) We have a match: determine action based on DB (preferred source of truth)
        employee_id = best_match_id  # note: in your registration code keys are ints
        name = employees.get(employee_id, "Unknown")

        now = datetime.datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
        log_file = f"attendance_logs/{employee_id}.json"

        # Determine next action by checking DB record for today
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            cursor = connection.cursor()
            cursor.execute("""
                           SELECT timesheet_id, time_in, time_out
                           FROM timesheets
                           WHERE employee_id = %s AND date = %s
                           """, (int(employee_id), date_str))
            record = cursor.fetchone()
            cursor.close()
            connection.close()
        except Exception as db_check_error:
            print("⚠️ Could not check database for previous record:", db_check_error)
            record = None

        if record:
            # record = (timesheet_id, time_in, time_out)
            time_in_val = record[1]
            time_out_val = record[2]
            if time_in_val and not time_out_val:
                next_action = "check_out"
            elif time_in_val and time_out_val:
                # If both exist, allow a new check_in for new period
                next_action = "check_in"
            else:
                next_action = "check_in"
        else:
            next_action = "check_in"

        # 4) Update JSON logs (for frontend / fallback)
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                logs = json.load(f)
            # convert old list format to dict keyed by date (backwards compat)
            if isinstance(logs, list):
                logs = {date_str: logs}
        else:
            logs = {}

        if date_str not in logs:
            logs[date_str] = []

        log_entry = {"action": next_action, "timestamp": timestamp}
        logs[date_str].append(log_entry)

        with open(log_file, "w") as f:
            json.dump(logs, f, indent=2)

        # 5) Sync to DB (this will insert or update timesheets)
        try:
            # call your existing helper which handles insert/update/overtime
            log_attendance_to_db(int(employee_id), name, next_action, timestamp)
        except Exception as db_log_error:
            # do not fail the entire recognition if DB logging fails; log the error
            print("⚠️ Error writing attendance to DB:", db_log_error)

        # 6) Return success to frontend
        return {
            "matched": True,
            "employee_id": employee_id,
            "name": name,
            "action": next_action,
            "timestamp": timestamp,
            "similarity": float(best_score),
            "confidence": float(round(best_score * 100, 2))
        }

    except Exception as e:
        # final catch-all: print to backend and return helpful message to frontend
        print("❌ Unexpected error in /recognize:", e)
        return {"matched": False, "error": f"Unexpected server error: {str(e)}"}

# GET /attendance/{employee_id} - Fetch logs
@app.get("/attendance/{employee_id}")
def get_attendance(employee_id: str):
    log_file = f"attendance_logs/{employee_id}.json"
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            logs = json.load(f)
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        return logs.get(today, [])
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
