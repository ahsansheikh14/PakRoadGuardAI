# Train the vehicle detector (YOLO26n) on Kaggle's GPU.
# The clean, leak-free dataset comes from the vehicle-prepare notebook, attached as kernel_sources,
# so no Roboflow secret is needed and the notebook can be pushed and run from the terminal.
import subprocess
import sys
import zipfile
from pathlib import Path

# Kaggle's computer starts fresh, so install (or upgrade) Ultralytics first.
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "ultralytics"], check=True)

import torch
import ultralytics
from ultralytics import YOLO

MODEL = "yolo26n.pt"        # the model we train
EPOCHS = 2                  # short test run; the full run uses 100
TRAIN_IMAGES = 7419         # from class_counts / manifest of vehicle-prepare
DATASET = Path("/tmp/vehicle_dataset")
RESULTS = "/kaggle/working/runs"


# Find vehicle_dataset.zip from vehicle-prepare and unpack it into the temporary folder.
def unzip_dataset():
    zip_path = next(Path("/kaggle/input").rglob("vehicle_dataset.zip"))
    print("Unzipping", zip_path, flush=True)
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(DATASET)


# Stop early, before wasting GPU time, if anything is not as expected.
def check_setup():
    print("Ultralytics version:", ultralytics.__version__)
    major, minor = (int(part) for part in ultralytics.__version__.split(".")[:2])
    if (major, minor) < (8, 4):
        raise SystemExit("Stopping: YOLO26 needs Ultralytics 8.4 or newer.")

    images = sum(1 for _ in (DATASET / "train" / "images").glob("*"))
    print("GPU available:", torch.cuda.is_available())
    print("Training images:", images, flush=True)
    if not torch.cuda.is_available() or images != TRAIN_IMAGES:
        raise SystemExit(f"Stopping: expected a GPU and {TRAIN_IMAGES} training images.")


unzip_dataset()
check_setup()

model = YOLO(MODEL)
model.train(data=str(DATASET / "data.yaml"), imgsz=640, epochs=EPOCHS, batch=16, patience=20,
            project=RESULTS, name="vehicle_yolo26n")
print("Done.")
