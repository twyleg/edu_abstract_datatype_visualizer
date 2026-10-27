# Lizenz und Bereitstellung

Die Original-IDE enthält die GNU GPL Version 3 (`upstream/LICENSE`), deren Text
auch als `LICENSE` im Projekt liegt. Die neue Integration wird ebenfalls unter
GPL-3.0-only bereitgestellt. Originale Urheber- und Lizenzhinweise bleiben erhalten.
Änderungen an `EmbeddedInterface.ts`, `MainEmbedded.ts`, `Interpreter.ts` und
`Thread.ts` sowie die neuen Dateien
sind in `UPSTREAM.patch` bzw. `docs/ANALYSE.md` dokumentiert (27.10.2026).

Für die Bereitstellung dieser angepassten Anwendung werden die JavaScript-Bundles
an Browser übertragen. Deshalb sollte mit der gebauten Version auch der exakt
zugehörige vollständige Quellcode einschließlich Änderungen, Lockdatei,
Buildkonfiguration und Bauanleitung unter der GPL zugänglich gemacht werden
(GPL §§4–6, insbesondere §6d für Download über einen Server). Nur ein Link auf
den unveränderten Originalstand reicht für diese modifizierte Version nicht.
Lizenztext, Copyright-Hinweise und Änderungen sind mitzuliefern. Die Empfänger
müssen die GPL-Rechte zur Änderung und Weitergabe behalten.

Praktische Bereitstellung: `upstream/dist-visualizer/` auf statischem Webhosting
veröffentlichen, daneben ein Quellarchiv dieses Projektstands ohne `node_modules`
mit README, Lockdatei, Originalquellen und Änderungen anbieten und von der
bereitgestellten Seite verlinken. Drittanbieterabhängigkeiten und Assets behalten
ihre eigenen Lizenzbedingungen; vor öffentlicher Weitergabe auch deren Hinweise
und die Nutzungsrechte der beigefügten Grafik-/Audioassets prüfen. Die GPL der
IDE bedeutet nicht automatisch, dass jede Grafik unabhängig davon beliebig
verwendet werden darf. Der Pages-Workflow liefert diese Dateien einschließlich passendem source.zip
automatisch aus. Es wurde durch diese Vorbereitung keine öffentliche
Veröffentlichung vorgenommen.

Grundlage: mitgelieferter Original-Lizenztext, insbesondere §§4, 5, 6 und die
Definition von „Corresponding Source“. Offizieller Text:
https://www.gnu.org/licenses/gpl-3.0.html
