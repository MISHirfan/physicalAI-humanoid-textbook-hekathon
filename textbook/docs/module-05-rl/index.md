---
sidebar_position: 5
---

# Module 5: Reinforcement Learning for Robotics

> "The robot learns not by being told what to do, but by being told how well it did."

## 5.1 Introduction to RL in Robotics

Reinforcement Learning (RL) has revolutionized how we control physical agents. Unlike traditional control theory which requires precise mathematical modeling of the robot and environment, RL learns policies through interaction.

### Key Concepts
*   **Agent**: The robot.
*   **Environment**: The physics simulation (Isaac Gym/Gazebo) or real world.
*   **State ($S_t$)**: Joint angles, velocities, IMU data.
*   **Action ($A_t$)**: Joint torques or position targets.
*   **Reward ($R_t$)**: A scalar value indicating success (e.g., +1 for moving forward, -1 for falling).

## 5.2 Proximal Policy Optimization (PPO)

PPO is the industry standard for continuous control in robotics due to its stability and ease of tuning.

```python
# Pseudo-code for a PPO Rollout in Isaac Lab
def play_step(self, actions):
    # Apply actions to robot
    self.physics.set_dof_efforts(actions)
    self.physics.step()
    
    # Get new state
    obs = self.get_observations()
    reward = self.calculate_reward()
    done = self.check_termination()
    
    return obs, reward, done
```

## 5.3 Reward Shaping

The "dark art" of RL. Designing a reward function that encourages desired behavior without "gaming" the system.

*   **Survival Reward**: $+1$ for every step the robot doesn't fall.
*   **Velocity Reward**: $+v_x$ (move forward).
*   **Energy Penalty**: $- \sum \tau^2$ (minimize torque usage).
*   **Smoothness Penalty**: Minimize jerk or acceleration changes.

## 5.4 Hands-on Lab: Training a Unitree Go2 to Walk

In this lab, you will use NVIDIA Isaac Lab to train a quadruple robot to walk on flat terrain.

1.  **Launch the Environment**: `python train.py task=Go2-Walk`
2.  **Monitor Training**: Use Tensorboard to watch the `episode_reward` curve.
3.  **Visualize**: Enable the GUI to see the spider-robot struggling at first, then mastering the gait.
