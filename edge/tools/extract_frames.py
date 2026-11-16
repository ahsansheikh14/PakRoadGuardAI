# Save frames from chosen time ranges of a video, so they can be looked at and labelled.
# Run from the repo root, for example:
#   .venv\Scripts\python.exe edge\tools\extract_frames.py data\videos\clip.mp4 ^
#       missing_block=4:20-4:25 greenbelt_clear=6:40-6:50 --per-second 5
# Frames go to data/frames/<video name>/<range name>_<mm-ss.ff>.jpg (data/ is not on GitHub).
import argparse
from pathlib import Path

import cv2


# Turn "4:20" or "260" into seconds.
def to_seconds(text):
    if ":" in text:
        minutes, seconds = text.split(":")
        return int(minutes) * 60 + float(seconds)
    return float(text)


# Turn "name=4:20-4:25" into ("name", 260.0, 265.0).
def parse_range(text):
    name, times = text.split("=")
    start, end = times.split("-")
    return name, to_seconds(start), to_seconds(end)


# Save frames between start and end seconds, about per_second frames for each second of video.
def extract(video, name, start, end, per_second, out_dir):
    fps = video.get(cv2.CAP_PROP_FPS)
    step = max(1, round(fps / per_second))           # keep every step-th frame
    first, last = int(start * fps), int(end * fps)
    video.set(cv2.CAP_PROP_POS_FRAMES, first)
    saved = 0
    for frame_number in range(first, last + 1):
        found, frame = video.read()
        if not found:
            break
        if (frame_number - first) % step == 0:
            seconds = frame_number / fps
            stamp = f"{int(seconds // 60):02d}-{seconds % 60:05.2f}"
            cv2.imwrite(str(out_dir / f"{name}_{stamp}.jpg"), frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            saved += 1
    print(f"{name:<20} {start:7.1f}s to {end:7.1f}s  ->  {saved} frames")


parser = argparse.ArgumentParser(description="Save frames from time ranges of a video.")
parser.add_argument("video", type=Path)
parser.add_argument("ranges", nargs="+", help='name=start-end, e.g. greenbelt_clear=6:40-6:50')
parser.add_argument("--per-second", type=float, default=1, help="frames to keep per second of video")
args = parser.parse_args()

out_dir = Path("data/frames") / args.video.stem
out_dir.mkdir(parents=True, exist_ok=True)
video = cv2.VideoCapture(str(args.video))
if not video.isOpened():
    raise SystemExit(f"Could not open {args.video}")

for text in args.ranges:
    extract(video, *parse_range(text), args.per_second, out_dir)
print("Saved to", out_dir)
