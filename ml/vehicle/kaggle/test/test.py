# Score the trained vehicle model ONCE on the test set (970 images it has never seen).
# Uses the clean zip from vehicle-prepare and best.pt from vehicle-train. Nothing is trained.
import csv
import subprocess
import sys
import zipfile
from pathlib import Path

subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "ultralytics"], check=True)

from ultralytics import YOLO

DATASET = Path("/tmp/vehicle_dataset")
OUTPUT = Path("/kaggle/working")
TEST_IMAGES = 970  # from vehicle-prepare


# Find vehicle_dataset.zip from vehicle-prepare and unpack it into the temporary folder.
def unzip_dataset():
    zip_path = next(Path("/kaggle/input").rglob("vehicle_dataset.zip"))
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(DATASET)
    images = sum(1 for _ in (DATASET / "test" / "images").glob("*"))
    print("Test images:", images, flush=True)
    if images != TEST_IMAGES:
        raise SystemExit(f"Stopping: expected {TEST_IMAGES} test images.")


# Save precision, recall, mAP50 and mAP50-95 for every class, and for all classes together.
def save_scores(scores, names):
    rows = [("All", scores.box.mp, scores.box.mr, scores.box.map50, scores.box.map)]
    for i, class_id in enumerate(scores.box.ap_class_index):
        rows.append((names[int(class_id)], scores.box.p[i], scores.box.r[i],
                     scores.box.ap50[i], scores.box.ap[i]))
    with open(OUTPUT / "test_scores.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["class", "precision", "recall", "mAP50", "mAP50-95"])
        for row in rows:
            writer.writerow([row[0]] + [round(float(v), 3) for v in row[1:]])
            print(f"{row[0]:<10}" + "".join(f"{float(v):>10.3f}" for v in row[1:]))


unzip_dataset()
weights = next(Path("/kaggle/input").rglob("best.pt"))
print("Model:", weights, flush=True)

model = YOLO(str(weights))
scores = model.val(data=str(DATASET / "data.yaml"), split="test", imgsz=640, batch=16,
                   project=str(OUTPUT / "runs"), name="test")
print(f"\n{'class':<10}{'precision':>10}{'recall':>10}{'mAP50':>10}{'mAP50-95':>10}")
save_scores(scores, model.names)
print("Done.")
