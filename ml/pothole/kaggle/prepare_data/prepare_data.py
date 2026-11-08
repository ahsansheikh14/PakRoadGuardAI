# Step 3: build the final pothole dataset from the three sources.
# Runs on Kaggle. Outputs: pothole_dataset.zip, manifest.csv (which image went where),
# summary.csv (the table for the report) and sheets to check by eye.
import csv
import hashlib
import io
import random
import re
import shutil
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat

ZENODO_URL = "https://zenodo.org/api/records/13832363/files/Road_Anomaly_Dataset.zip/content"
MENDELEY = "https://data.mendeley.com/public-files/datasets/tp95cdvgm8/files/"
MENDELEY_ZIP = MENDELEY + "6eb812d0-cf9b-46ec-bcd7-6d9fe1b8d768/file_downloaded"
MENDELEY_VIDEOS = [MENDELEY + "021b0ea3-9e32-4357-ac71-30ab98076f26/file_downloaded",
                   MENDELEY + "88c05e36-70a6-49ec-afb9-7426004d44eb/file_downloaded"]

SEED = 42  # fixed, so the same shuffle and the same split come out on every run
TEMP = Path("/tmp/prepare")
DATASET = TEMP / "pothole_dataset"
OUTPUT = Path("/kaggle/working")
TEMP.mkdir(exist_ok=True)

ZENODO_POTHOLE_CLASS = "2"
ZENODO_PARTS = {"44": "test_zenodo_local", "55": "test_zenodo_local",
                "66": "test_zenodo_rural", "77": "train"}

manifest = []  # one row per image: part, dataset, group, file name, number of boxes


# Download a file into the temporary folder and return its path.
# Our project name is sent as the User-Agent, because Mendeley refuses Python's default.
def download(url, name):
    path = TEMP / name
    print(f"Downloading {name} ...", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "PakRoadGuardAI-FYP/1.0"})
    with urllib.request.urlopen(request) as response, open(path, "wb") as file:
        shutil.copyfileobj(response, file)
    return path


# Return True if every box value is between 0 and 1, which YOLO requires.
def label_is_valid(label_text):
    return all(0 <= float(value) <= 1
               for line in label_text.splitlines() for value in line.split()[1:])


# Write one image and its label into a part of the final dataset, and record it in the
# manifest. The dataset name goes in front of the file name, so names cannot clash.
# Images with invalid labels are left out, because YOLO would ignore them anyway.
def save(part, dataset, group, name, image_bytes, label_text):
    if not label_is_valid(label_text):
        print(f"Left out (box values outside 0 to 1): {part}, {dataset}, {name}")
        return
    (DATASET / part / "images").mkdir(parents=True, exist_ok=True)
    (DATASET / part / "labels").mkdir(parents=True, exist_ok=True)
    stem = f"{dataset}_{Path(name).stem}"
    (DATASET / part / "images" / f"{stem}.jpg").write_bytes(image_bytes)
    (DATASET / part / "labels" / f"{stem}.txt").write_text(label_text)
    boxes = sum(1 for line in label_text.splitlines() if line.strip())
    manifest.append((part, dataset, group, stem, boxes))


# Shuffle whole groups, then give each group to one part only.
# This is what stops frames of one clip landing in both train and test.
def split_groups(groups, fractions, parts):
    names = sorted(groups)
    random.Random(SEED).shuffle(names)
    result, start = {}, 0
    for part, fraction in zip(parts, fractions):
        end = len(names) if part == parts[-1] else start + round(len(names) * fraction)
        result[part] = names[start:end]
        start = end
    return result


# Make a 64-bit fingerprint of a picture. Similar-looking pictures get similar fingerprints.
def dhash(image):
    small = np.asarray(image.convert("L").resize((9, 8)), dtype=int)
    bits = (small[:, :-1] > small[:, 1:]).flatten()
    return int("".join("1" if b else "0" for b in bits), 2)


# Return True if two fingerprints differ by only a few bits, meaning nearly the same picture.
def close(a, b, limit=6):
    return bin(a ^ b).count("1") <= limit


# Return the label file that belongs to a BharatPotHole image.
def bharat_label(image):
    return image.parent.parent / "labels" / f"{image.stem}.txt"


# Turn a polygon line into the smallest box around it. Normal box lines stay the same.
def polygon_to_box(line):
    values = line.split()
    if len(values) == 5:
        return line
    xs = [float(v) for v in values[1::2]]
    ys = [float(v) for v in values[2::2]]
    left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)
    return (f"{values[0]} {(left + right) / 2:.6f} {(top + bottom) / 2:.6f} "
            f"{right - left:.6f} {bottom - top:.6f}")


# Read a BharatPotHole label and make sure every line is a normal box.
def clean_bharat_label(image):
    lines = bharat_label(image).read_text().splitlines()
    return "\n".join(polygon_to_box(line) for line in lines if line.strip())


