# Measure how fast the vehicle model runs on this laptop's CPU (no GPU).
# Exports best.pt to ONNX, then times both, and saves the result to ml/vehicle/runs/cpu_speed.csv.
# Run from the repo root:  .venv\Scripts\python.exe edge\benchmark\cpu_speed.py
import csv
import platform
import shutil
import time
from pathlib import Path

import torch
from ultralytics import YOLO

BEST_PT = Path("ml/vehicle/runs/train_full/runs/vehicle_yolo26n/weights/best.pt")
ONNX_COPY = Path("models/vehicle_yolo26n.onnx")
PICTURE = "ml/vehicle/runs/vehicle_data/one_label.jpg"
RESULTS = Path("ml/vehicle/runs/cpu_speed.csv")
WARMUP, RUNS = 10, 100


# Turn best.pt into an ONNX file and keep a copy in models/.
def export_onnx():
    model = YOLO(str(BEST_PT))
    onnx_path = model.export(format="onnx", imgsz=640)
    ONNX_COPY.parent.mkdir(exist_ok=True)
    shutil.copy(onnx_path, ONNX_COPY)
    print("ONNX model:", ONNX_COPY)


# Run a model many times on one picture and return its average times in milliseconds.
def measure(model_path):
    model = YOLO(str(model_path), task="detect")
    for _ in range(WARMUP):                      # first runs are slower; don't time them
        model.predict(PICTURE, imgsz=640, device="cpu", verbose=False)

    parts = {"preprocess": 0.0, "inference": 0.0, "postprocess": 0.0}
    start = time.perf_counter()
    for _ in range(RUNS):
        result = model.predict(PICTURE, imgsz=640, device="cpu", verbose=False)[0]
        for name in parts:
            parts[name] += result.speed[name]
    total = (time.perf_counter() - start) * 1000 / RUNS   # everything, measured by the clock

    averages = {name: value / RUNS for name, value in parts.items()}
    averages["total"] = total
    averages["fps"] = 1000 / total
    return averages


export_onnx()
print(f"CPU: {platform.processor()} | threads used by PyTorch: {torch.get_num_threads()}")
print(f"Timing {RUNS} runs each (after {WARMUP} warm-up runs)\n")

rows = []
for label, path in (("PyTorch (best.pt)", BEST_PT), ("ONNX (vehicle_yolo26n.onnx)", ONNX_COPY)):
    t = measure(path)
    rows.append([label, *(round(t[k], 1) for k in ("preprocess", "inference", "postprocess", "total", "fps"))])
    print(f"{label:<28} preprocess {t['preprocess']:5.1f} ms | inference {t['inference']:6.1f} ms | "
          f"postprocess {t['postprocess']:4.1f} ms | total {t['total']:6.1f} ms | {t['fps']:5.1f} FPS")

with open(RESULTS, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["model", "preprocess_ms", "inference_ms", "postprocess_ms", "total_ms", "fps"])
    writer.writerows(rows)
print("\nSaved", RESULTS)
