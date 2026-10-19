---
title: "IMPACT"
summary: "Interactive room installation that turns the body into an instrument. My part: visuals and UI of the DanceBass module, and the dancepad."
role: "Team of seven; DanceBass visuals and UI"
context: "University project, TH Nürnberg, winter 2025/26 and summer 2026"
---

IMPACT is an interdisciplinary room installation in which the body is the interface for music, light and projection. A team of seven students built it over two semesters. It has three modules: DanceBass, where a dancepad picks a song, Handscape, where hand gestures switch audio effects on and off, and LightSynth, a laser-harp-like instrument made of eight beams of light.

I worked mainly on DanceBass. Stepping on the dancepad's arrows flips through records on screen, and each record is a city with its own bass track in Ableton Live.

- **Covers:** after the first test the two original covers were dropped. I built six new audio-reactive record covers in TouchDesigner. Five are based on community tutorials that I rebuilt and adapted, the lightning cover is my own. They react to the MIDI notes of the active track and are masked onto a record shape.
- **UI:** arrows in the colours of the pad, a record in the centre, and a camera that turns through the six covers like a carousel, driven by an ESP32 over OSC.
- **Gamification:** each cover can be unlocked with an arrow sequence. In a team of two, we built this; the concept came mainly from my teammate, and I reworked it.
- **Dancepad:** the team of two also built the pad, a 90 × 90 cm wooden frame with four foil contact fields. An ESP32 sends the steps as USB keyboard presses. We followed an existing build guide and adapted it.

The module worked well on the project day. The dance sequence was less self-explanatory than we had assumed, and because of the heat some of the real-time effects had to be reduced during the presentation.
