---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Simulation and Demonstration Collection Pipeline for Dual-Arm Robot'
description: 'Build the MuJoCo simulation environment for humanoid dual-arm robot and creating the demonstration collection pipeline based on data glove.'
team: 'Yuchen Yang'
supervisor: 'Dr.Cheng Ding (JAKA Engineer)'
image:
    url: '/website/Project2.png'
    alt: 'Simulation environment of desk grasp task.'
---

## 1. MuJoCo Simulation Environment
Built on the [MuJoCo](https://mujoco.org/) platform, I have created a simulation environment for a human-shaped dual-arm robot that encompasses three distinct task scenarios. The environment incorporates over 40 different item models and over 70 diverse textures. Each item and environmental element is accompanied by a model file and the corresponding MJCF configuration file.

### 1.1 Three Task Scenarios
1. **Desk Grasp**: This scenario simulates the task of grasping items on a desktop. The environment includes a variety of foods, fruits, and common daily items (Figure 1.1.1a).

2. **Shelf Grasp**: Designed to simulate the process of grabbing items from a shelf, this environment features various items such as beverage bottles, cans, and boxes. The complexity of this environment is intended to test the robot's recognition and grasping capabilities (Figure 1.1.1b).

3. **Pick and Place**: In this setup, multiple bins are used to test both grasping and placing actions. The robot must not only recognize and grasp an item but also place it in a specific location (Figure 1c).

<div style="text-align: center;">
    <br>
    <div style="display: inline-block; text-align: center; width: 35%; vertical-align: top;">
        <img src="/website/P2_Figure_111_a.png" alt="Desk Grasp" style="width: 100%;" class="hover-img"/>
        <p>(a)</p>
    </div>
    <div style="display: inline-block; text-align: center; width: 30%; vertical-align: top;">
        <img src="/website/P2_Figure_111_b.png" alt="Shelf Grasp" style="width: 100%;" class="hover-img"/>
        <p>(b)</p>
    </div>
</div>
<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 40%; vertical-align: top;">
        <img src="/website/P2_Figure_111_c.png" alt="Pick and Place" style="width: 100%;" class="hover-img"/>
        <p>(c)</p>
        <p style="text-align: center;">
            <strong>Figure 1.1.1: Task Environment</strong> <br>
            (a) Desk Grasp <br>
            (b) Shelf Grasp <br>
            (c) Pick and Place
        </p>
        <br>
    </div>
</div>

## 2. Demonstration Collection Pipeline
### 2.1 Overall Pipeline
The standard process for collecting presentation data is facilitated by a data glove (Figure 2.1.1). This glove serves as an interactive medium between the operator and the robot, equipped with an array of sensors. It includes four sensors that capture the spatial position of the arm (providing quaternions) and seven sensors that measure finger angles (providing angle values). After calculating these quaternions and angle data, the corresponding angular motion sequence of the robot's joints is transmitted in real time to the simulation environment, enabling precise motion control. During the robot's task execution, data is collected at set intervals; joint angle values are stored in the `qpos.hdf5` file, and the RGBD camera's image data is stored in the `RGBD.hdf5` file.

<div style="text-align: center;">
    <br>
    <div style="display: inline-block; text-align: center; width: 60%; vertical-align: top;">
        <img src="/website/P2_Figure_211.png" alt="Flow Chart" style="width: 100%;" class="hover-img" />
        <p style="text-align: center;">
            <strong>Figure 2.1.1: Demonstration Collection Pipeline</strong> <br>
        </p>
    </div>
    <br>
</div>

### 2.2 Arm motion mapping
<p>
    1. <strong>Calculate the Relative Rotation Matrix</strong>
    <br>
    Each sensor establishes a coordinate system, and the relative rotations between these systems need to be determined.
    $$
    \begin{align}
    ^{Fore}R_{Hand} &= ^{0}R_{Fore}^T\cdot^{0}R_{Hand} = quat2rot(quatFore)^{T} \cdot quat2rot(quatHand) \\
    ^{Upper}R_{Fore} &= ^{0}R_{Upper}^T\cdot^{0}R_{Fore} = quat2rot(quatUpper)^T \cdot quat2rot(quatFore) \\
    ^{Body}R_{Upper} &= ^{0}R_{Body}^T\cdot^{0}R_{Upper} =quat2rot(quatBody)^T \cdot quat2rot(quatUpper) \\
    \end{align}
    $$
</p>

<p>
    2. <strong>Calculate Changes Over Time</strong>
    <br>
     The change in the relative rotation matrix of adjacent sensors must be calculated with respect to the initial time. This quantifies how the relative rotation matrix at the current time point \( t \) differs from that at the initial time point \( t_0 \).
    $$
    \begin{align}
    ^{Fore}R_{Hand}^{t_0 \rightarrow t} &= (^{Fore}R_{Hand}^{t_0})^T\cdot ^{Fore}R_{Hand}^{t}\\
    ^{Upper}R_{Fore}^{t_0\rightarrow t} &= (^{Upper}R_{Fore}^{t_0})^T\cdot ^{Upper}R_{Fore}^{t}\\
    ^{Body}R_{Upper}^{t_0\rightarrow t} &= (^{Body}R_{Upper}^{t_0})^T\cdot^{Body}R_{Upper}^{t}\\
    \end{align}
    $$
</p>

<p>
    3. <strong>Convert to Euler Angles</strong>
    <br>
    The rotation matrix is converted into Euler angles, and a selected angle is multiplied by the corresponding coefficient to adjust for the robot's motion capabilities.
    $$
    \begin{align}
    {\color{Gray} For\ joint\ i:}&\\
    ArmPos[i] & = initArmPos[i]\pm ArmRateR[i]\cdot Rot2euler({\color{Peach} *} )[{\color{Violet} n } ]\\
    {\color{Gray} in\ which:}\ & {\color{Peach} *} \ {\color{Gray} is\ ^{Fore}R_{Hand}^{t_0 \rightarrow t}\ or\ ^{Upper}R_{Fore}^{t_0\rightarrow t}\ or\ ^{Body}R_{Upper}^{t_0\rightarrow t}}\\
    & {\color{Violet} n} \ {\color{Gray} is\ 0/1/2 } 
    \end{align}
    $$
</p>

### 2.3 Hand motion mapping

Given the configuration of the three-finger dexterous hand and the constraints of sensor data, a unique and efficient hand mapping method has been devised. On the data glove, the joints of the thumb, index finger, and middle finger can be directly mapped to their corresponding joints on the dexterous hand. The floating joint is managed by angle sensors in the ring and pinky fingers. As there are no angle sensors for the three joints of the dexterous hand, a force feedback-based control method is utilized. In the simulation environment, when the tactile sensor detects contact between the fingertip and an object that exceeds a certain force threshold, the system adjusts the joint angle, simulating the bending action of the finger until the contact force reaches a preset maximum (Figure 3).

<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 60%; vertical-align: top;">
        <img src="/website/P2_Figure_231.png" alt="Hand Mapping" style="width: 100%;" class="hover-img" />
    </div>
    <p style="text-align: center;">
        <strong>Figure 2.3.1: Hand Motion Mapping</strong> <br>
    </p>
</div>

An example of the robot control in the simulation process is demonstrated in the video below.

<div style="text-align: center; margin: 20px 0;">
    <video id="SimVideo" controls muted width="720" class="hover-img">
        <source src="/website/P2_Movie_231.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

### 2.4 Stacking task

The stacking task challenges the robot to grasp items and place them with precision according to the shape of the stacking area. To simulate complex stacking tasks, a flexible and customizable stack generation function has been designed. It automatically creates stack areas and corresponding square workpieces based on preset parameters, such as stack length, width, height, structure, and arrangement (Figure 4). The positions of items and stacks are randomly generated, ensuring a variety of stacking scenarios.

<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 60%; vertical-align: top;">
        <img src="/website/P2_Figure_241.png" alt="Stack Generation" style="width: 100%;" class="hover-img" />
    </div>
    <p style="text-align: center;">
        <strong>Figure 2.4.1: Stack Generation</strong> <br>
    </p>
</div>

An example of an RGB video reconstruction from the camera for the stacking task is presented below.

<div style="text-align: center; margin: 20px 0;">
    <video id="CamVideo" controls muted width="720" class="hover-img">
        <source src="/website/P2_Movie_241.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<style>
    .hover-img {
        transition: transform 0.3s ease-in-out;
    }
    .hover-img:hover {
        transform: translateY(-5px);
    }
    h2 {
        font-size: 1.6em;
        color: #333;
        margin-top: 20px;
        margin-bottom: 10px;
    }
    h3 {
        font-size: 1.3em;
        color: #333;
        margin-top: 20px;
        margin-bottom: 10px;
    }
</style>