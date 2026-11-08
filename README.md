# PakRoadGuardAI

Road-safety FYP: detect potholes and risky bike crossings on IJP Road and Murree Road, and raise alerts on CPU-only edge devices.

| Folder | What it is for |
|---|---|
| `ml/pothole/` | Pothole detection model: Kaggle notebooks, docs, results |
| `ml/helmet_triple/` | Second model (not started) |
| `edge/` | Runs models on video, applies rules, raises alerts (later) |
| `backend/` | FastAPI server (later) |
| `frontend/` | React dashboard (later) |
| `models/` | Exported `.onnx` models |
| `docs/` | Project-wide notes and decisions |
| `data/` | Local videos and pictures (not on GitHub) |

Training runs on Kaggle. From the repo root: `kaggle kernels push -p ml/pothole/kaggle/<notebook>`
