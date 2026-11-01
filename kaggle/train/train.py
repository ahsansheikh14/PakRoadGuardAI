# Step 4: train the pothole model on Kaggle's GPU.
# So far this file only holds data.yaml. Unzipping and the train call come next.
from pathlib import Path

DATASET = Path("/tmp/pothole_dataset")  # where the notebook will unzip the dataset

# The settings file that tells YOLO where the data is and what it is detecting.
DATA_YAML = """\
path: /tmp/pothole_dataset
train: train/images
val: valid/images
names:
  0: pothole
"""


# Save data.yaml into the dataset folder. Must run after the zip has been unpacked.
def write_data_yaml():
    (DATASET / "data.yaml").write_text(DATA_YAML)
