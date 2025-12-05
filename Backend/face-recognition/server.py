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
    "database": "payrollmanagementsystem"
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

# Load employees with role information
if os.path.exists(employees_file):
    with open(employees_file, "r") as f:
        raw = json.load(f)
    # Now employees stores: {employee_id: {"name": "...", "role_id": ...}}
    employees = {int(k): v for k, v in raw.items()}
else:
    employees = {}

def log_attendance_to_db(employee_id, name, action, timestamp, time_out=None):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        date_str = timestamp.split(" ")[0]
        time_str = timestamp.split(" ")[1]
        calc_time_out = time_out or time_str

        # Check if there's already a record for this employee today
        cursor.execute("""
                       SELECT timesheet_id, time_in, time_out
                       FROM timesheets
                       WHERE employee_id = %s AND date = %s
                       """, (employee_id, date_str))
        record = cursor.fetchone()

        if action == "check_in":
            if record:
                print(f"[INFO] {name} already checked in today (ID: {employee_id})")
            else:
                cursor.execute("""
                               INSERT INTO timesheets (employee_id, date, time_in)
                               VALUES (%s, %s, %s)
                               """, (employee_id, date_str, time_str))
                print(f"[SUCCESS] {name} checked in at {time_str}")

        elif action == "check_out":
            if record and record[2] is None:
                time_in = record[1]
                if time_in:
                    # Calculate overtime hours
                    cursor.execute("SELECT TIMESTAMPDIFF(MINUTE, %s, %s)", (time_in, calc_time_out))
                    result = cursor.fetchone()
                    total_minutes = result[0] if result and result[0] is not None else 0
                    total_hours = total_minutes / 60.0 if total_minutes else 0.0
                    overtime = max(0.0, total_hours - 8)
                    cursor.execute(
                        """
                        UPDATE timesheets
                        SET time_out = %s, overtime_hours = %s
                        WHERE timesheet_id = %s
                        """,
                        (calc_time_out, round(overtime, 2), record[0])
                    )
                else:
                    print(f"[WARNING] Missing time_in for {employee_id}")
            else:
                print(f"[INFO] {name} already checked out today (ID: {employee_id})")

        connection.commit()
        cursor.close()
        connection.close()

    except Error as e:
        print(f"[WARNING] Database error: {e}")


# Helpers
def save_embeddings():
    with open(embeddings_file, "wb") as f:
        pickle.dump(embeddings_db, f)

def save_employees():
    with open(employees_file, "w") as f:
        json.dump({str(k): v for k, v in employees.items()}, f, indent=2)

# POST /register - Register new employee or add samples
# POST /register - Register new employee or add samples
@app.post("/register")
async def register_face(
        files: list[UploadFile] = File(...),
        employee_id: int = Form(...),
        name: str = Form(...),
        role_id: int = Form(default=4)
):
    try:
        print(f"[INFO] Attempting to register employee ID: {employee_id}, Name: {name}, Role: {role_id}")

        # CHECK: Is this employee already registered?
        if employee_id in embeddings_db:
            print(f"[WARNING] Employee {employee_id} already exists!")
            # Ask user if they want to update or cancel
            return {
                "success": False,
                "error": f"Employee ID {employee_id} is already registered. Use /update endpoint to update.",
                "existing_data": employees.get(employee_id)
            }

        # CHECK: Does this name already exist under a different ID?
        for existing_id, data in employees.items():
            existing_name = data.get("name") if isinstance(data, dict) else data
            if existing_name == name and existing_id != employee_id:
                print(f"[WARNING] Name '{name}' already registered under ID {existing_id}")
                return {
                    "success": False,
                    "error": f"Name '{name}' is already registered under employee ID {existing_id}",
                    "existing_employee_id": existing_id
                }

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

        save_embeddings()

        # Store both name and role_id
        employees[employee_id] = {
            "name": name,
            "role_id": role_id
        }
        save_employees()

        print(f"[SUCCESS] Registered {name} (ID: {employee_id}, Role: {role_id})")
        return {"success": True, "message": f"Registered {name} with role_id {role_id} and {len(files)} samples."}

    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


