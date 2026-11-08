# Step 4: train the pothole model on Kaggle's GPU.
# Runs on Kaggle. Saves weights, scores and charts to /kaggle/working/runs.
import subprocess
import sys
import zipfile
from pathlib import Path

# Kaggle's computer starts fresh, so install the YOLO library first.
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "ultralytics"], check=True)

import torch
from ultralytics import YOLO

DATASET = Path("/tmp/pothole_dataset")  # where the notebook unzips the dataset
RESULTS = "/kaggle/working/runs"        # saved as notebook output when the run ends

EPOCHS = 100  # the most it can run; early stopping can end it sooner
TRAIN_IMAGES = 6510  # from summary.csv, version 6 of pothole-prepare-data

# The settings file that tells YOLO where the data is and what it is detecting.
DATA_YAML = """\
path: /tmp/pothole_dataset
train: train/images
val: valid/images
names:
  0: pothole
"""


# Find the zip made by pothole-prepare-data and unpack it into the temporary folder.
def unzip_dataset():
    zip_path = next(Path("/kaggle/input").rglob("pothole_dataset.zip"))
    print("Unzipping", zip_path, flush=True)
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(DATASET)


# Save data.yaml into the dataset folder. Must run after the zip has been unpacked.
def write_data_yaml():
    (DATASET / "data.yaml").write_text(DATA_YAML)


# Stop early if the data or GPU is not what we expect, before wasting GPU time.
def check_setup():
    images = len(list((DATASET / "train" / "images").glob("*.jpg")))
    print(f"GPU available: {torch.cuda.is_available()}")
    print(f"Training images: {images}", flush=True)
    if not torch.cuda.is_available() or images != TRAIN_IMAGES:
        raise SystemExit(f"Stopping: expected a GPU and {TRAIN_IMAGES} training images.")


unzip_dataset()
write_data_yaml()
check_setup()

model = YOLO("yolo11n.pt")
# save_period=1000 saves epoch0.pt only, because epoch 0 is the only multiple of 1000 we reach.
# time=1.75 stops training after 1 hour 45 minutes, even if epochs are left.
model.train(data=str(DATASET / "data.yaml"), imgsz=960, epochs=EPOCHS, batch=16, patience=20,
            save_period=1000, time=1.75, project=RESULTS, name="pothole_yolo11n_960")
print("Done.")
