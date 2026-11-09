# edu_abstract_datatype_visualizer

Ausführbarer Browserprototyp mit der originalen LearnJ-IDE von Martin Pabst:
Monaco, Java-Compiler, Interpreter und Debugger laufen lokal im Browser.
Rechts erscheint der tatsächliche Zustand der Container bei jedem Debuggerhalt.
Die Diagramme werden mit React Flow (`@xyflow/react`) dargestellt.

## GitHub Pages

Deployment und Einstellungen: [GitHub-Pages-Anleitung](docs/GITHUB_PAGES.md).
Der Workflow baut und veröffentlicht die Standardbranch nach Aktivierung von
**Settings → Pages → Source → GitHub Actions**. Die Anwendung enthält über die
Informationsschaltfläche Datenschutz-, Lizenz- und Quelltextlinks.

## Start

Voraussetzung: Node.js 22 und npm.

```sh
npm install
npm run dev
```

**http://localhost:5173/** öffnen (auch `/visualizer.html` und `/index.html` funktionieren). Die IDE wird beim ersten Aufruf
von Vite vorbereitet; das kann etwas dauern. Ein Java-Testprogramm ist geladen.
Mit dem **Einzelschritt-Button** in der IDE starten und weitergehen. F10 funktioniert,
wenn der IDE-Bereich den Tastaturfokus hat; F11 betritt eigene Methoden.
Die markierte Zeile ist jeweils die nächste Anweisung.

- Containerinstanz auswählen; Aliase werden mit derselben Objekt-ID angezeigt.
- Das Kombofeld „Darstellung“ in der oberen Canvas-Leiste schaltet zwischen
  „Abstrakte Sicht“ (logische Reihenfolge) und „Interner Speicher“ um.
- „Interner Speicher“ zeigt reale Knoten und Referenzen; bei Array-Containern
  deren Speicherarray einschließlich freier Plätze.
- Grün markiert neue Werte, Gelb verschobene Werte und geänderte Felder.
- Die Schieberegler-Schaltfläche neben den Zoom-Tasten öffnet bei Bedarf die
  „Animationsgeschwindigkeit“ (0,25× bis 3×); die Anzeige nennt
  zusätzlich die Übergangsdauer. Die Einstellung wirkt auf beide Ansichten, auch
  während einer laufenden Animation, und bleibt beim Ansichtswechsel erhalten.
- Beim Einfügen öffnen die vorhandenen Knoten zuerst die Lücke; anschließend
  steigt der neue Knoten von unten hinein. Anhängen ohne Verschiebung startet
  direkt mit dem Einblenden. Einfügen und Umordnen werden animiert. Entfernte Elemente sinken nach unten
  und blenden aus. Noch über `current`/`last` referenzierte Knoten bleiben unter
  der Kette sichtbar; historische Ausblendungen sind als vorheriger Zustand
  gekennzeichnet. Die Systemeinstellung für reduzierte Bewegung wird beachtet.
- Neben Objektreferenzen öffnet **▸** die Attribute direkt im Knoten; **▾** klappt sie wieder ein. Verschachtelte Objekte und Arrays lassen sich ebenfalls öffnen. Zyklen und nicht vollständig erfasste Objekte werden gekennzeichnet. Die Anzeige liest ausschließlich den ausgewählten Snapshot.
- Im Diagramm: Knoten ziehen, Hintergrund verschieben, mit dem Mausrad zoomen
  oder die Zoom-/Einpassen-Schaltflächen verwenden. Das verändert ausschließlich
  die Darstellung. Zoom und Bildausschnitt bleiben während und nach Änderungen
  erhalten; automatisches Einpassen erfolgt nur beim ersten Öffnen einer Ansicht.
  Referenzen sind gerichtete, beschriftete Verbindungspfeile.