# Add this NEW endpoint after /register
@app.put("/update/{employee_id}")
async def update_face(
        employee_id: int,
        files: list[UploadFile] = File(...),
        name: str = Form(None),
        role_id: int = Form(None)
):
    """Update existing employee's face embeddings and/or info"""
    try:
        if employee_id not in embeddings_db:
            return {"success": False, "error": f"Employee ID {employee_id} not found"}

        print(f"🔄 Updating employee ID: {employee_id}")

        # Update face embeddings if files provided
        if files and len(files) > 0:
            all_embeddings = []
            os.makedirs(f"faces_db/{employee_id}", exist_ok=True)

            for idx, file in enumerate(files):
                save_path = f"faces_db/{employee_id}/{employee_id}_updated_{idx}.jpg"
                with open(save_path, "wb") as f:
                    shutil.copyfileobj(file.file, f)

                result = DeepFace.represent(
                    img_path=save_path,
                    model_name="Facenet512",
                    detector_backend="mtcnn",
                    enforce_detection=True
                )[0]["embedding"]

                emb = np.array(result, dtype=np.float32)
                emb /= np.linalg.norm(emb)
                all_embeddings.append(emb)

            mean_embedding = np.mean(all_embeddings, axis=0)
            embeddings_db[employee_id] = mean_embedding.tolist()
            save_embeddings()

        # Update name and/or role if provided
        current_data = employees.get(employee_id, {})
        if isinstance(current_data, str):
            current_data = {"name": current_data, "role_id": 4}

        if name:
            current_data["name"] = name
        if role_id:
            current_data["role_id"] = role_id

        employees[employee_id] = current_data
        save_employees()

        print(f"[SUCCESS] Updated employee {employee_id}: {current_data}")
        return {"success": True, "message": f"Updated employee {employee_id}", "data": current_data}

    except Exception as e:
        print(f"[ERROR] Update error: {e}")
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
            print("[ERROR] DeepFace error:", e)
            return {"matched": False, "error": f"Face detection/embedding error: {str(e)}"}

        uploaded_embedding = np.array(result, dtype=np.float32)
        norm = np.linalg.norm(uploaded_embedding)
        if norm == 0 or np.isnan(norm) or np.isinf(norm):
            return {"matched": False, "error": "Invalid face embedding detected."}
        uploaded_embedding /= norm

        # 2) Find best match (cosine similarity)
        best_match_id = None
        best_score = -1.0

        print(f"[DEBUG] Comparing against {len(embeddings_db)} registered employees: {list(embeddings_db.keys())}")

        for emp_id, emb in embeddings_db.items():
            try:
                emb_array = np.array(emb, dtype=np.float32)
            except Exception as e:
                print(f"[WARNING] Error converting embedding for employee {emp_id}: {e}")
                continue
            emb_norm = np.linalg.norm(emb_array)
            if emb_norm == 0 or np.isnan(emb_norm) or np.isinf(emb_norm):
                print(f"[WARNING] Invalid embedding norm for employee {emp_id}")
                continue
            emb_array /= emb_norm
            sim = float(np.dot(emb_array, uploaded_embedding))
            print(f"  Employee {emp_id}: similarity = {sim:.4f}")
            if sim > best_score:
                best_score = sim
                best_match_id = emp_id

        THRESHOLD = 0.75

        print(f"[MATCH] Best match: Employee {best_match_id} with score {best_score:.4f} (threshold: {THRESHOLD})")

        if not best_match_id or best_score < THRESHOLD:
            return {
                "matched": False,
                "message": "Face not recognized or confidence too low.",
                "similarity": float(best_score) if best_score != -1.0 else None,
                "confidence": float(round(best_score * 100, 2)) if best_score != -1.0 else None
            }

        employee_id = best_match_id

        # [SUCCESS] Get employee name and stored role_id from local storage
        employee_data = employees.get(employee_id, {"name": "Unknown", "role_id": None})
        if isinstance(employee_data, dict):
            name = employee_data.get("name", "Unknown")
            stored_role_id = employee_data.get("role_id")
        else:
            # Backward compatibility: if employees[id] is just a string
            name = employee_data if isinstance(employee_data, str) else "Unknown"
            stored_role_id = None

        now = datetime.datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

        # [SUCCESS] Fetch role from database (most authoritative source)
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            cursor = connection.cursor()

            # Get role from UserAccounts table with JOIN to Roles
            cursor.execute("""
                           SELECT ua.role_id, r.role_name
                           FROM UserAccounts ua
                                    LEFT JOIN Roles r ON ua.role_id = r.role_id
                           WHERE ua.employee_id = %s
                               LIMIT 1
                           """, (int(employee_id),))
            role_row = cursor.fetchone()

            cursor.close()
            connection.close()

            # Map role_id to role name for frontend
            role_map = {
                1: 'admin',
                2: 'manager',
                3: 'payroll',
                4: 'employee'
            }

            if role_row and role_row[0]:
                role_id = role_row[0]
                user_role = role_map.get(role_id, 'employee')
                print(f"[SUCCESS] Retrieved role from DB: {user_role} (role_id: {role_id})")
            elif stored_role_id:
                # Fallback to stored role if DB doesn't have it
                role_id = stored_role_id
                user_role = role_map.get(role_id, 'employee')
                print(f"[WARNING] Using stored role: {user_role} (role_id: {role_id})")
            else:
                # Default to employee if no role found anywhere
                role_id = 4
                user_role = 'employee'
                print(f"[WARNING] No role found, defaulting to employee")

        except Exception as role_error:
            print(f"[WARNING] Error fetching role from DB: {role_error}")
            # Fallback to stored role or default
            if stored_role_id:
                role_id = stored_role_id
                role_map = {1: 'admin', 2: 'manager', 3: 'payroll', 4: 'employee'}
                user_role = role_map.get(role_id, 'employee')
            else:
                role_id = 4
                user_role = 'employee'

        # Handle logout action
        if action == "logout":
            try:
                connection = mysql.connector.connect(**DB_CONFIG)
                cursor = connection.cursor()

                cursor.execute("""
                               SELECT timesheet_id, time_in, time_out
                               FROM timesheets
                               WHERE employee_id = %s AND date = %s
                               """, (int(employee_id), date_str))
                record = cursor.fetchone()

                if record and record[2] is None:
                    time_in = record[1]
                    time_out = timestamp.split(" ")[1]

                    # Calculate overtime with NULL check
                    cursor.execute("SELECT TIMESTAMPDIFF(MINUTE, %s, %s)", (time_in, time_out))
                    result = cursor.fetchone()
                    total_minutes = result[0] if result and result[0] is not None else 0

                    if total_minutes > 0:
                        total_hours = total_minutes / 60.0
                        overtime = max(0, total_hours - 8)
                    else:
                        overtime = 0.0

                    cursor.execute("""
                                   UPDATE timesheets
                                   SET time_out = %s, overtime_hours = %s
                                   WHERE timesheet_id = %s
                                   """, (time_out, round(overtime, 2), record[0]))
                    connection.commit()
                    print(f"[SUCCESS] {name} logged out at {time_out} (Overtime: {round(overtime, 2)}h)")
                else:
                    print(f"[WARNING] No active session for {name} today")

                cursor.close()
                connection.close()

            except Error as db_error:
                print(f"[WARNING] Database error during logout: {db_error}")

            return {
                "matched": True,
                "attendance_recorded": True,
                "employee_id": employee_id,
                "role_id": role_id,
                "role": user_role,
                "name": name,
                "action": "time_out",
                "timestamp": timestamp,
                "similarity": float(best_score),
                "confidence": float(round(best_score * 100, 2))
            }

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
            print("[WARNING] Could not check database for previous record:", db_check_error)
            record = None

        if record:
            time_in_val = record[1]
            time_out_val = record[2]
            if time_in_val and not time_out_val:
                next_action = "check_out"
            elif time_in_val and time_out_val:
                next_action = "check_in"
            else:
                next_action = "check_in"
        else:
            next_action = "check_in"

        # Sync to DB
        try:
            log_attendance_to_db(int(employee_id), name, next_action, timestamp)
        except Exception as db_log_error:
            print("[WARNING] Error writing attendance to DB:", db_log_error)

        # Return success to frontend with role
        print(f"[SUCCESS] Successful login: {name} (ID: {employee_id}, Role: {user_role})")
        return {
            "matched": True,
            "employee_id": employee_id,
            "role_id": role_id,
            "name": name,
            "role": user_role,
            "action": next_action,
            "timestamp": timestamp,
            "similarity": float(best_score),
            "confidence": float(round(best_score * 100, 2))
        }

    except Exception as e:
        print("[ERROR] Unexpected error in /recognize:", e)
        import traceback
        traceback.print_exc()
        return {"matched": False, "error": f"Unexpected server error: {str(e)}"}
