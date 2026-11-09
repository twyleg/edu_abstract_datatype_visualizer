# Validierung

`npm test` prüft 28 Fälle mit echten Snapshot-/Adaptermodulen:

1. Feldmutation, unveränderter alter Snapshot, stabile IDs, Aliase und Zyklus.
2. Kein Aufruf von Gettern oder Containermethoden; Begrenzung großer Arrays.
3. Fehlerhaftes Größenfeld bleibt sichtbar, null-Speicherinhalt bleibt erhalten.
4. Abmelden aller Ereignisse einschließlich bereits geplanter Benachrichtigung.
5. Verschieben, Entfernen, Einfügen und mehrfach gleiche Werte.
6. Tatsächliche Kette und abgetrennter current-Knoten.
7. Falsches Größenfeld ohne erfundene Elemente.
8. Zyklus und begrenzter Snapshot mit fehlendem Knoten.
9. Leere Reihung ohne Speicherarray.
10. Tatsächliche React-Flow-Pfeilziele einschließlich Zyklen und abgetrenntem current.
11. Geänderte Referenzen und explizite Platzhalter für fehlende Snapshot-Knoten.
12. Abstrakte Darstellung unabhängig von den Speicherreferenzen.

`npm run test:browser` ist ein Integrationstest mit der tatsächlichen IDE,
ihrem Compiler und ihrer Runtime. Ein Entwicklungsserver muss laufen.
Er prüft das bereitgestellte generische DynArray-Programm, das generische Beispiel SchulArray und
Referenzen mit Zyklus sowie null- und Indexoperationen der bereitgestellten Klasse. Die Browseraufnahme `prototype.png` entsteht während
des Tests. Browserfehler führen zu einem Fehlerstatus.

Zusätzlich manuell: `examples/NullUndIndizes.java` zeigt die wirkungslosen null- und Indexoperationen
der bereitgestellten Klasse; `examples/SchulArray.java` lässt sich mit F11 bis in einzelne
Zuweisungen verfolgen. Vor einer Übernahme weiterer Unterrichtsklassen deren
Speicherlayout und Compilerkompatibilität prüfen; der Prototyp behauptet keine
Kompatibilität mit nicht mitgelieferten Programmen.

Ergebnis des abschließenden Durchlaufs (27.10.2026):

- TypeScript-Prüfung ohne Fehler.
- 28 Modultests bestanden.
- Statischer Vite-Produktionsbuild erfolgreich (ohne Minifizierung und Source Maps,
  um den Speicherbedarf der vollständigen IDE zu begrenzen).
- Alle vier Browser-Integrationsszenarien gegen den statischen Build auf Port 8080
  bestanden: bereitgestellte knotengestützte Reihung, generischer Java-Container, Referenzgraph
  und die tatsächliche null-/Indexsemantik der bereitgestellten Klasse.
  Keine Browser-Ausnahmen.

Die IDE bringt umfangreiche Monaco-, Grafik- und Bibliotheksabhängigkeiten mit.
Vite meldet die vorhandenen `sql.js`-Imports von Node-Modulen als für den Browser
externalisiert; der Containerprototyp benutzt diese Datenbankfunktion nicht.

Ergänzte Adaptertests: Auslesen der tatsächlichen Kette einschließlich abgetrenntem
`current`, inkonsistentes Größenfeld, Zyklus/fehlender Snapshot-Knoten und leere
Reihung. Die Browserprüfung kontrolliert in der internen Ansicht `first`,
`contentObject`, `next` und den Hinweis auf die tatsächliche Knotenstruktur.

Die React-Flow-Browserprüfung kontrolliert vier gerenderte Knoten und fünf echte
SVG-Verbindungen für das Drei-Elemente-Beispiel (Container plus drei Nodes).
Sie verschiebt einen Diagrammknoten, prüft dabei den unveränderten Runtime-
Snapshot und betätigt die Einpassen-Schaltfläche. Die vorhandenen vier
Compiler-/Runtime-Integrationsszenarien werden weiterhin ausgeführt.

Animationstests prüfen Entfernen und Lückenschluss, unveränderte Quelldaten,
Unterbrechen laufender Übergänge ohne Positionssprung, weiterhin referenzierte
entfernte Knoten und stabile Identität gleicher Inhalte in der abstrakten Sicht.
Im Chromium-Test werden tatsächliche React-Flow-Koordinaten vor und während
`delete(0)` verglichen. Danach werden das Verschwinden historischer Knoten,
abstrakte Ausblendungen und die sofortige Darstellung bei reduzierter Bewegung
geprüft. Die ursprünglichen vier Runtime-Szenarien bleiben enthalten.

Zoom-Regression: Der Browsertest vergrößert die interne Ansicht und vergleicht
Zoom sowie beide Verschiebungskoordinaten während und nach dem Löschen und
Ausblenden. Auch die abstrakte Ansicht behält ihren Bildausschnitt, einschließlich
reduzierter Bewegung.

Der Speed-Regler wird im Browser per Home/End bedient: Bei 0,25× bleibt ein
entferntes Element nach 900 ms noch in der Ausblendung; ein Wechsel auf 3×
während dieses Übergangs beendet ihn entsprechend schneller. Geprüft werden
auch die Daueranzeige, unveränderte Runtime-Snapshots und Kameraposition sowie
sofortige Darstellung trotz langsamem Regler bei reduzierter Bewegung.

