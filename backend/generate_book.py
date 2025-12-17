import os

DOCS_DIR = "../textbook-frontend/docs"

chapters = {
    "intro.md": """---
sidebar_position: 1
---

# Introduction to Physical AI & Embodied Intelligence

## Learning Objectives
- Define Physical AI and its distinction from Generative AI.
- Understand the concept of Embodied Intelligence.
- Explore the history and future of Humanoid Robotics.

## What is Physical AI?
Physical AI refers to AI systems that interact with the physical world. Unlike chatbots (like ChatGPT) that process text, Physical AI agents (robots) must perceive, reason, and act in dynamic environments.

### Key Components
1. **Perception**: Sensors (Cameras, LiDAR, IMU).
2. **Reasoning**: Planning, Navigation, Decision Making.
3. **Actuation**: Motors, Servos, Hydraulics.

## Embodied Intelligence
Embodied intelligence suggests that intelligence emerges from the interaction between an agent's body and its environment. A robot's morphology (shape) influences how it learns.

![Physical AI Diagram](https://placehold.co/600x400?text=Physical+AI+Diagram)

## Quiz
1. What is the main difference between GenAI and Physical AI?
   - A) GenAI is smarter.
   - B) Physical AI interacts with the physical world.
   - C) GenAI uses robots.
   
   **Answer: B**

## Lab: Setting up your Environment
1. Install ROS 2 Humble.
2. Install Docker.
3. Run the `hello_world` node.
""",

    "chapter-01-humanoid-landscape.md": """---
sidebar_position: 2
---

# Humanoid Robotics Landscape

## Overview
Humanoid robots are designed to resemble the human body. This allows them to operate in environments built for humans (stairs, doors, tools).

## Leading Platforms
| Robot | Company | Key Features |
|-------|---------|--------------|
| Optimus | Tesla | Mass manufacturing focus, VLA |
| Atlas | Boston Dynamics | Hydraulic (retired), Electric (new) |
| Figure 01 | Figure | OpenAI integration |
| Digit | Agility Robotics | Logistics focus |

## Challenges
- **Balance**: Bipedal locomotion is unstable.
- **Power**: Battery life is limited.
- **Cost**: Actuators and sensors are expensive.

## Lab: Analyze a URDF
We will look at a simple Humanoid URDF file.
```xml
<robot name="simple_humanoid">
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.1 0.5"/>
      </geometry>
    </visual>
  </link>
</robot>
```
""",
    "chapter-02-ros2-fundamentals.md": """---
sidebar_position: 3
---

# ROS 2 Fundamentals

## Nodes, Topics, Services
ROS 2 is the middleware for robotics.

### Nodes
A node is a process that performs computation.
```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Hello ROS 2!')
```

### Topics
Nodes communicate via topics (Pub/Sub).

### Services
Request/Response communication.

## Lab: Create a Publisher
Write a Python node that publishes "Hello World" every second.
""",
    "chapter-03-urdf.md": """---
sidebar_position: 4
---

# URDF for Humanoids

## Unified Robot Description Format
URDF is an XML format to describe the robot's structure.

## Links and Joints
- **Links**: Rigid bodies (torso, arm, leg).
- **Joints**: Connections (revolute, prismatic, fixed).

## Xacro
Macro language to make URDFs cleaner.

## Lab: Build a Leg
Create a URDF for a 3-DOF leg.
""",
    "chapter-04-gazebo.md": """---
sidebar_position: 5
---

# Gazebo Simulation

## Why Simulation?
Testing on hardware is dangerous and slow.

## Gazebo Classic vs Gazebo (Ignition)
We use the new Gazebo.

## Spawning a Robot
Launch file to spawn URDF in Gazebo.

## Lab: Simulate Gravity
Spawn your humanoid and see if it falls.
""",
    "chapter-05-unity.md": """---
sidebar_position: 6
---

# Unity Visualization

## Unity for Robotics
Unity offers high-fidelity rendering.

## ROS-TCP-Connector
Bridge between ROS 2 and Unity.

## Lab: Visualizing Sensor Data
Send LiDAR data from ROS 2 to Unity.
""",
    "chapter-06-isaac-sim.md": """---
sidebar_position: 7
---

# NVIDIA Isaac Sim

## Omniverse
Isaac Sim is built on Omniverse. Photorealistic physics.

## Isaac ROS
Hardware accelerated ROS nodes (GEMs).

## Lab: Isaac Sim Hello World
Load a USD environment.
""",
    "chapter-07-vslam.md": """---
sidebar_position: 8
---

# VSLAM & Navigation

## SLAM
Simultaneous Localization and Mapping.

## Nav2 Stack
The standard navigation stack for ROS 2.
- Planner
- Controller
- Behavior Trees

## Lab: Mapping a Room
Drive the robot around to build a map.
""",
    "chapter-08-vla.md": """---
sidebar_position: 9
---

# Vision-Language-Action Models

## The New Paradigm
Instead of separate modules (vision -> planning -> control), VLA models go end-to-end.

## RT-1 and RT-2
Google's Robotics Transformers.

## Lab: Running a VLA
Inference with a pre-trained VLA model (mocked).
""",
    "chapter-09-control.md": """---
sidebar_position: 10
---

# Control & Balance

## PID Control
Proportional-Integral-Derivative.

## MPC
Model Predictive Control. Essential for walking.

## Whole Body Control (WBC)
Managing multiple tasks (balance + manipulation).

## Lab: PID Tuning
Tune a PID controller for a joint.
""",
    "chapter-10-conversational.md": """---
sidebar_position: 11
---

# Conversational Robotics

## Speech to Text (Whisper)
Transcribing audio.

## LLMs for Reasoning
Using GPT-4 to interpret commands.

## Text to Speech
Responding to the user.

## Lab: Voice Command Robot
"Robot, go to the kitchen."
""",
    "chapter-11-capstone.md": """---
sidebar_position: 12
---

# Capstone Project

## Objective
Build a simulation of a humanoid robot that can:
1. Navigate a home environment.
2. Respond to voice commands.
3. Pick up an object.

## Requirements
- Use ROS 2.
- Simulation in Gazebo or Isaac Sim.
- Video demo required.

## Submission
Submit your GitHub repo link.
"""
}

def generate():
    if not os.path.exists(DOCS_DIR):
        print(f"Directory {DOCS_DIR} does not exist. Waiting for Docusaurus...")
        return

    for filename, content in chapters.items():
        path = os.path.join(DOCS_DIR, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated {filename}")

if __name__ == "__main__":
    generate()
