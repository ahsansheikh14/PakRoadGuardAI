# Learning log

What I did, what I learned, what I asked, and what I got wrong.
Goal: explain every part of this project to my supervisor without notes.

## 2026-10-31 to 2026-11-01: Setup and data preparation

### What we did
- Set up Git, Python 3.12, a virtual environment and the Kaggle CLI.
- Ran Kaggle notebooks to inspect all three datasets, by numbers and by eye.
- Wrote `prepare_data.py` to clean and split the data, and ran it on Kaggle.

### Concepts learned
- **Model:** a file of about 2.6 million numbers (weights). Training changes the numbers; the structure stays the same.
- **Transfer learning:** starting from `yolo11n.pt`, which already knows edges and shapes from COCO, so potholes need fewer images.
- **Training loop:** the model guesses boxes, compares them with labels, gets a loss score, and adjusts its weights.
- **Epoch:** one full pass through the training images.
- **Overfitting:** memorising training pictures instead of learning the idea. `best.pt` keeps the version that did best on validation.
- **Train, validation, test:** textbook, practice tests and final exam.
- **Label (ground truth):** the correct answer drawn by a person. Needed for training and scoring, but not for using the model.
- **Frame:** one picture in a video. Phones usually record about 30 per second.
- **Data leakage:** near-identical frames in both train and test make scores look better than they are.
- **Stratified split:** splitting groups so each set gets a fair share. We split clips with and without potholes separately.
- **Seed:** a fixed number (42) that gives the same shuffle every run.
- **Perceptual hash:** a short fingerprint that is nearly the same for similar-looking pictures.
- **Kaggle version:** one saved run of a notebook, created by each `kaggle kernels push`.

- **Early stopping:** training stops by itself when the validation score stops improving, and the best weights are kept.
- **`data.yaml`:** a settings file telling YOLO the dataset folder, the train and val image folders, and the class names. Claude wrote it at my request, so I should be able to explain each line.

### My questions
- Will the model draw boxes on a new video by itself? Yes, after training.
- Where is the model, and how is it trained?
- Do I have to label every frame? No, about 1 frame per second is enough.
- Why were my commits not on GitHub? `git commit` saves locally; `git push` uploads.
- What should I show Ma'am if she has no video?
- Why does the inspection use pictures from all Zenodo classes? To find which number was pothole.
- What is a script, and do we change it for every version?
- Why did Claude change files without asking? From now on it asks first.

- Do versions mean epochs? No. Versions are us improving code; epochs are the model learning.
- What does Kaggle do during a run? It rebuilds the whole dataset from scratch.

### What I got wrong
- **Why split by clip, not frame?** I said frames are similar, but missed the reason it matters: near-identical frames in both train and test cause leakage and inflate the score.
- **What happens to a Zenodo line starting with 4?** I said it becomes class 0. It is deleted, because class 4 is vehicle fire. Only class 2 (pothole) is kept and changed to 0.
- **Versions vs epochs:** I thought our code-fix cycle was epochs. Epochs happen inside one training run.

### Problems my checks caught
- Folder counts showed 6,144 training images, not 6,512, which exposed a file-naming bug.
- An error while viewing labels revealed 371 polygon labels in BharatPotHole.
