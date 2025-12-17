---
sidebar_position: 6
---

# Module 6: Sim-to-Real Transfer

> "Simulation is doomed to succeed." - The Reality Gap Problem.

## 6.1 The Reality Gap

A policy trained in a perfect simulation often fails in the real world due to:
1.  **Modeling Errors**: Friction, damping, and motor dynamics are hard to model perfectly.
2.  **Sensor Noise**: Real IMUs and encoders are noisy.
3.  **Latency**: Communication delays in real hardware.

## 6.2 Domain Randomization

The most powerful technique to cross the gap. If the simulation is varied enough, the real world becomes just "another variation" of the training data.

### What we randomize:
*   **Friction**: varying $\mu$ on the floor.
*   **Mass**: Randomizing the robot's link masses ($\pm 10\%$).
*   **Motor Strength**: Randomizing $K_p$ and $K_d$ gains.
*   **Push Disturbances**: Randomly pushing the robot during training.

## 6.3 System Identification (SysID)

Alternatively, we can try to measure the real world parameters precisely and match the simulation to them. This involves:
*   Measuring motor torque curves.
*   Weighing individual links.
*   Using motion capture to verify kinematics.

## 6.4 Deployment Pipeline

1.  **Export ONNX**: Convert the PyTorch policy to ONNX format.
2.  **Inference Engine**: Run the ONNX model on the robot's onboard computer (Jetson Orin).
3.  **Safety Layer**: A low-level controller that prevents self-collision or dangerous torques, creating a "sandbox" for the AI policy.
