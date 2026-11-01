# Step 4 diagnosis: find out why best.pt scored low.
# Uses validation images only. Test sets are not touched. Nothing is retrained.
import csv
import math
import subprocess
import sys
import zipfile
from collections import Counter
from pathlib import Path

subprocess.run([sys.executable, "-m", "pip", "install", "-q", "ultralytics"], check=True)

from PIL import Image
from ultralytics import YOLO

DATASET = Path("/tmp/pothole_dataset")
OUTPUT = Path("/kaggle/working")
IMAGE_SIZE = 640
CONFIDENCE = 0.25  # the normal cut-off for showing a box
MATCH_IOU = 0.5    # a label counts as found if a box overlaps it this much
SIZE_NAMES = ("tiny", "small", "medium", "large")


# Find the dataset made by pothole-prepare-data and unpack it.
def unzip_dataset():
    zip_path = next(Path("/kaggle/input").rglob("pothole_dataset.zip"))
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(DATASET)


# Return all images in a set that belong to one dataset, such as bharat.
def images_of(set_name, dataset):
    return sorted((DATASET / set_name / "images").glob(f"{dataset}_*.jpg"))


# Give YOLO a settings file that points only at one dataset's validation images.
def write_subset_yaml(dataset):
    list_file = DATASET / f"valid_{dataset}.txt"
    list_file.write_text("\n".join(str(p) for p in images_of("valid", dataset)))
    yaml_file = DATASET / f"valid_{dataset}.yaml"
    yaml_file.write_text(f"path: {DATASET}\ntrain: {list_file}\nval: {list_file}\n"
                         "names:\n  0: pothole\n")
    return yaml_file


# Read a label file and return each box as (left, top, right, bottom), from 0 to 1.
def read_boxes(image):
    label = image.parent.parent / "labels" / f"{image.stem}.txt"
    boxes = []
    for line in label.read_text().splitlines():
        if line.strip():
            cx, cy, w, h = map(float, line.split()[1:])
            boxes.append((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
    return boxes


# Measure how much two boxes overlap: 0 means not at all, 1 means exactly the same.
def iou(a, b):
    width = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    height = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    overlap = width * height
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return overlap / (area_a + area_b - overlap + 1e-9)


# Put a box in a size group, using its size in pixels after resizing to 640.
def size_group(box, image_size):
    scale = IMAGE_SIZE / max(image_size)
    pixels = math.sqrt((box[2] - box[0]) * image_size[0] * scale
                       * (box[3] - box[1]) * image_size[1] * scale)
    if pixels < 16:
        return "tiny"
    if pixels < 32:
        return "small"
    if pixels < 96:
        return "medium"
    return "large"


# Count how many training boxes of each size the model had to learn from.
def training_sizes(dataset):
    counts = Counter()
    for image in images_of("train", dataset):
        with Image.open(image) as picture:
            for box in read_boxes(image):
                counts[size_group(box, picture.size)] += 1
    return counts


# Count, per size group, how many labelled potholes the model found.
def found_by_size(model, dataset):
    total, found = Counter(), Counter()
    for image in images_of("valid", dataset):
        labels = read_boxes(image)
        if not labels:
            continue
        with Image.open(image) as picture:
            image_size = picture.size
        result = model.predict(str(image), imgsz=IMAGE_SIZE, conf=CONFIDENCE, verbose=False)[0]
        predictions = result.boxes.xyxyn.cpu().numpy().tolist()
        for label in labels:
            group = size_group(label, image_size)
            total[group] += 1
            found[group] += any(iou(label, p) >= MATCH_IOU for p in predictions)
    return total, found


unzip_dataset()
model = YOLO(str(next(Path("/kaggle/input").rglob("best.pt"))))

rows = []
for dataset in ("bharat", "mendeley"):
    scores = model.val(data=str(write_subset_yaml(dataset)), imgsz=IMAGE_SIZE, batch=16,
                       plots=False, verbose=False, project="/tmp/val", name=dataset)
    print(f"\n===== {dataset.upper()} VALIDATION =====")
    print(f"precision {scores.box.mp:.3f}, recall {scores.box.mr:.3f}, "
          f"mAP50 {scores.box.map50:.3f}, mAP50-95 {scores.box.map:.3f}", flush=True)

    train_counts = training_sizes(dataset)
    total, found = found_by_size(model, dataset)
    print(f"{'size':<8}{'train boxes':>12}{'val boxes':>11}{'found':>7}{'recall':>8}")
    for size in SIZE_NAMES:
        recall = found[size] / total[size] if total[size] else 0
        print(f"{size:<8}{train_counts[size]:>12}{total[size]:>11}{found[size]:>7}{recall:>8.2f}")
        rows.append((dataset, size, train_counts[size], total[size], found[size], round(recall, 3)))

with open(OUTPUT / "diagnosis.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["dataset", "size", "train_boxes", "val_boxes", "found", "recall"])
    writer.writerows(rows)
print("\nDone.")
