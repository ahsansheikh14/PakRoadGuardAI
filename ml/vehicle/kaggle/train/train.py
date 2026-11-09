# Train the vehicle detector on Kaggle's GPU. NOT pushed or run yet.
# Switch between the main model and the baseline by changing MODEL only.
import subprocess
import sys

# Kaggle's computer starts fresh, so install (or upgrade) the libraries first.
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "ultralytics", "roboflow"],
               check=True)

import torch
import ultralytics
from ultralytics import YOLO

MODEL = "yolo26n.pt"  # main model; change to "yolo11n.pt" for the baseline
EPOCHS = 100          # the most it can run; early stopping can end it sooner
IMAGE_SIZE = 640
DATASET = "/tmp/vehicles_v9"
RESULTS = "/kaggle/working/runs"


# Print the versions, and stop if Ultralytics is too old to know YOLO26 (added in 8.4.0).
def check_versions():
    print("Ultralytics version:", ultralytics.__version__)
    print("GPU available:", torch.cuda.is_available())
    major, minor = (int(part) for part in ultralytics.__version__.split(".")[:2])
    if (major, minor) < (8, 4):
        raise SystemExit("Stopping: YOLO26 needs Ultralytics 8.4 or newer.")


# Download version 9 of the vehicle dataset from Roboflow. The API key is never printed.
def download_dataset():
    from kaggle_secrets import UserSecretsClient
    from roboflow import Roboflow

    api_key = UserSecretsClient().get_secret("ROBOFLOW_API_KEY")
    project = Roboflow(api_key=api_key).workspace("labelme-to-darknet-yolo") \
                                       .project("classification-of-vehicles")
    return project.version(9).download("yolov11", location=DATASET).location


check_versions()
location = download_dataset()

# Before the first real run: check the data.yaml paths printed by the vehicle-data notebook.
model = YOLO(MODEL)
model.train(data=f"{location}/data.yaml", imgsz=IMAGE_SIZE, epochs=EPOCHS, batch=16, patience=20,
            project=RESULTS, name=MODEL.removesuffix(".pt"))
print("Done.")
