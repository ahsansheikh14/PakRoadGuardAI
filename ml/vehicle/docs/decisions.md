# Decision log: vehicle detector

Why we chose each thing, what else we could have used, and why we didn't. Update this after every step.

## 1. Dataset
Roboflow Universe "Classification of Vehicles" (workspace `labelme-to-darknet-yolo`, project
`classification-of-vehicles`), version 9, CC BY 4.0. 7 classes: Bike, Bus, Car, Hiace, Rickshaw, Tractor, Truck.
Hiace and Rickshaw match Pakistani roads. Version 9 has 9,862 image files (the project page lists 9,559).
It mixes catalogue photos of single vehicles with real traffic-camera views, day and night.

## 2. Check the data before training
The `vehicle-data` notebook downloaded version 9 on Kaggle and counted it (results in `ml/vehicle/runs/vehicle_data/`).

| Finding | Problem |
|---|---|
| Valid had only 14 Bike and 19 Car boxes | Validation picks `best.pt` and early stopping, so it could not judge bikes, our most important class |
| Splits were uneven (test had 1,068 Rickshaws, valid 112) | Scores per class would be unreliable |
| `data.yaml` used `../train/images` | YOLO would look in the wrong folder |

Roboflow API key: pushed runs (`kaggle kernels push`) could not read the secret (HTTP 400). Runs that need it are
started from the browser with Save & Run All.

## 3. Re-split the data
The `vehicle-prepare` notebook made a new split (results in `ml/vehicle/runs/vehicle_prepare/`).

| Option | Why not / why |
|---|---|
| **Group copies, then stratified split by rarest class (chosen)** | Copies of a picture stay together, so nothing leaks, and every class gets about 15% in validation |
| Move some bike pictures from train to valid | Quick, but copies could stay behind in train and leak |
| Keep Roboflow's split and judge bikes on test | Test must stay untouched until the end |

What we found: 9,862 files are only 8,701 unique pictures, and 360 pictures had copies in more than one of
Roboflow's original splits. Those would have made test scores look better than they really are.

Method: copies grouped by base name (removing `.rf.<code>`) plus identical files; each group goes into the
bucket of its rarest class; each bucket is shuffled with seed 42 and cut 75/15/10.

| Class | Train | Valid | Test | Valid share |
|---|---|---|---|---|
| Bike | 2,077 | 463 | 271 | 16.5% |
| Bus | 1,823 | 369 | 250 | 15.1% |
| Car | 5,139 | 1,068 | 685 | 15.5% |
| Hiace | 1,490 | 300 | 201 | 15.1% |
| Rickshaw | 1,923 | 358 | 225 | 14.3% |
| Tractor | 1,542 | 299 | 198 | 14.7% |
| Truck | 2,147 | 467 | 319 | 15.9% |
| **Images** | **7,419** | **1,473** | **970** | 14.9% |

All safety checks were 0 (no group in two splits, no missing labels, no lost files, no identical pictures across
splits, no bad label values). Output: `vehicle_dataset.zip` (574 MB) with a `data.yaml` that uses relative paths.
It stays on Kaggle.

## 4. Model
YOLO26n only; see `docs/decisions.md`, section 2.

## 5. Polygon labels
The 2-epoch test showed YOLO ignored 2 training images whose labels mixed polygons and boxes, and dropped 7 polygon
outlines. `vehicle-prepare` now turns each polygon into the smallest box around it (9 lines converted) and checks that
every label line is a plain box.

| Option | Why not / why |
|---|---|
| **Fix in vehicle-prepare (chosen)** | The dataset zip itself is clean, so every later run uses the same labels |
| Fix in train.py at unzip time | No browser step, but the zip would stay imperfect |

## 6. Training result (validation)
`vehicle-train` version 2: YOLO26n, 640 px, batch 16, up to 100 epochs, patience 20. Early stopping ended it at
epoch 93; the best was epoch 73. It took 2.2 hours on a Tesla T4. 0 corrupt images.

| Class | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|
| **All** | 0.882 | 0.851 | 0.918 | 0.696 |
| Bike | 0.864 | 0.758 | 0.861 | 0.512 |
| Bus | 0.917 | 0.862 | 0.922 | 0.733 |
| Car | 0.858 | 0.846 | 0.920 | 0.678 |
| Hiace | 0.901 | 0.885 | 0.926 | 0.822 |
| Rickshaw | 0.861 | 0.885 | 0.942 | 0.726 |
| Tractor | 0.928 | 0.876 | 0.926 | 0.672 |
| Truck | 0.848 | 0.846 | 0.926 | 0.727 |

Validation loss flattened from about epoch 60 without rising, so there was no clear overfitting. The confusion matrix
shows few mix-ups between classes (largest: some buses called trucks); most mistakes are extra boxes on background,
mainly Car and Bike. Bike is the weakest class: it misses about 1 in 4 bikes and its boxes are the least tight.
These are validation scores; the report uses the test set (section 7).

## 7. Test result (official, run once)
`vehicle-test` version 1 scored `best.pt` once on the 970 test images (2,149 boxes) that were never used for training
or for choosing the model. 0 corrupt images.

| Class | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|
| **All** | 0.867 | 0.844 | 0.909 | 0.696 |
| Bike | 0.825 | 0.783 | 0.857 | 0.510 |
| Bus | 0.937 | 0.848 | 0.928 | 0.751 |
| Car | 0.857 | 0.861 | 0.930 | 0.691 |
| Hiace | 0.917 | 0.866 | 0.932 | 0.836 |
| Rickshaw | 0.806 | 0.871 | 0.913 | 0.711 |
| Tractor | 0.893 | 0.884 | 0.921 | 0.693 |
| Truck | 0.831 | 0.796 | 0.880 | 0.682 |

Test scores are close to validation (mAP50 0.909 vs 0.918; mAP50-95 0.696 vs 0.696), so the model generalises and the
leak-free split worked. Bike remains the weakest class. Speed in this log (4.4 ms) is Kaggle GPU, not CPU.

## 8. CPU speed on the laptop
`edge/benchmark/cpu_speed.py` exported `best.pt` to ONNX (`models/vehicle_yolo26n.onnx`, 9.4 MB, not on GitHub)
and timed 100 runs on one picture after 10 warm-up runs, on an Intel Core i5-8365U (4 cores, no GPU).

| Format | Preprocess | Inference | Postprocess | Total | FPS |
|---|---|---|---|---|---|
| PyTorch `best.pt` | 6.2 ms | 180.2 ms | 2.5 ms | 196.4 ms | 5.1 |
| **ONNX (chosen)** | 10.0 ms | 108.0 ms | 3.0 ms | 130.0 ms | **7.7** |

| Option | Why not / why |
|---|---|
| **ONNX Runtime (chosen for now)** | About 1.5x faster than PyTorch on our CPU, small, runs anywhere |
| PyTorch `.pt` | Slowest, and needs the large PyTorch library on the device |
| OpenVINO | Built for Intel CPUs, likely faster still; to be measured next |

At 7.7 FPS the model can check about every 4th frame of a 30 FPS video. Ultralytics' published 38.9 ms is on a faster
server CPU, so our laptop is slower, as expected.
