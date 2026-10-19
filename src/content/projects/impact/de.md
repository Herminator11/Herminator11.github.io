---
title: "IMPACT"
summary: "Interaktive Rauminstallation, die den Körper zum Instrument macht. Mein Teil: Visuals und UI des Moduls DanceBass sowie das Dancepad."
role: "Team aus sieben Studierenden; Visuals und UI von DanceBass"
context: "Hochschulprojekt, TH Nürnberg, Wintersemester 2025/26 und Sommersemester 2026"
---

IMPACT ist eine interdisziplinäre Rauminstallation, in der der Körper zum Interface für Musik, Licht und Projektion wird. Ein Team aus sieben Studierenden hat sie über zwei Semester gebaut. Sie besteht aus drei Modulen: DanceBass, bei dem ein Dancepad einen Song auswählt, Handscape, bei dem Handgesten Audio-Effekte zu- und abschalten, und LightSynth, einem laserharfenartigen Instrument aus acht Lichtstrahlen.

Ich habe hauptsächlich an DanceBass gearbeitet. Mit den Pfeilen des Dancepads blättert man durch Schallplatten auf dem Bildschirm, jede Platte steht für eine Stadt und hat einen eigenen Basstrack in Ableton Live.

- **Cover:** Nach dem ersten Test wurden die zwei ursprünglichen Cover verworfen. Ich habe sechs neue audioreaktive Plattencover in TouchDesigner gebaut. Fünf basieren auf Community-Tutorials, die ich nachgebaut und angepasst habe, das Blitz-Cover ist meine eigene Arbeit. Sie reagieren auf die MIDI-Noten des aktiven Tracks und sind auf eine Plattenform maskiert.
- **UI:** Pfeile in den Farben des Pads, eine Platte in der Mitte und eine Kamera, die wie ein Karussell durch die sechs Cover dreht, gesteuert von einem ESP32 über OSC.
- **Gamification:** Jedes Cover lässt sich mit einer Pfeilsequenz freischalten. Das haben wir im Zweierteam gebaut; das Konzept stammt überwiegend von der anderen Person im Team, ich habe es überarbeitet.
- **Dancepad:** Auch das Pad haben wir zu zweit gebaut, ein Holzrahmen von 90 × 90 cm mit vier Folienkontaktfeldern. Ein ESP32 sendet die Schritte als USB-Tastatureingaben. Wir sind einer vorhandenen Bauanleitung gefolgt und haben sie angepasst.

Am Projekttag hat das Modul gut funktioniert. Die Tanzeingabe war weniger selbsterklärend als angenommen, und wegen der Hitze mussten bei der Präsentation einige Echtzeit-Effekte reduziert werden.