Vier Verlaufstests prüfen die Aufzeichnung nur an Haltepunkten, eine fixierte
historische Auswahl während weiterer Ausführung, Live-Rückkehr, Programmende und
Neustart, Begrenzung und Cursor-Korrektur sowie Replay und dessen Abbruch.
Im Browsertest werden Zurück, Vorwärts und Wiederholen bedient; Runtime-Snapshots
und Kamera bleiben dabei unverändert. Der Verlauf bleibt nach Programmende
bedienbar. Das Speed-Popover wird auf verborgenen Anfangszustand, Öffnen innerhalb
des Canvas und Escape-Schließen geprüft; die bisherigen Timingtests bedienen den
Regler im Popover.

Der Browsertest kontrolliert die tatsächlichen Monaco-Dekorationen: genau eine
hellblaue Markierung auf der im Verlauf ausgewählten Zeile, Entfernen bei Live
und Erhalt der echten grünen Ausführungsposition. Ein zusätzlicher Step-Into-
Durchlauf hält live in DynArray.java, ohne diese Halte in den Verlauf aufzunehmen.
Der Rückblick bleibt in Programm.java; Live zeigt wieder die reale
Markierung zurück. Auch dabei bleiben die Runtime-Snapshots unverändert.

Die zusätzlichen Tests zeichnen mehrere synchrone instruction-Snapshots vor einer
UI-Benachrichtigung auf, prüfen den automatischen Live-Wechsel auf resume und das
vollständige Abmelden der Laufzeit-Beobachter. Im Browser wird ein Programm per
normalem Start bei maximalem Tempo ausgeführt: 12 Aufrufer-Aufnahmen enthalten
unter anderem die realen Größen 0/1/2/3 nach den Containeraufrufen. Nach Ende
wird von Größe 2 zu Größe 3 zurückgegangen und die Änderung erneut abgespielt,
ohne weitere Programmausführung. Ein echter Debugger-Schritt aus dem Rückblick
kehrt automatisch nach Live zurück und entfernt die historische Quelltextfarbe.
Außerdem bestehen alle 75 ursprünglichen Java-Compiler-/Runtime-Tests
(`src/test/JavaTests.test.ts`).

Zwei zusätzliche Tests begrenzen den Verlauf auf eine beliebig benannte Startdatei
(Lesson.java statt festem Programm.java), auch wenn der erste Halt in einer
Hilfsdatei liegt. Live kann weiterhin einen tatsächlichen DynArray-Haltepunkt
zeigen, ohne diesen im Verlauf zu speichern. Der Browsertest bestätigt, dass
Step Into in DynArray den Verlaufszähler nicht erhöht, historische Markierungen
in Programm.java bleiben und der normale Lauf ausschließlich Aufruferzustände
für Replay anbietet, einschließlich der tatsächlichen Größenänderung 3 → 2.

Die Einfüge-Choreografie wird an Phasengrenzen geprüft: erst bewegen sich die
Nachbarn, dann bleibt deren Position fest und der neue Knoten steigt aus der
Warteposition auf. Ein weiterer Test prüft das Überspringen der ersten Phase
beim Anhängen und das separate Entfernen-Profil. Der Browsertest führt ein echtes
insertAt zwischen zwei vorhandenen Elementen aus, liest während beider Phasen
React-Flow-Koordinaten und Deckkraft und prüft den unveränderten Bildausschnitt.

Der Scrubber-Test prüft direkten Sprung, Live-/Rückblickstatus, unveränderte
Verlaufslänge und animiertes Vorwärts nach dem Springen. Der Browser prüft die
volle Canvas-Höhe und Leistenbreite (abzüglich 15 px Seitenränder), Ziehen und
Tastaturbedienung des Trenners, Home/End am Scrubber sowie unveränderte Runtime-
Snapshots. Anschließende History- und Animationschecks bestätigen, dass auch
Scrubbing über Zustände ohne existierenden Container den Viewport nicht remountet.

## GitHub Pages / Datenschutz

`npm run test:pages` prüft den fertig gepackten Build unter einem Repository-
Unterpfad mit einem eigenen statischen Server. Der Test bestätigt IDE-Start,
Webworker, normalen Programmlauf, Datenschutz-/Lizenz-/Quelltextdownloads sowie
keine Cookies, Local-/Session-Storage-Einträge, IndexedDB-Datenbanken oder externen
Startanfragen. Die Prüfung wurde mit dem lokalen Quellbaum über einen separaten
Git-Testindex durchgeführt; der echte Git-Index blieb leer, es wurde kein Commit
oder Push erzeugt. Der Pages-Workflow verwendet stattdessen den echten HEAD-Commit.

## NRW-Stapel

Drei zusätzliche Modultests prüfen die head-/nextNode-Kette, die senkrechte
abstrakte Darstellung mit top-Markierung, echte Referenzpfeile, stabile
Knotenidentität nach pop, leere Stapel sowie Zyklen und fehlende Snapshotdaten.
Der Chromium-Test lädt `examples/Stapel.java` mit den mitgelieferten editierbaren
Java-Klassen und prüft LIFO-Reihenfolge, Rückgabewerte von top/pop/isEmpty,
null-/Leeroperationen, Aliase, mehrere Instanzen und beide Ansichten.
