---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Solve Long-horizon Stacking Task with Demonstration-based Deep Reinforcement Learning (In Progress)'
description: 'Solved complex, long-horizon stacking task of dual-arm robot using demonstration-based deep reinforcement learning.'
team: 'Yuchen Yang'
supervisor: 'Prof. Xinjun Sheng, Dr. Cheng Ding (JAKA Engineer)'
image:
    url: '/website/Project1.gif'
    alt: 'Stacking Task.'
---

Stacking task, as one significant step in industrial production line, its requirements for diversity and precision pose new challenges to automation. The flexibility, mobility, and intelligence of humanoid robots bring new possibilities to such industrial applications, for which stacking task involves complex manipulation with long horizon.

## 1. Problem Description
### 1.1 Task Analysis
**Objective**: The objective is to have a dual-arm humanoid robot place all workpieces into their corresponding stacking areas, where the workpieces and stacking areas are randomly generated with random sizes, quantities, positions, and combinations.

**Challenge Analysis**: The stacking task is a combination of *pick and place* subtasks, essentially a long-horizon task. The challenges include: 
1) The quantity, position, and size of workpieces vary in each scenario, requiring a high level of generalization. 
2) For workpieces of the same shape, how to choose the corresponding stacking area? For example, in Figure 1.1.1, workpieces a, b, and c can be placed in any of the areas A, B, or C. How can we find the optimal placement method in such cases? This involves the clever design of the reward function.
<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 50%; vertical-align: top;">
        <img src="/website/P1_Figure_111.png" alt="Stacking Task" style="width: 100%;" class="hover-img"/>
        <p style="text-align: center;">
            <strong>
            Figure 1.1.1: Stacking Task Example
            </strong>
        </p>
    </div>
</div>

**Technical Approach**: A demonstration-based deep reinforcement learning method with the overall framework are shown in Figure 1.1.2.
<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 60%; vertical-align: top;">
        <img src="/website/P1_Figure_112.png" alt="Deep Reinforcement Learning" style="width: 100%;" class="hover-img"/>
        <p style="text-align: center;">
            <strong>
            Figure 1.1.2: Deep Reinforcement Learning Framework
            </strong>
        </p>
    </div>
</div>

## 2. Demonstrations Collection
Over 30 demonstrations of stacking task are collected, with the stack diversity and randomness well considered. The MuJoCo simulation environment and demonstrations collection pipeline are illustrated in [another post](../project2). Click for more information.

## 3. Reward Function Explained
The reward function comprises distance rewards, rotation penalties, keyframe additional rewards, and drop penalties.
### 3.1 Relation Matrix
To address the correspondence between workpieces and stacking areas in the task scenario, a *relation_matrix* is established, a two-dimensional array with the following calculation:

1. **Initialization**:
   <p>
   At initialization, <i>relation_matrix</i> is set to a zero matrix. Then, for each workpiece and stacking area, if their sizes match, the corresponding <i>relation_matrix</i> element is set to 1:
    $$
    \text{relation_matrix}[i, j] = 
    \begin{cases} 
    1 & \text{if } \text{cube_size}[i][:2] \approx \text{area_size}[j][:2] \\
    0 & \text{otherwise}
    \end{cases}
    $$
   </p>

2. **Update**:
   <p>
    When a workpiece is detected to be placed in a stacking area, all relation values in <i>relation_matrix</i> related to that workpiece or stacking area are set to 0:
   $$
   \begin{aligned}
   \text{if workpiece} & \, i \, \text{is placed in area} \, j \, \text{then:} \\
   &\text{relation_matrix}[i, :] = 0 \\
   &\text{relation_matrix}[:, j] = 0 \\
   &\text{relation_matrix}[i, j] = 1 \\
   \end{aligned}
   $$
   </p>
   <p>
   To simplify the expression, the <i>associated_areas</i> is defined, which includes all stacking areas associated with the \(i\) -th workpiece, determined by <i>relation_matrix</i>:
   </p>
   <p>
   $$
   \text{associated_areas}[i] = \{ j \mid \text{relation_matrix}[i, j] = 1 \}
   $$
   </p>

