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

from PIL import Image, ImageDraw
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


# Return the video clip a BharatPotHole image came from.
def clip_of(image):
    return image.stem.removeprefix("bharat_").split("_frame_")[0]


# Score every BharatPotHole validation clip, to see if one clip skews the result.
def clip_report(model):
    clips = {}
    for image in images_of("valid", "bharat"):
        clip = clips.setdefault(clip_of(image), Counter())
        labels = read_boxes(image)
        result = model.predict(str(image), imgsz=IMAGE_SIZE, conf=CONFIDENCE, verbose=False)[0]
        predictions = result.boxes.xyxyn.cpu().numpy().tolist()
        clip["images"] += 1
        clip["boxes"] += len(labels)
        clip["found"] += sum(any(iou(l, p) >= MATCH_IOU for p in predictions) for l in labels)
        clip["predicted"] += len(predictions)
        clip["correct"] += sum(any(iou(l, p) >= MATCH_IOU for l in labels) for p in predictions)

    print(f"{'clip':<32}{'images':>7}{'boxes':>7}{'found':>7}{'predicted':>10}{'correct':>9}")
    for name, c in sorted(clips.items(), key=lambda item: -item[1]["boxes"]):
        print(f"{name:<32}{c['images']:>7}{c['boxes']:>7}{c['found']:>7}"
              f"{c['predicted']:>10}{c['correct']:>9}")
    return clips


# Save a sheet from one clip: human labels in red, model boxes in green.
def clip_sheet(model, clip, name, count=12, tile=480, columns=4):
    images = [i for i in images_of("valid", "bharat") if clip_of(i) == clip and read_boxes(i)]
    chosen = images[::max(1, len(images) // count)][:count]
    rows = (len(chosen) + columns - 1) // columns
    page = Image.new("RGB", (columns * tile, rows * tile), "white")
    for i, path in enumerate(chosen):
        image = Image.open(path).convert("RGB").resize((tile, tile))
        draw = ImageDraw.Draw(image)
        result = model.predict(str(path), imgsz=IMAGE_SIZE, conf=CONFIDENCE, verbose=False)[0]
        for box in read_boxes(path):
            draw.rectangle([v * tile for v in box], outline="red", width=2)
        for box in result.boxes.xyxyn.cpu().numpy().tolist():
            draw.rectangle([v * tile for v in box], outline="lime", width=2)
        page.paste(image, ((i % columns) * tile, (i // columns) * tile))
    page.save(OUTPUT / name, quality=85)


unzip_dataset()
model = YOLO(str(next(Path("/kaggle/input").rglob("best.pt"))))

clips = clip_report(model)
largest = sorted(clips, key=lambda name: -clips[name]["boxes"])[:2]
clip_sheet(model, largest[0], "clip_largest.jpg")
clip_sheet(model, largest[1], "clip_second.jpg")

rest = [c for name, c in clips.items() if name != largest[0]]
boxes, found = sum(c["boxes"] for c in rest), sum(c["found"] for c in rest)
print(f"\nWithout the largest clip: {found} of {boxes} found ({found / boxes:.2f})")

with open(OUTPUT / "clips.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["clip", "images", "boxes", "found", "predicted", "correct"])
    for name, c in clips.items():
        writer.writerow([name, c["images"], c["boxes"], c["found"], c["predicted"], c["correct"]])
print("\nDone.")