- Oben im Diagramm: **←** zeigt den vorherigen aufgezeichneten Halt, **→**
  animiert den nächsten, **↻** spielt den aktuellen Übergang erneut ab. **Live**
  kehrt zur aktuellen Ausführung zurück. Der Rückblick verändert das Java-Programm
  nicht. Im Editor markiert Hellblau die nächste Anweisung des historischen
  Haltepunkts. Bei Bedarf wird die zugehörige Datei geöffnet; Live entfernt die
  blaue Markierung und zeigt wieder die reale Ausführungsposition.
  Auch ein normaler Start zeichnet die echten Zustände an Anweisungsgrenzen der
  Startdatei auf (hier `Programm.java`). Hilfsdateien wie `DynArray.java` erzeugen
  keine eigenen Verlaufseinträge; ihre Änderungen erscheinen nach dem Aufruf. Es werden die letzten 2000 Zustände gespeichert; eine Kürzung wird angezeigt.
  Ein echter Debugger-Schritt oder Fortsetzen schaltet automatisch zurück auf Live.
- Der Regler im Verlauf springt direkt zu aufgezeichneten Zuständen. Vorwärts
  und Wiederholen animieren den gewählten Übergang weiterhin.
- Den Trenner zwischen IDE und Visualisierung ziehen, um die Breite anzupassen;
  mit Fokus auf dem Trenner funktionieren auch Pfeiltasten sowie Home/End.
- Die Visualisierung nutzt die gesamte rechte Fensterseite. Technische Hinweise
  erscheinen bei Bedarf kompakt in der Leiste statt unterhalb des Diagramms.

Das Standardprogramm nutzt die vom Nutzer bereitgestellte generische Klasse
`DynArray<ContentType>` von Lae. Ihre ausführbare Implementierung wurde unverändert
übernommen; die Methodenkommentare wurden gekürzt, die Herkunftsangabe erhalten.
Die Datei `DynArray.java` ist als zweite, editierbare Datei in der IDE geladen.
Die Niedersachsen-Bibliothek der IDE wird dafür nicht aktiviert.

Diese Implementierung speichert **verkettete Node-Objekte**, kein Array. Die
abstrakte Sicht zeigt die Inhalte entlang der `first`-/`next`-Kette. Die interne
Sicht zeigt reale Knoten-IDs, `contentObject`, `next` sowie `size`, `first`, `last`
und `current`. Auch ein nur noch über `current` erreichbarer entfernter Knoten
bleibt sichtbar. Es gibt keine Arraykapazität. `append(null)`, ungültige Indizes
und `setItem(..., null)` haben gemäß dieser Klasse keine Wirkung.

## Eigene Unterrichtsprogramme

Quelltext im Monaco-Editor ersetzen. Für die bereitgestellte DynArray-Klasse ist der Adapter
bereits eingerichtet. Für eigene Klassen in den Einstellungen neben den Zoom-Tasten unter
„Eigener Array-Adapter“ den tatsächlichen Klassennamen, das Arrayfeld und optional
das Größenfeld eingeben und mit „Übernehmen“ bestätigen. Es sind keine Änderungen an der Containerklasse erforderlich.
Unbekannte Speicherlayouts benötigen einen weiteren TypeScript-Adapter.

Die tatsächliche Unterrichtsklasse liegt unter
`upstream/src/visualizer/DynArray.java`. Weitere kopierbare Programme
liegen unter `examples/`:

- `SchulArray.java`: eigener generischer Container, private Speicherfelder,
  Kapazitätswachstum 2 → 4, Einfügen, Löschen, null, Aliase, leere zweite Instanz
  und absichtlich falsches Größenfeld. Adapter: `SchulArray / daten / anzahl`.
- `Referenzen.java`: mehrere Referenzen auf dieselbe Person, Selbstzyklus,
  null-Element und Änderung eines verschachtelten Objektfelds.

Für Speicherzuweisungen innerhalb eigener Methoden **Step Into (F11)** verwenden.
Der Visualizer liest auch inkonsistente Zwischenzustände direkt aus dem Programm.
Bei Programmende können die Stackframes bereits verschwunden sein. Die Anzeige
behält deshalb den ausdrücklich gekennzeichneten letzten aufgezeichneten Haltepunkt
bei. Der Verlauf bleibt nutzbar; beim nächsten Programmstart wird er geleert.

- `NullUndIndizes.java`: `null`, ungültige Indizes, `getItem` und vollständiges
  Leeren mit der bereitgestellten DynArray-Klasse.

## Prüfen und statisch bauen

```sh
npm test
npm run typecheck
# Entwicklungsserver muss parallel laufen:
cd upstream
npx playwright install chromium
cd ..
npm run test:browser
npm run build
```

