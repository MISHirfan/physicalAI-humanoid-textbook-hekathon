---
sidebar_position: 7
---

# Module 7: Humanoid Locomotion

> "Bipedal walking is a controlled fall."

## 7.1 The Inverted Pendulum Model

The simplest approximation of a walking human. The Center of Mass (CoM) vaults over the stance leg.
*   **LIPM (Linear Inverted Pendulum Mode)**: Keeps the CoM height constant to simplify equations.

## 7.2 Zero Moment Point (ZMP)

The verification criterion for stability. The ZMP is the point on the ground where the tipping moment is zero. If the ZMP stays within the **Support Polygon** (the area covered by the feet), the robot won't fall.

## 7.3 Model Predictive Control (MPC)

Modern robots (like Digit or Unitree H1) use MPC to plan footsteps.
*   **Lookahead**: Planning 0.5s into the future.
*   **Optimization**: Solving for the best foot placements to keep the ZMP stable.

## 7.4 Whole-Body Control (WBC)

While MPC handles the "high level" plan (where to step), WBC handles the "low level" execution:
*   **Task Prioritization**: Balance > Hand Position > Head Orientation.
*   **Inverse Dynamics**: Calculating exact torques using the formula: tau = M(q) * q_ddot + C(q, q_dot) + G(q)

## 7.5 Project: The "Unitree H1" Walk

We will combine RL (Module 5) + Domain Randomization (Module 6) to train a policy for the Unitree H1 humanoid.
*   **Goal**: Walk 10 meters without falling.
*   **Bonus**: Recover from a push (0.5m/s perturbation).
