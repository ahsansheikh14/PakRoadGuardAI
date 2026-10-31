# Step 2, piece 1: look inside the three datasets and print a report.
# This changes nothing. It runs on Kaggle, not on the laptop.
import shutil
import urllib.request
import zipfile
from collections import Counter
from pathlib import Path

ZENODO_URL = "https://zenodo.org/api/records/13832363/files/Road_Anomaly_Dataset.zip/content"
MENDELEY_URL = ("https://data.mendeley.com/public-files/datasets/tp95cdvgm8/files/"
                "6eb812d0-cf9b-46ec-bcd7-6d9fe1b8d768/file_downloaded")
TEMP = Path("/tmp/inspect")
TEMP.mkdir(exist_ok=True)


def download(url, name):
    """Save a file to the temporary folder, so it is not kept as notebook output."""
    path = TEMP / name
    print(f"Downloading {name} ...", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "PakRoadGuardAI-FYP/1.0"})
    with urllib.request.urlopen(request) as response, open(path, "wb") as file:
        shutil.copyfileobj(response, file)
    print(f"  {path.stat().st_size / 1e6:.0f} MB", flush=True)
    return path


def class_ids(lines):
    """Count the class number (first value) on each line of a YOLO label."""
    return Counter(line.split()[0] for line in lines if line.strip())


def inspect_bharat():
    print("\n===== BHARATPOTHOLE =====")
    yaml_file = next(Path("/kaggle/input").rglob("data.yaml"))
    print(yaml_file.read_text())
    clips_per_split = {}
    for split in ("train", "valid", "test"):
        images = list((yaml_file.parent / split / "images").glob("*"))
        labels = list((yaml_file.parent / split / "labels").glob("*.txt"))
        boxes, empty = Counter(), 0
        for label in labels:
            lines = label.read_text().splitlines()
            boxes += class_ids(lines)
            empty += not any(line.strip() for line in lines)
        # A name like 20250506175823_0060_frame_00015... comes from one video clip.
        clips_per_split[split] = {i.name.split("_frame_")[0] for i in images}
        print(f"{split}: {len(images)} images, {len(labels)} labels, {empty} with no boxes, "
              f"boxes per class {dict(boxes)}, {len(clips_per_split[split])} clips")
    train, valid, test = (clips_per_split[s] for s in ("train", "valid", "test"))
    print(f"Clips shared: train+test {len(train & test)}, train+valid {len(train & valid)}, "
          f"valid+test {len(valid & test)}")


def inspect_zip(path, title, folder_depth):
    print(f"\n===== {title} =====")
    with zipfile.ZipFile(path) as archive:
        names = [n for n in archive.namelist() if not n.endswith("/")]
        print(f"{len(names)} files. File types: {Counter(Path(n).suffix.lower() for n in names)}")
        folders = Counter("/".join(n.split("/")[:folder_depth]) for n in names)
        for folder, count in sorted(folders.items()):
            print(f"  {count:6d}  {folder}")
        print("Sample names:", *names[:12], sep="\n  ")

        boxes = Counter()
        for name in names:
            if name.endswith(".txt"):
                text = archive.read(name).decode("utf-8", "ignore")
                folder = "/".join(name.split("/")[:folder_depth])
                for class_id, count in class_ids(text.splitlines()).items():
                    boxes[(folder, class_id)] += count
        print("Boxes per (folder, class):")
        for key, count in sorted(boxes.items()):
            print(f"  {count:6d}  {key}")


inspect_bharat()
inspect_zip(download(MENDELEY_URL, "mendeley.zip"), "WATER-FILLED (MENDELEY)", 2)
inspect_zip(download(ZENODO_URL, "zenodo.zip"), "PAKISTAN ROAD ANOMALY (ZENODO)", 3)
print("\nDone.")