Der Browsertest nutzt echtes Chromium, bedient die originale IDE-Steuerleiste,
ersetzt Java-Quelltext im Monaco-Editor und prüft die tatsächlich erzeugten
Snapshots. `VISUALIZER_URL` kann eine andere Adresse angeben. Der Build benötigt
wegen der vollständigen IDE mehrere GB RAM (Node-Heaplimit: 6 GB).

Die fertige statische Anwendung liegt in `upstream/dist-visualizer/`, Einstieg
`index.html` oder `visualizer.html`. Diesen Ordner vollständig auf statischem Webhosting ablegen;
ein separates Backend ist nicht erforderlich. Lokal beispielsweise:

```sh
python3 -m http.server 8080 --directory upstream/dist-visualizer
```

Dann http://localhost:8080/visualizer.html öffnen. Nicht per `file://` starten,
da Monaco Webworker verwendet. Bei eigener Unterverzeichnis-URL wurde ein
relativer Vite-Basispfad eingestellt.

## Aufbau und Quellen

- `upstream/src/visualizer/runtime.ts`: unabhängige Snapshot-Erzeugung und Ereignisabonnement.
- `upstream/src/visualizer/adapters.ts`: Adaptervertrag, Arrayadapter und Zustandsvergleich.
- `upstream/src/visualizer/visualizer-ui.ts`: gemeinsame Auswahl und Status für die Canvas-Leiste.
- `upstream/src/visualizer/split-pane.ts`: zugängliche Breitenverstellung und IDE-Layout-Anbindung.
- `upstream/src/visualizer/flow-model.ts`: reine Abbildung auf React-Flow-Knoten und Kanten.
- `upstream/src/visualizer/flow-animation.ts`: unterbrechbare Anzeigeübergänge ohne Runtime-Zugriff.
- `upstream/src/visualizer/flow-view.tsx`: interaktive React-Flow-Darstellung.
- `upstream/src/visualizer/main.ts`: separates UI; keine simulierten Java-Operationen.
- `UPSTREAM.patch`: die abgegrenzten Änderungen an Embedded-API und Laufzeit-Beobachtung.
- [Technische Analyse](docs/ANALYSE.md): überprüfte Dateien, Methoden, Entscheidung und Grenzen.
- [Lizenz und Bereitstellung](docs/LIZENZ.md): GPL-3.0 und zugehöriger Quellcode.
- [Browseraufnahme](docs/prototype.png).

Original: https://github.com/martin-pabst/Online-IDE-new-compiler,
Stand `c039e8a7d510fa46be3884d0f63f9a247ec93a68`.
Die Quellen sind vollständig unter `upstream/` enthalten. Der Compiler bleibt unverändert. Der vorhandene Interpreter wurde um optionale
Beobachter an Anweisungsgrenzen und ein Signal für Ausführungsbefehle ergänzt;
seine Anweisungsfunktionen und deren Ausführung werden weiterverwendet. Die neue Integration und ihre Änderungen sind vom
27.10.2026 und stehen ebenfalls unter GPL-3.0-only; siehe `LICENSE`.

## Stapel (Stack)

Die editierbare Datei `Stapel.java` enthält auch `StackNode` und ist in der
IDE geladen (QUA-LiS NRW, Generisch_02). `examples/Stapel.java` kann als
Startprogramm in den Editor kopiert werden. Das geladene `Programm.java` zeigt
DynArray und Stapel; `Stapel.java` und `DynArray.java` bieten außerdem jeweils
eine `public static void main(String[] args)` zur schnellen Demonstration. `push` ignoriert null, `top` liest
ohne Änderung, `pop` entfernt und liefert den obersten Inhalt. Auf einem leeren
Stapel liefern beide Abfragen null; `isEmpty` liefert true.

Der Adapter erkennt `Stapel` (auch `Stack` mit demselben Speicherlayout).
Die abstrakte Ansicht zeigt die Inhalte senkrecht von oben (`top`) nach unten.
Die interne Ansicht zeigt das Stapelobjekt links neben der senkrechten Kette der
tatsächlichen StackNode-Objekte mit `content`,
`head` und `nextNode` samt Referenzpfeilen. Die Anzahl wird aus der erreichbaren
Kette ermittelt; unvollständige Snapshots und Zyklen werden gekennzeichnet.