### 3.2 Distance Reward
<p>
For a workpiece, let the distance to a corresponding stacking area be <i>distance</i>. The distance reward is:
$$
\text{distance_reward}(\text{workpiece}[i],\text{stacking_area}[j]) = \frac{1}{\text{distance}_{i,j} + 0.1}
$$
The total distance reward for a workpiece is the sum of the distance rewards with all corresponding stacking areas:
$$
\text{distance_reward}[i] = \sum_{j \in \text{associated_areas}[i]} \frac{1}{\text{distance}_{i,j} + 0.1}
$$
</p>

### 3.3 Rotation Penalty
<p>
For each workpiece, let the average distance to the related stacking area be <i>mean_distance</i>. If it is less than a certain threshold, the rotation penalty is considered. This is because, during operation, the rotation posture of the workpiece does not need to be considered if it is far from the placement area. If the average distance is small enough, the difference in rotation from the initial direction <i>rotation_diff</i> is calculated, and then the rotation penalty is calculated based on the rotation difference:
$$
\text{rotation_penalty}[i] = 
\begin{cases} 
0 & \text{if } \text{mean_distance}_{i} > 0.1 \\
- \frac{\text{rotation_diff}_{i} / \pi}{0.1 + \text{mean_distance}_{i}} & \text{otherwise}
\end{cases}
$$
</p>

### 3.4 Keyframe Detection and Extra Bonus

Keyframe detection includes pick keyframe and place keyframe.
<p>
1. <b>Pick Keyframe</b>:
   A queue of length 4 records the latest four heights of the workpiece. If the height changes continuously three times by more than +0.001, and the difference between the first recorded height and the rest height is less than 0.02, a pick keyframe is detected:
   $$
   \begin{aligned}
   \text{if }&\left|\text{cube_z_history}[cube][0]-\text{cube_rest_height}\right|< 0.02:\\
   \text{if }&\left(\forall\text{index}\in\text{cube_z_history}[cube], \text{cube_z_history}[cube][index+1]-\text{cube_z_history}[cube][index]>0.001\right):\\
   &\text{is_pick_keyframe} = \text{True}
   \end{aligned}
   $$
</p>

<p>
2. <b>Place Keyframe</b>:
   If the workpiece's position is close to the corresponding stacking area's position in the x and y axes, and the height is close to the rest height, a place keyframe is detected:
   $$
   \begin{aligned}
   \text{if } &\left( \text{cube_pose[:2]} \approx \text{area_pose[:2]} \right) \text{ and } \left( \text{cube_pose[2]} \approx \text{cube_rest_height} \right): \\
   &\text{is_place_keyframe} = \text{True}
   \end{aligned}
   $$
</p>
<p>
For the extra bonus, if a cube drops, it decreases by 50; if a pick keyframe is detected, it increases by 5; if a place keyframe is detected, the extra reward increases by 15:
$$
\text{extra_bonus } = 5\times\text{is_pick_frame} + 15\times\text{is_place_frame} - 50\times\text{is_dropped}
$$
</p>

### 3.5 Comprehensive Reward Function
<p>
Combining all the above parts, the formula for the comprehensive reward function is as follows:
$$
\begin{aligned}
\text{reward_all} &= \sum_{i} \text{omega}[i] \times (\text{distance_reward}[i] + \text{rotation_penalty}[i]) + \text{extra_bonus} \\
&= \sum_{i} \text{omega}[i] \times \left( \sum_{j \in \text{associated_areas}[i]} \frac{1}{ \text{distance}_{i,j} + 0.1} - \frac{\text{rotation_diff}_{i} / \pi}{0.1 + \text{mean_distance}_{i}}\right) + 5\times\text{is_pick_frame} + 15\times\text{is_place_frame} - 50\times\text{is_dropped}
\end{aligned}
$$
</p>

### 3.6 Validity Verification of Reward Function
Based on joint motion data collected from a demonstration, reconstructed in MuJoCo simulation environment, the following video shows the total reward, workpiece position, and workpiece rotation changing with the stacking operation, which is in line with expectations.
<div style="text-align: center; margin: 20px 0;">
    <video id="WS2" controls muted width="900" class="hover-img">
        <source src="/website/P1_Movie_361.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

## 4. Policy Model
Waiting...
