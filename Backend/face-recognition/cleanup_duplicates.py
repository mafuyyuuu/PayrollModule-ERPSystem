import pickle
import json
import shutil
import os

# Load current data
with open("embeddings_db.pkl", "rb") as f:
    embeddings_db = pickle.load(f)

with open("employees.json", "r") as f:
    employees = json.load(f)

print("Current employees:")
for emp_id, data in employees.items():
    print(f"  ID {emp_id}: {data}")

# Keep only employee 9, remove all others with same name
KEEP_ID = 9
YOUR_NAME = "jhervin.jimenez"

ids_to_delete = []
for emp_id, data in employees.items():
    emp_id_int = int(emp_id)
    name = data.get("name") if isinstance(data, dict) else data

    if name == YOUR_NAME and emp_id_int != KEEP_ID:
        ids_to_delete.append(emp_id_int)
        print(f"❌ Marking ID {emp_id} for deletion (duplicate of {KEEP_ID})")

# Delete duplicates
for emp_id in ids_to_delete:
    # Remove from embeddings
    if emp_id in embeddings_db:
        del embeddings_db[emp_id]
        print(f"  Deleted embedding for ID {emp_id}")

    # Remove from employees
    if str(emp_id) in employees:
        del employees[str(emp_id)]
        print(f"  Deleted employee data for ID {emp_id}")

    # Remove face images folder
    face_folder = f"faces_db/{emp_id}"
    if os.path.exists(face_folder):
        shutil.rmtree(face_folder)
        print(f"  Deleted face images folder for ID {emp_id}")

# Save cleaned data
with open("embeddings_db.pkl", "wb") as f:
    pickle.dump(embeddings_db, f)

with open("employees.json", "w") as f:
    json.dump(employees, f, indent=2)

print("\n✅ Cleanup complete!")
print(f"Kept employee ID {KEEP_ID}")
print(f"Deleted {len(ids_to_delete)} duplicate(s): {ids_to_delete}")

print("\nRemaining employees:")
for emp_id, data in employees.items():
    print(f"  ID {emp_id}: {data}")