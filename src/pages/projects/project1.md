---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Solve long-horizon stacking task with demonstration-based reinforcement learning (In Progress)'
description: 'Solved complex, long-horizon stacking task of dual-arm robot using demonstration-based reinforcement learning(Waiting...).'
team: 'Yuchen Yang'
supervisor: 'Prof. Xinjun Sheng, Dr.Cheng Ding (JAKA Engineer)'
image:
    url: '/website/Project1.gif'
    alt: 'Stacking Task.'
---

Stacking task, as one significant step in industrial production line, its requirements for diversity and precision pose new challenges to automation. The flexibility, mobility, and intelligence of humanoid robots bring new possibilities to such industrial applications, for which stacking task involves complex manipulation with long horizon.

## 1. Demonstrations Collection
Over 30 demonstrations of stacking task are collected, with the stack diversity and randomness well considered. The MuJoCo simulation environment and demonstrations collection pipeline are illustrated in [another post](../project2). Click for more information.

## 2. Model Construction(In Progress)

<div style="text-align: center;">
    <div style="display: inline-block; text-align: center; width: 80%; vertical-align: top;">
        <img src="/website/P1_Figure_211.png" alt="Sequential Dexterity" style="width: 100%;" class="hover-img"/>
        <p style="text-align: center;">
            <strong>
            Figure 2.1.1: Core architecture of 
            <a href= "https://sequential-dexterity.github.io/"> Sequential Dexterity </a>
            </strong>
            <br>
        </p>
        <br>
    </div>
</div>
