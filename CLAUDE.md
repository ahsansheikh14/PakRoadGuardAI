# PakRoadGuardAI ML: notes for Claude Code

## Who I am
Ahsan, final-year BS Software Engineering (Bahria University Islamabad). Beginner in ML/computer vision,
comfortable with MERN, Git and terminals.

## How to work with me (follow this for EVERY step)
1. BEFORE doing anything, explain in simple language:
   - WHAT we are going to do in this step,
   - WHY we need it (link it to the project and to Ma'am's requirements),
   - the OTHER OPTIONS we could use, and why you recommend one of them.
2. WAIT for me to say "go ahead" before writing code or running commands.
3. Do the step in small pieces, explaining new terms as they appear.
4. AFTER the step: summarise what was done and what the output means, then add an entry to
   docs/decisions.md (what we chose, alternatives, why not them).
My guide will ask "why this, why not that" about every choice, so I must understand each one.

## Project
FYP "PakRoadGuardAI". Research direction from my guide (Ma'am Nida):
- On IJP Road / Murree Road (Rawalpindi) U-turns are closed, so bikers cut through the green belt.
  Repeated crossings form potholes / muddy, water-filled patches; bikers then appear suddenly in front of fast
  traffic or ride the wrong way.
- Model 1 (this weekend): POTHOLE DETECTION + ALERTS (bounding boxes, timestamps, one alert per pothole).
- Model 2 (next): MOTORCYCLE DETECTION + TRACKING for green-belt crossing and wrong-way riding.
- Two separate models (bike datasets have no pothole labels and vice versa).

## Hard requirements
- Models must run on EDGE devices WITHOUT a GPU (laptop CPU, Raspberry Pi).
- Training happens on Kaggle's free GPU via the Kaggle CLI (kaggle kernels push / status / output).
  Testing, CPU speed and the alert demo run locally on my laptop.
- Report: precision, recall, mAP50, mAP50-95 on test data, and CPU FPS (ONNX / OpenVINO).
- Export edge formats: ONNX (main), OpenVINO, NCNN, optionally TFLite.

## Pothole model plan
- Model: YOLO11n (Ultralytics), imgsz 640, transfer learning from COCO weights.
- Train: BharatPotHole (Kaggle: surbhisaswatimohanty/bharatpothole) + water-filled potholes
  (Mendeley tp95cdvgm8, CC BY 4.0) + ~60% of Pakistan Road Anomaly dataset (Zenodo 13832363), pothole class only,
  remapped to class 0 "pothole".
- Test: test splits of the training sets + held-out ~40% of Pakistan Road Anomaly (split by scene/source,
  not random frames, to avoid leakage).
- Not used today (see docs/decisions.md): Bangladesh Road Damage (labels cracks as potholes),
  RDD2022 (too large), IIT Goa mega dataset srajanchourasia/pothole-dataset (no boxes; later for severity S/A/B/C
  and background images), Roboflow 665 (backup only).

## Alerts (local, after training)
- Track potholes across frames; alert only if seen in >= 5 of last 8 frames above a confidence threshold;
  cooldown to avoid duplicates.
- Each alert: id, first/last seen (video time + wall clock), frame number, max confidence, box, snapshot with box.
- Outputs: annotated video with timestamp overlay, detections.csv, alerts.json, snapshots/.

## Demo frontend (for Ma'am and sir)
A small local web app, running on my laptop CPU with the exported ONNX/OpenVINO model:
- Upload a PHOTO or a VIDEO -> see detections with bounding boxes and confidence.
- For videos: timestamp on every detection, the alert list (one alert per pothole, with snapshots),
  and a processed video to play in the browser, plus downloadable detections.csv / alerts.json.
- A BENCHMARKS page: test precision, recall, mAP50, mAP50-95 (training test split AND held-out Pakistani set),
  YOLO11n vs YOLOv8n comparison, PR curve and confusion matrix from training, and CPU speed (ms per image, FPS)
  measured live on the current machine.
- Proposed tool: Streamlit (fast to build in Python, good for upload + metrics pages). Alternatives to explain
  before building: Gradio (fastest upload demo, less flexible dashboard), React + FastAPI (my MERN skills and
  matches the final FYP system, but takes much longer). Final React dashboard comes later in the FYP.
- Gotcha: browsers can't play OpenCV's default mp4v video; encode the processed video as H.264 before showing it.

## Rules
- Never commit data/, runs/, model weights, videos, or kaggle.json / any secret.
- After every step, add an entry to docs/decisions.md: what we chose, alternatives, why not them.
- Keep scripts small and readable; I must be able to explain every line to my supervisor.
