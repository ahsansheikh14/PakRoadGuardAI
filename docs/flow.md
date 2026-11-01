# Project flow: how everything connects

A plain guide to what each file does and how the work moves from raw data to the demo.
Update this whenever a step adds or changes a file.

Status: **done** = exists and worked, **now** = in progress, **planned** = not built yet.

## The big picture

```text
LAPTOP (write code, give orders)          KAGGLE (do the heavy work)
--------------------------------          --------------------------
1. Write script + settings
2. kaggle kernels push  ----------------> 3. Start a temporary computer
                                          4. Attach data, run the script
                                          5. Save output, shut down
6. kaggle kernels output <--------------- (log, cleaned data, trained model)
7. Test on CPU, run alerts and the demo
```

Training needs a GPU, so it happens on Kaggle. Using the model does not, so testing happens on the laptop.
This matches the requirement to run on edge devices without a GPU.

## The pipeline

| # | Stage | Where | Goes in | Comes out | Status |
|---|---|---|---|---|---|
| 1 | Set up the project | Laptop | Nothing | Git, `.venv`, Kaggle access | done |
| 2 | Inspect the datasets | Kaggle | 3 raw datasets | Reports and sample sheets (classes, overlap, label quality) | done |
| 3 | Prepare the data | Kaggle | 3 raw datasets | `pothole_dataset.zip` (8,639 images), `manifest.csv`, `summary.csv` | done |
| 4 | Train | Kaggle GPU | Prepared data + COCO weights | `best.pt`, curves, PR curve, confusion matrix | now (first run scored low; being diagnosed) |
| 5 | Compare | Kaggle GPU | Same data | YOLO11n vs YOLOv8n scores | planned |
| 6 | Test | Kaggle or laptop | `best.pt` + test sets | Precision, recall, mAP50, mAP50-95 | planned |
| 7 | Export | Kaggle or laptop | `best.pt` | ONNX, OpenVINO, NCNN files | planned |
| 8 | Measure speed | Laptop CPU | ONNX, OpenVINO | ms per image, FPS | planned |
| 9 | Build alerts | Laptop CPU | Video + model | Annotated video, `detections.csv`, `alerts.json`, snapshots | planned |
| 10 | Score Ma'am's video | Laptop | Her video + our boxes | A separate score for her video | planned |
| 11 | Build the demo | Laptop CPU | Model + results | Local web app with upload and benchmarks pages | planned |

## What each file and folder is for

| Path | What it does | Why we need it | On GitHub? | Status |
|---|---|---|---|---|
| `CLAUDE.md` | Project rules and plan | So Claude follows Ma'am's requirements | Yes | done |
| `.gitignore` | Tells Git what to skip | Keeps data, weights and secrets out of GitHub | Yes | done |
| `docs/decisions.md` | What we chose and why | Answers "why this, why not that" | Yes | done |
| `docs/flow.md` | This file | Shows how everything connects | Yes | done |
| `kaggle/inspect_data/inspect_data.py` | Reads the datasets and prints a report | Shows the facts before we clean anything | Yes | done |
| `kaggle/inspect_data/kernel-metadata.json` | Settings for that notebook | Tells Kaggle the GPU, internet, privacy and dataset settings | Yes | done |
| `kaggle/inspect_samples/inspect_samples.py` | Draws boxes on samples, finds near-duplicates, lists Zenodo images | Lets us check labels by eye and plan the split | Yes | done |
| `kaggle/inspect_samples/kernel-metadata.json` | Settings for that notebook | Same purpose as above | Yes | done |
| `kaggle/prepare_data/prepare_data.py` | Cleans, splits and combines the three datasets | Produces the training and test sets | Yes | done |
| `kaggle/prepare_data/kernel-metadata.json` | Settings for that notebook | GPU off, internet on, BharatPotHole attached | Yes | done |
| `docs/learning-log.md` | What I learned, asked and got wrong | Helps me explain the project without notes | Yes | done |
| `kaggle/train/train.py` | Installs YOLO, unzips the data, writes `data.yaml`, trains | Produces `best.pt` | Yes | done |
| `kaggle/train/kernel-metadata.json` | Settings for that notebook | GPU on, internet on, dataset attached | Yes | done |
| `kaggle/diagnose/diagnose.py` | Scores `best.pt` by dataset and pothole size | Shows why the score is low, using validation only | Yes | done |
| `kaggle/diagnose/kernel-metadata.json` | Settings for that notebook | GPU on, dataset and `best.pt` attached | Yes | done |
| `scripts/` | Laptop scripts: testing, speed, alerts | Work that runs on the CPU | Yes | planned |
| `.venv/` | The project's private Python | Keeps packages separate from Python 3.14 | No | done |
| `data/` | Local test videos and pictures | Inputs for testing on the laptop | No | done (empty) |
| `runs/` | Logs and results from Kaggle | Keeps outputs out of the code | No | done |

Note: the `data.yaml` inside `pothole_dataset.zip` is a placeholder. The real one is made in the training step.

`~/.kaggle/access_token` is outside the project on purpose. It is a password and must never be committed.

## How a video becomes alerts

```text
Video -> one frame -> model draws boxes -> tracker links boxes across frames
      -> pothole seen in 5 of the last 8 frames? -> one alert with time and snapshot
```

The model only ever sees one picture at a time. The tracker and alert rule turn single-frame results into events.

## Scoring Ma'am's video (required)

Boxes from the model are its answers. To mark them, we need correct answers made by a person.

1. Take frames from the video, for example 1 per second, since neighbouring frames are nearly identical.
2. Draw a box on every pothole in those frames, in a labelling tool.
3. Export the boxes in YOLO format.
4. Run the model on those frames and compare its boxes with ours.
5. Report this as a third score, separate from the other two test sets.

Rule: frames used for scoring are never used for training. Otherwise the model has seen the exam.
