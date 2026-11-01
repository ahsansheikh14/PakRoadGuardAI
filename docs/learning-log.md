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

- **`.pt` file:** a saved PyTorch model. `yolo11n.pt` is the COCO starting point; `best.pt` is our trained result.
- **`save_period`:** how often weights are saved. We use 1, meaning every epoch.
- **Learning rate:** how big each weight adjustment is. It shrinks as training goes on.
- **Losses:** `box_loss`, `cls_loss` and `dfl_loss` measure mistakes; lower is better.
- **The train lines:** Claude wrote `YOLO(...)` and `model.train(...)` at my request, so I should be able to explain every setting.

- **Batch step:** forward pass, loss, backpropagation, then the optimizer updates the weights. About 407 steps per epoch.
- **IoU:** how much the model's box overlaps the human box, from 0 (none) to 1 (exact).
- **NMS:** removes duplicate boxes on one pothole and keeps the most confident one.
- **mAP50 and mAP50-95:** an overall score. mAP50 needs IoU of at least 0.5; mAP50-95 averages stricter thresholds.
- **Mosaic:** training pictures stitched from 4 images, so the model sees more variety.

### My questions
- What does Kaggle do in each epoch, and what in `train.py` starts it?
- What does `.pt` mean, and what changes in each epoch?
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

- **Why can't `data.yaml` be its own file?** I said it is a direction to YOLO, which is true but not the reason. `kaggle kernels push` sends only one script, so the script must create the file during the run.
- **Reusing a model:** a new `data.yaml` alone does not teach a new object. Detecting bikes needs new training on bike images, which gives a new `best.pt`.

### What I got right
- YOLO finds labels by replacing `images` with `labels` in the path, so `data.yaml` needs no labels line.
- Training loss falling while validation stops improving suggests overfitting: the model is memorising.
- We make decisions on validation so the test sets stay new and unseen until the end.
- We train for 2 epochs first to check everything works before spending GPU hours on 100.
- Falling `box_loss` is a good sign, but a 2-epoch score is too early for the report. Extra point to remember: those scores also come from validation images, and report scores must come from the test sets.

### To review (I was unsure)
- **Why size is not the only problem:** at the same medium size, the model found 57% on Mendeley but 9% on BharatPotHole, so something besides size must differ.
- **Why one clip can mislead a score:** if one clip holds most boxes, the score mostly describes that one road. We checked: that clip found 6% and the others 5%, so it was not distorting the result.

### Problems my checks caught
- Folder counts showed 6,144 training images, not 6,512, which exposed a file-naming bug.
- An error while viewing labels revealed 371 polygon labels in BharatPotHole.
