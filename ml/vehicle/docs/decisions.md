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
