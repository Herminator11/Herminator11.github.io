---
title: "MyCharacterManager"
summary: "Self-hosted live dashboard for D&D 5e characters, built for the phone at the game table."
role: "Solo project"
context: "Personal project"
---

A dashboard for my own Dungeons & Dragons 5e characters, designed for the phone at the table rather than as a rules database. Changing hit points or using a spell slot is a single tap, and phone and laptop show the same state without reloading.

A combat mode stays open during an encounter: action, bonus action and reaction at the top, used with a tap and reset with "End turn", favourite spells as buttons below, and a combat log that writes itself from damage, healing, spells cast and conditions.

Characters can be imported from a fillable PDF character sheet (the official D&D sheet or an extended format). The import shows everything it found before anything is saved, and after a level-up the same character can be updated while the current game state, such as hit points and used spell slots, is kept. The interface can be set per device to German, German with English rule terms, or English; SRD content such as spell and class names stays in English. Everything lives in one SQLite file, and the app can be added to the phone's home screen.
