# Step 2, piece 2: read Zenodo's class names and file names, and draw labelled boxes
# on sample images from all three datasets so we can check them by eye.
import io
import random
import re
import shutil
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

import yaml
from PIL import Image, ImageDraw

ZENODO_URL = "https://zenodo.org/api/records/13832363/files/Road_Anomaly_Dataset.zip/content"
MENDELEY_URL = ("https://data.mendeley.com/public-files/datasets/tp95cdvgm8/files/"
                "6eb812d0-cf9b-46ec-bcd7-6d9fe1b8d768/file_downloaded")
TEMP = Path("/tmp/samples")
TEMP.mkdir(exist_ok=True)
OUTPUT = Path("/kaggle/working")
TILE = 320
random.seed(42)


# Download a file into the temporary folder and return its path.
def download(url, name):
    path = TEMP / name
    print(f"Downloading {name} ...", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "PakRoadGuardAI-FYP/1.0"})
    with urllib.request.urlopen(request) as response, open(path, "wb") as file:
        shutil.copyfileobj(response, file)
    return path


# Return one image tile with its YOLO boxes drawn in red.
def draw_boxes(image_bytes, label_text):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size
    draw = ImageDraw.Draw(image)
    for line in label_text.splitlines():
        values = line.split()
        if len(values) == 5:  # class, centre x, centre y, width, height (0 to 1)
            cx, cy, w, h = map(float, values[1:])
            draw.rectangle([(cx - w / 2) * width, (cy - h / 2) * height,
                            (cx + w / 2) * width, (cy + h / 2) * height],
                           outline="red", width=max(3, width // 200))
    return image.resize((TILE, TILE))


# Paste image tiles into one picture and save it.
def save_sheet(tiles, name, columns=4):
    rows = (len(tiles) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * TILE, rows * TILE), "white")
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % columns) * TILE, (i // columns) * TILE))
    sheet.save(OUTPUT / name, quality=80)
    print("Saved", name)


# Remove Roboflow's copy suffix: name_jpg.rf.abc123 becomes name.
def base_name(stem):
    return re.sub(r"[_.]jpe?g$", "", re.sub(r"\.rf\..*$", "", stem), flags=re.I)


# Zenodo: print counts and name patterns per class, and save a sample sheet for each class.
def inspect_zenodo(path):
    print("\n===== ZENODO =====")
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        for name in names:
            if name.endswith(".yaml") and "Performance Results" not in name:
                print(name, "\n", archive.read(name).decode("utf-8", "ignore"))
            elif name.endswith("data.yaml"):
                print(name, yaml.safe_load(archive.read(name)).get("names"))

        labels = [n for n in names if "/labels/" in n and n.endswith(".txt")]
        images = {Path(n).stem: n for n in names
                  if "/images/" in n and n.lower().endswith((".jpg", ".png"))}
        print(f"{len(labels)} labels, {len(images)} images")

        by_class = defaultdict(list)
        odd_lines = 0
        for label in labels:
            text = archive.read(label).decode("utf-8", "ignore")
            lines = [l for l in text.splitlines() if l.strip()]
            odd_lines += sum(len(l.split()) != 5 for l in lines)
            for class_id in {l.split()[0] for l in lines}:
                by_class[class_id].append(label)
        print("Label lines that are not plain boxes:", odd_lines)

        for class_id, class_labels in sorted(by_class.items()):
            print(f"\nClass {class_id}: {len(class_labels)} images")
            splits = Counter(l.split("/")[2] for l in class_labels)
            stems = [Path(l).stem for l in class_labels]
            bases = Counter(base_name(s) for s in stems)
            print(f"  per split {dict(splits)}; {len(bases)} unique before copies; "
                  f"copies per image {Counter(bases.values())}")
            prefixes = Counter(re.sub(r"[\W\d_]+$", "", b) for b in bases)
            print("  name patterns:", prefixes.most_common(10))
            print("  samples:", sorted(stems)[:6])

            tiles = []
            for label in random.sample(class_labels, min(8, len(class_labels))):
                image = images.get(Path(label).stem)
                if image:
                    tiles.append(draw_boxes(archive.read(image),
                                            archive.read(label).decode("utf-8", "ignore")))
            save_sheet(tiles, f"zenodo_class_{class_id}.jpg")


# Mendeley: save a sheet of 8 random images with their boxes.
def sheet_mendeley(path):
    with zipfile.ZipFile(path) as archive:
        chosen = random.sample(range(1, 714), 8)
        tiles = [draw_boxes(archive.read(f"IMG/Pothole-{i:03d}.jpg"),
                            archive.read(f"TXT/Pothole-{i:03d}.txt").decode()) for i in chosen]
    save_sheet(tiles, "mendeley.jpg")


# BharatPotHole: save a sheet of 8 random training images that have boxes.
def sheet_bharat():
    root = next(Path("/kaggle/input").rglob("data.yaml")).parent
    with_boxes = [p for p in (root / "train" / "labels").glob("*.txt") if p.stat().st_size > 0]
    tiles = []
    for label in random.sample(with_boxes, 8):
        image = root / "train" / "images" / (label.stem + ".jpg")
        tiles.append(draw_boxes(image.read_bytes(), label.read_text()))
    save_sheet(tiles, "bharat.jpg")


# Make a 64-bit fingerprint of a picture. Similar-looking pictures get similar fingerprints.
def dhash(image_bytes):
    small = Image.open(io.BytesIO(image_bytes)).convert("L").resize((9, 8))
    pixels = list(small.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = bits * 2 + (pixels[row * 9 + col] > pixels[row * 9 + col + 1])
    return bits


# Mendeley: count pairs of near-identical photos at three strictness levels.
def mendeley_duplicates(path):
    print("\n===== MENDELEY NEAR-DUPLICATES =====")
    with zipfile.ZipFile(path) as archive:
        hashes = {i: dhash(archive.read(f"IMG/Pothole-{i:03d}.jpg")) for i in range(1, 714)}
    for limit in (2, 6, 10):
        pairs = [(a, b) for a in hashes for b in hashes
                 if a < b and bin(hashes[a] ^ hashes[b]).count("1") <= limit]
        print(f"Pairs differing by {limit} bits or fewer: {len(pairs)}. Examples: {pairs[:10]}")


# Zenodo: list every unique pothole image and save a sheet of samples in name order.
def list_zenodo_potholes(path, pothole_class="2"):
    print("\n===== ZENODO POTHOLE IMAGES =====")
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        images = {Path(n).stem: n for n in names if "/images/" in n}
        groups = defaultdict(list)
        for label in (n for n in names if "/labels/" in n and n.endswith(".txt")):
            text = archive.read(label).decode("utf-8", "ignore")
            classes = {l.split()[0] for l in text.splitlines() if l.strip()}
            if pothole_class in classes:
                groups[base_name(Path(label).stem)].append((label.split("/")[2], label))
                if classes != {pothole_class}:
                    print("Mixed classes:", label, classes)

        print(f"{len(groups)} unique images")
        for base, copies in sorted(groups.items()):
            print(f"{base}  {copies[0][0]}  x{len(copies)}")

        ordered = sorted(groups)
        tiles = []
        for base in ordered[::len(ordered) // 24][:24]:
            label = groups[base][0][1]
            tiles.append(draw_boxes(archive.read(images[Path(label).stem]),
                                    archive.read(label).decode("utf-8", "ignore")))
        save_sheet(tiles, "zenodo_potholes_in_order.jpg", columns=6)


mendeley_duplicates(download(MENDELEY_URL, "mendeley.zip"))
list_zenodo_potholes(download(ZENODO_URL, "zenodo.zip"))
print("\nDone.")
