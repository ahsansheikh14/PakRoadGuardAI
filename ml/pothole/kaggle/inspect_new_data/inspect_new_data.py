# Check three candidate datasets before adding any to training. This changes nothing.
# Prints counts, classes and README text, and draws sample sheets to check by eye.
import random
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image, ImageDraw

DATASETS = {"mwpd": "multi-weather-pothole-detection-mwpd",
            "road_damage": "road-damage-dataset-potholes-cracks-and-manholes",
            "yolov8": "potholes-detection-yolov8"}
IMAGE_TYPES = (".jpg", ".jpeg", ".png", ".bmp", ".webp")
OUTPUT = Path("/kaggle/working")
TILE = 320
random.seed(42)


# Find the folder where Kaggle attached a dataset.
def find_root(slug):
    return next(p for p in Path("/kaggle/input").rglob(slug) if p.is_dir())


# Print any README or settings files, because they name the classes and licence.
def print_notes(files):
    for file in files:
        if file.suffix.lower() in (".yaml", ".yml") or "readme" in file.name.lower():
            print(f"--- {file.name}")
            print(file.read_text(errors="ignore")[:900])


# Count the classes in the label files, and how many lines are plain boxes.
def read_labels(files):
    classes, shapes, by_class = Counter(), Counter(), defaultdict(list)
    for file in files:
        if file.suffix == ".txt" and "readme" not in file.name.lower():
            lines = [l.split() for l in file.read_text(errors="ignore").splitlines() if l.strip()]
            for line in lines:
                classes[line[0]] += 1
                shapes["box" if len(line) == 5 else "polygon or other"] += 1
            for class_id in {line[0] for line in lines}:
                by_class[class_id].append(file)
    return classes, shapes, by_class


# Return one image tile with the boxes of a chosen class drawn in red.
def draw_tile(image_path, label_path, class_id):
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)
    for line in label_path.read_text(errors="ignore").splitlines():
        values = line.split()
        if len(values) >= 5 and values[0] == class_id:
            numbers = list(map(float, values[1:]))
            if len(numbers) == 4:
                cx, cy, w, h = numbers
                box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
            else:
                xs, ys = numbers[0::2], numbers[1::2]
                box = [min(xs), min(ys), max(xs), max(ys)]
            draw.rectangle([box[0] * image.width, box[1] * image.height,
                            box[2] * image.width, box[3] * image.height],
                           outline="red", width=max(3, image.width // 200))
    return image.resize((TILE, TILE))


# Save a sheet of random images for one class of one dataset.
def save_sheet(name, class_id, labels, images, columns=6, count=24):
    pairs = [(images[l.stem], l) for l in labels if l.stem in images]
    chosen = random.sample(pairs, min(count, len(pairs)))
    rows = (len(chosen) + columns - 1) // columns
    if not chosen:
        print(f"No matching images for class {class_id}")
        return
    sheet = Image.new("RGB", (columns * TILE, rows * TILE), "white")
    for i, (image, label) in enumerate(chosen):
        sheet.paste(draw_tile(image, label, class_id), ((i % columns) * TILE, (i // columns) * TILE))
    sheet.save(OUTPUT / f"{name}_class_{class_id}.jpg", quality=80)
    print(f"Saved {name}_class_{class_id}.jpg")


# Report on one dataset.
def inspect(name, slug):
    print(f"\n========== {name} ==========", flush=True)
    root = find_root(slug)
    files = [p for p in root.rglob("*") if p.is_file()]
    print(f"{len(files)} files. Types: {Counter(p.suffix.lower() for p in files)}")
    folders = Counter("/".join(p.relative_to(root).parts[:3][:-1]) for p in files)
    print("Folders:", folders.most_common(15))
    print_notes(files)

    images = {p.stem: p for p in files if p.suffix.lower() in IMAGE_TYPES}
    classes, shapes, by_class = read_labels(files)
    print(f"Images: {len(images)}. Boxes per class: {dict(classes)}. Line types: {dict(shapes)}")
    if images:
        sizes = Counter(Image.open(p).size for p in random.sample(list(images.values()),
                                                                  min(100, len(images))))
        print("Image sizes (sample of 100):", sizes.most_common(4))
    for class_id, labels in sorted(by_class.items())[:6]:
        save_sheet(name, class_id, labels, images)


for dataset_name, dataset_slug in DATASETS.items():
    inspect(dataset_name, dataset_slug)
print("\nDone.")
