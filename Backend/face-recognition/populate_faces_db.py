import os
import shutil

# Source folder where your reference images are stored
# Example: create a "reference_images" folder in the same directory and put images there
SOURCE_FOLDER = "reference_images"
TARGET_FOLDER = "faces_db"

os.makedirs(TARGET_FOLDER, exist_ok=True)

# Copy all images from SOURCE_FOLDER to faces_db
if not os.path.exists(SOURCE_FOLDER):
    print(f"Please create a '{SOURCE_FOLDER}' folder and add reference images first.")
else:
    count = 0
    for file in os.listdir(SOURCE_FOLDER):
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            src_path = os.path.join(SOURCE_FOLDER, file)
            dst_path = os.path.join(TARGET_FOLDER, file)
            shutil.copy(src_path, dst_path)
            count += 1
    print(f"Copied {count} reference images to '{TARGET_FOLDER}'.")

print("Faces database is ready! You can now run server.py and test the /recognize endpoint.")
