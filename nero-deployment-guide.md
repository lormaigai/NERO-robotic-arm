# Deployment guide

The full step-by-step setup for the NERO deployment kit, written for anyone running it for the first time. Use exactly these files and versions - other versions of the code do not work.

## What is in the kit

- `setup_can.sh` - starts the CAN network so the computer can talk to the arm's motors.
- `patched_robot_wrapper.py` - a fixed version of one LeRobot system file. It removes the safety locks that block autonomous runs and repairs a bug that sent gripper commands to the wrist joint.
- `quality_scorer.py` - optional. Scores every demonstration in a dataset and picks the best ones to train on.
- `run_rollout.sh` - runs the trained AI policy on the arm.
- `README.md` - a short overview of the same steps.

## Before you start

Check the computer is physically connected to:
1. The AgileX Nero CAN interface (USB).
2. The overhead Intel RealSense D435 camera.
3. The wrist Intel RealSense D405 camera.

The scripts also assume these already exist on the computer (they do on the lab machine):
- `~/lerobot` - the LeRobot install
- `~/Desktop/RDP2026Nov` - the project folder, including the trained model at `outputs/train/act_nero_conveyor_sort_curated/checkpoints/last/pretrained_model`
- `~/miniforge3` - conda, with an environment named `nero-RDP2026Nov`

## Step 1: Start the hardware network

Run:
```
bash setup_can.sh
```

What it does: runs `sudo ip link set can0 up type can bitrate 1000000`, which brings the CAN interface online at 1 Mbit/s so the computer can reach the motors.

What to expect: you will be asked for the `sudo` password. On success you see "SUCCESS: CAN network is UP!".

If it fails: the script automatically retries on `can1` (you will see "ERROR: Failed to start can0. The USB adapter might be mapped to can1." followed by "Attempting to start can1 instead..."). Be careful here: the rollout script in Step 4 is fixed to `can0`, so if the adapter came up on `can1` the arm will not be found later. Unplug and replug the USB CAN adapter, run `bash setup_can.sh` again, and continue only when you get the SUCCESS message for `can0`. If it still fails, check the USB connection and that no other program is holding the interface.

## Step 2: Apply the software patch

Run:
```
cp patched_robot_wrapper.py ~/lerobot/src/lerobot/rollout/robot_wrapper.py
```

What it does: replaces LeRobot's robot wrapper with the patched copy from the kit. The original file has safety locks engaged and a bug that maps the gripper to the wrist joint, so the arm cannot run autonomously without this patch.

What the patch changes, in plain terms:
- Disables the hardware safety locks and observation-only mode.
- Routes gripper commands to the real gripper channel instead of wrist joint 7, and holds the wrist straight.
- Smooths the arm's motion (an EMA filter, alpha 0.2) so movements are not jerky.
- Nudges joints 2 and 3 slightly so the arm reaches deep enough.
- Adds a 15-frame latch: the gripper only closes after a steady grasp signal, and reopens when the policy clearly signals a drop.

What to expect: no output means the copy worked. You can confirm by checking the file's modified time: `ls -l ~/lerobot/src/lerobot/rollout/robot_wrapper.py`.

Note: if LeRobot is ever reinstalled or updated, the original file comes back - re-run this step.

## Step 3 (optional, recommended): Clean the dataset

Run this before retraining or evaluating, to filter out bad demonstrations (jittery teleoperation, missed grasps):
```
conda activate nero-RDP2026Nov
python3 quality_scorer.py --dataset ~/Desktop/RDP2026Nov/datasets/nero_conveyor_sort --budget-percent 75.0
```

What it does: loads the dataset, scores every episode on four measures - path directness, movement smoothness (jerk), grasp decisiveness, and how closely the arm followed its commands - then combines them into one quality score out of 100. `--budget-percent 75.0` means it keeps the top 75% of episodes.

What to expect: three progress lines ([1/3] loading data, [2/3] analyzing episodes, [3/3] report saved), then a ranking table with each episode's score and tier (A = top 25%, B = solid, C = prune candidate). At the end it prints a curated episode list to paste into training as `--dataset.episodes="[...]"`.

Files it creates inside the dataset folder:
- `episode_quality_report.csv` - the full per-episode scores
- `curated_coreset.json` - the kept and pruned episode lists

If it fails:
- "MISSING DEPENDENCIES" - you skipped `conda activate nero-RDP2026Nov`. The script needs pandas and pyarrow from that environment.
- "No meta/info.json found" or "No data parquet files found" - the `--dataset` path is wrong; point it at the dataset folder itself.

## Step 4: Run the AI policy

Safety first: clear the physical workspace, place the target object on the conveyor, and keep one hand on the physical Emergency Stop button.

Run:
```
bash run_rollout.sh
```

What it does, in order: moves into `~/Desktop/RDP2026Nov`, activates the `nero-RDP2026Nov` conda environment, loads the trained ACT model from its checkpoint folder, connects to the arm over `can0` (firmware v120) at 5% speed - deliberately slow - using joint-position control, opens both RealSense cameras (front serial 261322076493, wrist serial 260422274592, 640x480 at 30 fps), and runs the task "Pick up object and place it in the target zone" for 30 seconds with live data display on.

What to expect: "Initializing Neural Network Rollout..." prints, then the arm starts moving slowly. It stops by itself after 30 seconds. To stop at any time, press `Esc` on the keyboard - or hit the physical E-stop.

If it fails:
- CAN / can0 errors - go back to Step 1; if the adapter had fallen back to `can1`, replug it so it comes up as `can0`.
- Camera errors - check both RealSense cables; the camera serial numbers are fixed in the script, so the exact lab cameras must be connected.
- "conda" or environment errors - check that `~/miniforge3` exists and the environment is named `nero-RDP2026Nov`.
- Missing model / checkpoint errors - the trained model must be at `outputs/train/act_nero_conveyor_sort_curated/checkpoints/last/pretrained_model` inside `~/Desktop/RDP2026Nov`.