# BharatPotHole: merge its three parts, then re-split by video clip to remove its leak.
# Clips with and without potholes are split separately (stratified), so every set gets a
# fair share of both.
def prepare_bharat():
    root = next(Path("/kaggle/input").rglob("data.yaml")).parent
    clips = defaultdict(list)
    for split in ("train", "valid", "test"):
        for image in (root / split / "images").glob("*"):
            clips[image.name.split("_frame_")[0]].append(image)
    print(f"\nBharatPotHole: {sum(map(len, clips.values()))} images, {len(clips)} clips")

    with_potholes = {clip for clip, images in clips.items()
                     if any(bharat_label(i).read_text().strip() for i in images)}
    print(f"Clips with potholes: {len(with_potholes)}, without: {len(clips) - len(with_potholes)}")

    chosen = defaultdict(list)
    for subset in (with_potholes, set(clips) - with_potholes):
        split = split_groups(subset, (0.75, 0.15, 0.10), ("train", "valid", "test_bharat"))
        for part, clip_names in split.items():
            chosen[part].extend(clip_names)

    for part, clip_names in chosen.items():
        for clip in clip_names:
            for image in clips[clip]:
                save(part, "bharat", clip, image.name, image.read_bytes(),
                     clean_bharat_label(image))


# Mendeley: group near-identical photos, split the groups, then check the demo videos.
def prepare_mendeley(path, videos):
    with zipfile.ZipFile(path) as archive:
        names = [f"Pothole-{i:03d}" for i in range(1, 714)]
        images = {n: archive.read(f"IMG/{n}.jpg") for n in names}
        labels = {n: archive.read(f"TXT/{n}.txt").decode() for n in names}

    hashes = {n: dhash(Image.open(io.BytesIO(images[n]))) for n in names}

    group_of = {n: n for n in names}

    # Follow the links to find which group a photo currently belongs to.
    def find(name):
        while group_of[name] != name:
            name = group_of[name]
        return name

    # Join near-identical photos into one group, so they cannot be separated.
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            if close(hashes[a], hashes[b]):
                group_of[find(b)] = find(a)

    groups = defaultdict(list)
    for name in names:
        groups[find(name)].append(name)
    print(f"\nMendeley: {len(names)} images, {len(groups)} groups after joining near-duplicates")

    chosen = split_groups(groups, (0.80, 0.10, 0.10), ("train", "valid", "test_mendeley"))
    for part, group_names in chosen.items():
        for group in group_names:
            for name in groups[group]:
                save(part, "mendeley", group, name, images[name], labels[name])

    # Are the demo videos safe, meaning their frames are not among the photos?
    for video in videos:
        capture = cv2.VideoCapture(str(video))
        fps = round(capture.get(cv2.CAP_PROP_FPS)) or 30
        frame_number, frames_checked, matches = 0, 0, 0
        while True:
            found, frame = capture.read()
            if not found:
                break
            if frame_number % fps == 0:
                frame_hash = dhash(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
                matches += any(close(frame_hash, h) for h in hashes.values())
                frames_checked += 1
            frame_number += 1
        print(f"{video.name}: {frames_checked} frames checked, {matches} match a photo")


# Score how noisy an image is; lower is cleaner.
# Grey copies are ranked last, because real cameras give colour.
def noise_level(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    grey = image.convert("L")
    noise = ImageStat.Stat(ImageChops.difference(grey, grey.filter(ImageFilter.MedianFilter(3))))
    saturation = ImageStat.Stat(image.convert("HSV").split()[1]).mean[0]
    return noise.mean[0] + (1000 if saturation < 10 else 0)


# Zenodo: keep only pothole boxes, renumber them to class 0, and use the option B split.
# Training keeps all copies of an image; testing keeps only the cleanest copy.
def prepare_zenodo(path):
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        images = {Path(n).stem: n for n in names if "/images/" in n}
        copies = defaultdict(list)
        for label in (n for n in names if "/labels/" in n and n.endswith(".txt")):
            lines = archive.read(label).decode("utf-8", "ignore").splitlines()
            boxes = ["0 " + " ".join(l.split()[1:]) for l in lines
                     if l.split() and l.split()[0] == ZENODO_POTHOLE_CLASS]
            if boxes:
                stem = Path(label).stem
                base = re.sub(r"_jpg\.rf\..*$", "", stem)
                copies[base].append((stem, "\n".join(boxes) + "\n"))

        print(f"\nZenodo: {len(copies)} unique pothole images")
        for base, versions in sorted(copies.items()):
            group = re.match(r"frame_(\d\d)", base).group(1)
            part = ZENODO_PARTS[group]
            if part != "train":
                versions = [min(versions, key=lambda v: noise_level(archive.read(images[v[0]])))]
            for stem, label_text in versions:
                # Add ".jpg", so save() removes that and not the part that makes copies unique.
                save(part, "zenodo", f"source_{group}", f"{stem}.jpg",
                     archive.read(images[stem]), label_text)


# Write the settings file that tells YOLO where the images are and what the class is called.
def write_yaml():
    (DATASET / "data.yaml").write_text(
        "path: .\n"
        "train: train/images\n"
        "val: valid/images\n"
        "test: test_bharat/images\n"
        "names:\n"
        "  0: pothole\n")


# Print the table for the report (images and boxes per dataset, per set) and save it.
def summary_table():
    print("\n===== SUMMARY =====")
    print(f"Random seed: {SEED}")
    rows = []
    for part in sorted({row[0] for row in manifest}):
        for dataset in ("bharat", "mendeley", "zenodo"):
            chosen = [r for r in manifest if r[0] == part and r[1] == dataset]
            if chosen:
                rows.append((part, dataset, len(chosen), sum(r[4] for r in chosen)))
        in_part = [r for r in manifest if r[0] == part]
        rows.append((part, "ALL", len(in_part), sum(r[4] for r in in_part)))
    rows.append(("TOTAL", "ALL", len(manifest), sum(r[4] for r in manifest)))

    print(f"{'set':<20}{'dataset':<12}{'images':>8}{'boxes':>8}")
    for part, dataset, images, boxes in rows:
        print(f"{part:<20}{dataset:<12}{images:>8}{boxes:>8}")

    with open(OUTPUT / "summary.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["set", "dataset", "images", "boxes"])
        writer.writerows(rows)


# Save the split list: which image went to which set, and the seed used.
def save_manifest():
    with open(OUTPUT / "manifest.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["set", "dataset", "group", "file", "boxes", "seed"])
        writer.writerows(row + (SEED,) for row in manifest)


# Prove the split is clean. Every number printed here must be 0.
def safety_checks():
    print("\n===== SAFETY CHECKS =====")
    # A clip, photo group or Zenodo source must be in one set only.
    parts_per_group = defaultdict(set)
    for row in manifest:
        parts_per_group[(row[1], row[2])].add(row[0])
    shared = [g for g, p in parts_per_group.items() if len(p) > 1]
    print(f"Groups found in more than one set (must be 0): {len(shared)}")

    missing = sum(not (DATASET / r[0] / "labels" / f"{r[3]}.txt").exists() for r in manifest)
    print(f"Images without a label (must be 0): {missing}")

    # The split list must match the files really on disk, or the table is wrong.
    files = sum(1 for _ in DATASET.rglob("images/*.jpg"))
    print(f"Manifest rows minus files on disk (must be 0): {len(manifest) - files}")

    bad_classes, bad_lines, bad_values = 0, 0, 0
    for label in DATASET.rglob("labels/*.txt"):
        text = label.read_text()
        lines = [l.split() for l in text.splitlines() if l.strip()]
        bad_classes += any(l[0] != "0" for l in lines)
        bad_lines += sum(len(l) != 5 for l in lines)
        bad_values += not label_is_valid(text)
    print(f"Label files with a class other than 0 (must be 0): {bad_classes}")
    print(f"Label lines that are not plain boxes (must be 0): {bad_lines}")
    print(f"Label files with values outside 0 to 1 (must be 0): {bad_values}")

    # The same picture must not sit in two sets, even under a different name.
    seen = defaultdict(set)
    for image in DATASET.rglob("images/*.jpg"):
        seen[hashlib.md5(image.read_bytes()).hexdigest()].add(image.parent.parent.name)
    print(f"Identical pictures across sets (must be 0): "
          f"{sum(len(p) > 1 for p in seen.values())}")


# Draw boxes on random images from one set and save one picture to check by eye.
def sheet(part, name, count=24, columns=6, tile=320):
    files = sorted((DATASET / part / "images").glob("*.jpg"))
    chosen = random.Random(SEED).sample(files, min(count, len(files)))
    rows = (len(chosen) + columns - 1) // columns
    page = Image.new("RGB", (columns * tile, rows * tile), "white")
    for i, file in enumerate(chosen):
        image = Image.open(file).convert("RGB")
        width, height = image.size
        draw = ImageDraw.Draw(image)
        label = DATASET / part / "labels" / f"{file.stem}.txt"
        for line in label.read_text().splitlines():
            if line.strip():
                cx, cy, w, h = map(float, line.split()[1:])
                draw.rectangle([(cx - w / 2) * width, (cy - h / 2) * height,
                                (cx + w / 2) * width, (cy + h / 2) * height],
                               outline="red", width=max(3, width // 200))
        page.paste(image.resize((tile, tile)), ((i % columns) * tile, (i // columns) * tile))
    page.save(OUTPUT / name, quality=80)


prepare_bharat()
videos = [download(url, f"mendeley_video_{i}.mp4") for i, url in enumerate(MENDELEY_VIDEOS)]
prepare_mendeley(download(MENDELEY_ZIP, "mendeley.zip"), videos)
prepare_zenodo(download(ZENODO_URL, "zenodo.zip"))
write_yaml()
summary_table()
save_manifest()
safety_checks()

sheet("test_zenodo_local", "check_zenodo_local.jpg")
sheet("test_zenodo_rural", "check_zenodo_rural.jpg")
sheet("test_bharat", "check_bharat.jpg")

print("\nZipping ...", flush=True)
shutil.make_archive(str(OUTPUT / "pothole_dataset"), "zip", DATASET)
print(f"Zip size: {(OUTPUT / 'pothole_dataset.zip').stat().st_size / 1e6:.0f} MB")
print("Done.")
