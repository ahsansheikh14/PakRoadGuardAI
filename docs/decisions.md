# Project-wide decisions

Choices that affect the whole PakRoadGuardAI project. Model-specific decisions live in each model's own
`docs/decisions.md`, for example `ml/pothole/docs/decisions.md`.

## 1. Repository: one monorepo
| Option | Why not / why |
|---|---|
| **One repo with folders per part (chosen)** | Models, edge code, backend and frontend stay in one place with one history. Shared docs and rules (`CLAUDE.md`, `.gitignore`) apply everywhere. One link to share |
| Separate repo per part | Cleaner access control for big teams, but for one student it means several repos to keep in sync, duplicated docs, and harder cross-part changes |

Layout: `ml/pothole/`, `ml/vehicle/`, `ml/helmet_triple/` (each with `kaggle/` and `docs/`), plus `edge/`,
`backend/`, `frontend/`, `models/`, `docs/`. Files were moved with `git mv` so their history is kept.

## 2. Detector model: YOLO26n (main) vs YOLO11n (baseline)
Applies to the vehicle detector and new models. The pothole model stays YOLO11n because it is already trained.

| Option | Why not / why |
|---|---|
| **YOLO26n (main)** | Newer Ultralytics model (needs Ultralytics 8.4 or newer). Faster on CPU, which is our hard requirement: the Ultralytics docs list 38.9 ms vs 56.1 ms for YOLO11n on CPU ONNX (about 31% faster), and the release notes say up to 43%. NMS-free end-to-end output, so export and edge use need less post-processing |
| **YOLO11n (baseline)** | Trained on the same data as a fair comparison. Our pothole work already uses it |
| YOLO11s / YOLO26s | More accurate but slower on CPU; only if the nano models are not accurate enough |

The published speed-ups are Ultralytics' benchmarks. Our decision rests on our own numbers. Comparison
plan, same data and settings for both:

| Model | mAP50 | mAP50-95 | CPU FPS (ONNX) | CPU FPS (OpenVINO) |
|---|---|---|---|---|
| YOLO26n | | | | |
| YOLO11n | | | | |

Switching models is one line in `ml/vehicle/kaggle/train/train.py`: `MODEL = "yolo26n.pt"` or `"yolo11n.pt"`.
