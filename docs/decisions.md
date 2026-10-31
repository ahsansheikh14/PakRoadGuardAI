# Decision log: pothole detection model

Why we chose each thing, what else we could have used, and why we didn't.
Update this after every step.

## 1. Where to train: Kaggle (free GPU) via CLI
| Option | Why not / why |
|---|---|
| **Kaggle notebooks via Kaggle CLI (chosen)** | Free GPU (about 30 h/week), BharatPotHole already hosted there, runs can be launched from my terminal so Claude Code can help |
| Google Colab | Also free, but sessions disconnect, usage limits are less predictable, and it is harder to drive from the terminal |
| Training on my laptop CPU | Many hours for one run; impractical |
| Paid cloud GPU | Costs money; not needed for a nano model |

Note: "works without GPU" means RUNNING the model (inference). Training on a GPU is normal practice.

## 2. Model: YOLO11n
| Option | Why not / why |
|---|---|
| **YOLO11n (chosen)** | 2.6M parameters; about 56 ms per image on CPU with ONNX and 39.5 mAP on COCO, better than YOLOv8n on both (Ultralytics benchmark). Exports to ONNX, OpenVINO, NCNN, TFLite |
| YOLOv8n | Older; 80 ms on CPU, 37.3 mAP. Trained as a comparison only |
| YOLO11s | More accurate (47.0 mAP) but about 1.6x slower on CPU (90 ms); option if accuracy is too low |
| SSD-MobileNet / EfficientDet-Lite | Edge-friendly but older and usually less accurate; weaker training tooling |
| Faster R-CNN, RT-DETR | Accurate but heavy; need a GPU for real-time use, which breaks the edge requirement |

## 3. Training datasets
| Dataset | Decision | Why |
|---|---|---|
| **BharatPotHole** (7,000+ Indian dashcam frames) | Used | Muddy, wet potholes on unpaved roads and in monsoon (like green-belt crossings); dashcam view matches our bike-dashcam plan; includes "not a pothole" frames (cracks, shadows, manholes) that reduce false alerts; YOLO format |
| **Water-filled potholes, UK** (713 images, CC BY 4.0) | Used | Mostly water-filled potholes, adds the puddle look |
| **Pakistan Road Anomaly** (Zenodo, CC BY 4.0) | ~60% train, ~40% test | Only Pakistani pothole data found; mobile + surveillance cameras |
| Bangladesh Road Damage (Mendeley) | Not used | Labels cracks and broken surface as "pothole"; contradicts BharatPotHole and would increase false alerts |
| RDD2022 (47,000 images, 6 countries incl. India) | Not now | Too big to prepare in a weekend; 4 damage classes need remapping |
| IIT Goa mega dataset (30,000 images, CC0) | Not for detector | No bounding boxes, only image-level labels. Later: severity classifier (S/A/B/C) and background images |
| Roboflow Pothole (665 images) | Backup only | Small, mostly clean dry roads |
| CCTV pothole set on Roboflow (FAIND) | Not used | Boxes mostly on cracks/worn asphalt, loose boxes, unclear classes |

## 4. Testing approach
- Test splits of training datasets = accuracy on similar images.
- Held-out Pakistan Road Anomaly images = honest score on unseen Pakistani roads.
- Split by scene/source, not random frames: neighbouring video frames in both train and test inflate scores.

## 5. Edge formats
| Format | Use |
|---|---|
| ONNX | Any CPU (main) |
| OpenVINO | Fastest on Intel laptop CPUs |
| NCNN | Raspberry Pi / ARM / Android |
| TFLite (optional, INT8) | Phones, very small devices |

## 6. Alert design (to be filled after implementation)

## 7. Demo frontend (proposed, confirm before building)
| Option | Why not / why |
|---|---|
| **Streamlit (proposed)** | Pure Python, quick to build; handles photo/video upload and metrics tables/charts on separate pages; runs locally on CPU |
| Gradio | Fastest for a single "upload and see result" demo, but less flexible for a benchmarks dashboard |
| React + FastAPI | Uses my MERN skills and matches the final FYP system, but takes days; planned for the full system later |

## 8. Project setup
| Choice | Option | Why not / why |
|---|---|---|
| Python | **3.12 in a project `.venv` (chosen)** | Mature version, safer for ML libraries such as ONNX Runtime and OpenVINO; the virtual environment keeps project packages separate |
| | Python 3.14 (already installed) | Very new; ML libraries often take time to support new versions (not tested on 3.14) |
| | Conda | Works, but is a heavy extra tool we don't need |
| Project location | **Stay on the Desktop, one folder (chosen)** | Everything stays in one place; I chose this. The Desktop is inside OneDrive, so pause OneDrive while installing packages |
| | Move out of OneDrive | Avoids sync problems, but changes where the project lives |
| | Keep `.venv` and data in a second folder | Avoids sync problems, but splits the project across two places |
| Packages | **Install only what each step needs (chosen)** | Training runs on Kaggle, so the laptop stays light |
| | Install everything now | Slower, and adds packages we may not need locally |

Note: Kaggle's new `KGAT_...` token is a plain string, so it is saved as `~/.kaggle/access_token`, not `kaggle.json`. It is a secret and must never be committed.
Note: `.venv` stops working if the folder is moved; recreate it if that happens.

## 9. Data inspection findings (Step 2)
We inspected the data on Kaggle before cleaning it, using file counts and sample images with their boxes drawn on.

| Option | Why not / why |
|---|---|
| **Inspect first, then clean (chosen)** | Found problems that counts alone or the dataset descriptions would not have shown |
| Write the cleaning code straight away | Faster, but would have relied on guesses about classes and scenes |

| Dataset | What we found | What it means |
|---|---|---|
| BharatPotHole | 7,074 images, 12,221 boxes, one class. 89 of 93 test clips also appear in train | Its ready-made split leaks, so re-split by clip. Many potholes are tiny in the frame |
| Mendeley | 713 images, 1,157 boxes, class 0. About 100 near-identical pairs. No ready-made split | Keep near-identical photos in the same part. Close-ups, unlike dashcam footage |
| Zenodo | Only 484 unique pothole images. Pothole = class 2 (no class-name file; confirmed by eye). 0 accident, 1 fighting, 3 snatching, 4 fire | Much smaller than expected |
| Zenodo copies | Most training images exist as 3 edited copies with noise or black-and-white effects | Keep copies together; they are not fair test images |
| Zenodo sources | File names form about 4 sources (44, 55, 66, 77), roughly matching its 6 pothole videos. Only 44 and 55 looked like local street scenes in our sample sheet; 66 and 77 looked European, including what appears to be a vehicle test track | "Held-out Pakistani set" may not be accurate. Decision pending |
