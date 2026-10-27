# Technische Analyse und Architektur

Analysierte Originalquelle: https://github.com/martin-pabst/Online-IDE-new-compiler,
Commit `c039e8a7d510fa46be3884d0f63f9a247ec93a68` (27.10.2026 heruntergeladen).
Die vollständige Quelle liegt unter `upstream/`. Die Embedded-Wrapper-Seite
https://www.embed.learnj.de/createwrapper.html liefert Einbettungscode; ein fremdes
Iframe erlaubt unserer Seite keinen direkten Zugriff auf die internen Objekte.

## Tatsächlich gefundene Komponenten

Alle folgenden Pfade sind relativ zu `upstream/src/`:

| Aufgabe | Datei / Klasse / Methode |
|---|---|
| Embedded-Bootstrap | `client/embedded/EmbeddedStarter.ts`, `initJavaOnlineDivs`, `initDiv` |
| IDE und Workspace | `client/embedded/MainEmbedded.ts`, `init`, `getInterpreter` |
| Öffentliche API | `client/embedded/EmbeddedInterface.ts`, `SingleIDEAccessImpl` |
| Java-Compiler | `compiler/java/JavaCompiler.ts` |
| Ausführung / Steuerung | `compiler/common/interpreter/Interpreter.ts`, `executeOneStep`, `pause`, `setState`, `showProgramPointer` |
| Scheduling | `compiler/common/interpreter/Scheduler.ts`, `runSingleStepKeepingThread`, `stepOut` |
| Frames / Operanden | `compiler/common/interpreter/Thread.ts`, `programStack`, `s`; `ProgramState.ts`, `stackBase`, `stepIndex` |
| Debugger | `compiler/java/debugger/JavaDebugger.ts`, `showVariablesOfProgramState` |
| Sichtbarer Gültigkeitsbereich | `compiler/common/debugger/DebuggerCallstackEntry.ts` |
| Stackvariable | `compiler/common/debugger/DebuggerSymbolEntry.ts`, `StackElementDebuggerEntry.fetchValueFromStackAndRender` |
| Felder | dieselbe Datei, `ObjectFieldDebuggerEntry.fetchValueFromObjectAndRender` |
| Hauptprogrammvariablen | dieselbe Datei, `StaticFieldDebuggerEntry.fetchValueAndRender`; Klassenregister des Schedulers |
| Native Reihung | `compiler/java/runtime/modules/niedersachsen/NiedersachsenDynArrayClass.ts` |

Die ursprüngliche öffentliche Embedded-API bietet `getFiles` und
`registerOnRunExitListener`, aber keine Step- oder Heap-API. Intern gibt es
`EventManager` mit `stateChanged`, `showProgramPointer`, `start`, `stop`,
`resetRuntime`, `done`. `executeOneStep` ruft nach dem erfolgreichen Scheduler-
Schritt `pause()` und `showProgramPointer()` auf; dies aktualisiert auch den
bestehenden Debugger. Die Feldbezeichner werden über `getFieldIndentifier()`
aufgelöst. Java-Felder haben nicht notwendigerweise ihren Quelltextnamen als
JavaScript-Eigenschaft. Hauptprogrammvariablen sind statische Felder der
synthetischen Hauptklasse. Das ist für die Integration wesentlich.

## Entscheidung

Eine lokale Embedded-Version auf derselben Seite nutzt den bestehenden
Compiler, Interpreter, Scheduler und Monaco. Der Compiler bleibt unverändert.
`MainEmbedded.ts` ergänzt Opt-in-Konfiguration und API-Registrierung;
`EmbeddedInterface.ts` ergänzt Snapshot-Abonnement und Quelltextmarkierung.
Für lückenlose Aufzeichnung normaler Läufe erhalten `Interpreter.ts` und
`Thread.ts` zusätzlich eine optionale Beobachterschnittstelle (siehe unten). Der komplette
neue Inspektions- und Visualisierungscode liegt separat in `src/visualizer/`.
Kein Methodenaufruf wird nachgebildet oder als Containeroperation interpretiert.
Kein eigener Java-Interpreter, kein Backend und kein Zugriff auf das fremde
Embedded-Iframe. Die native IDE-Steuerleiste einschließlich Fehleransicht,
Breakpoints und Einzelschritten bleibt erhalten.

`subscribeDebugger(listener)` liefert JSON-serialisierbare Kopien und eine
Abmeldefunktion. Nur bei `enableDebuggerAccess: true` zugänglich. Separate
Callbacks sind notwendig, da der ursprüngliche EventManager beim Abmelden
nur einen Ereignistyp pro Callback speichert. Ein Microtask fasst die beiden
Benachrichtigungen eines Halts zusammen und liest erst nach `scheduler.setState`.
Die Position ist die nächste auszuführende Anweisung, nicht die zuletzt ausgeführte.

Der Snapshot besteht aus Status, Position, Variablen mit Framebezeichnung und
einem separaten Objektgraphen. WeakMap-IDs bleiben während eines Abonnements
stabil. Referenzen werden als `{ref: id}` serialisiert. Es werden keine
Java-Methoden, `toString`, `getElements` oder JavaScript-Property-Getter aufgerufen.
Lediglich Metadatenmethoden der IDE (`getType`, Feld- und Symbolinformationen)
werden benutzt. Native Speicherfelder `elements` und Box-Werte `value` werden
gezielt über Property-Deskriptoren gelesen. Zyklen enden an bereits besuchten IDs.
Grenzen: Tiefe 8, 500 Objekte, 500 Arrayelemente; abgeschnittene Daten werden
gekennzeichnet. Snapshots speichern keine lebenden Referenzen an das Programm.

## Abgrenzung zur IDE-Bibliotheksklasse

Die mitgelieferte Klasse ist `nds.DynArray`, keine generische Klasse. Die
Bibliothek wird über `libraries: ['niedersachsen']` aktiviert. Ihre öffentliche
API lautet `isEmpty`, `getItem`, `append`, `insertAt`, `setItem`, `delete`,
`getLength`, `iterator`. `append`, `insertAt`, `setItem` verbieten `null`.
Intern gibt es `elements`, ein JavaScript-Array. Die Länge ist die Elementanzahl;
es existiert kein separates Größen- oder Kapazitätsfeld. Eine Engine-interne
Reservekapazität ist nicht auslesbar und wird ausdrücklich nicht erfunden.

`arrayAdapter` unterstützt zusätzlich eine beschriebene Java-Klasse mit Array-
und Größenfeld, einschließlich generischer Klassen und Referenztypen.
`examples/SchulArray.java` ist eine ausdrücklich als Beispiel implementierte
Klasse, keine behauptete Unterrichtsstandardklasse. Andere Unterrichtsklassen können über passende Feldnamen oder einen weiteren
Adapter beschrieben werden. Auch während einer fehlerhaften Verschiebung wird
der tatsächlich teilweise geänderte Speicher gezeigt. Ungültige Größen bleiben
sichtbar und erzeugen einen Hinweis; fehlende Elemente werden nicht erfunden.

## Grenzen des Prototyps

- Entdeckt werden aus aktiven Stackframes und deren statischem Klassenkontext
  erreichbare Objekte. Keine vollständige Heap-/Garbage-Collector-Ansicht.
- Nach Programmende können Frames bereits entfernt sein; das Panel behält dann
  den letzten aufgezeichneten Haltepunkt mit ausdrücklichem Hinweis bei. Dies ist
  kein rekonstruierter Endzustand.
- Freie Ausführung liefert Statusänderungen und vorhandene Programmpointer-
  Ereignisse, keine lückenlose Aufzeichnung aller Instruktionen bei Maximaltempo.
  Jeder abgeschlossene sichtbare Debugger-Schritt aktualisiert die Ansicht.
- Native Methoden sind im IDE-Debugger atomar; eigene Java-Methoden lassen sich
  mit Step Into bis auf die einzelnen Speicherzuweisungen untersuchen.
- Gleiche primitive Werte sind beim Vergleich nicht individuell unterscheidbar;
  Referenzen werden anhand ihrer Identität verglichen. Verschiebungen gleicher
  Werte sind daher mehrdeutig. Farbpulse ersetzen aufwendige Positionsanimationen.
- Der Feldvergleich ist flach. Verschachtelte Änderungen sind vollständig im
  Snapshot sichtbar; die Containerzellen zeigen Referenz-IDs. Vererbte Felder mit
  identischem Quelltextnamen können sich im Snapshot überschreiben.
- Die API ist eine projektlokale Erweiterung, keine veröffentlichte Upstream-API.

## Bereitgestellte Unterrichtsklasse

Der Nutzer hat `DynArray<ContentType>` von Lae mit der Hilfsklasse
`Node<ContentType>` bereitgestellt. Deren ausführbarer Code ist nun unter
`upstream/src/visualizer/DynArray.java` übernommen und wird über Vites Raw-Import
als zweite editierbare Java-Datei in die IDE geladen. Methodenkommentare wurden
gekürzt, die Herkunftsangabe erhalten. Der Compiler führt diese Java-Klasse aus;
kein nativer Ersatz und keine Änderungen an ihren Methoden sind notwendig.
Die Bibliothek `niedersachsen` ist im Standard-Workspace deaktiviert, damit die
unterrichtseigene Klasse eindeutig verwendet wird.

Obwohl sie DynArray heißt, benutzt sie eine einfach verkettete Knotenstruktur.
Der neue Adapter `linkedDynArray` prüft die tatsächlichen Felder `size`, `first`,
`last`, `current` und folgt `Node.next`; Inhalte stammen aus `contentObject`.
Es existieren weder Speicherarray noch Kapazität. Die logische Ansicht folgt
allen im Snapshot verfügbaren Knoten ab `first`, unabhängig vom Größenfeld.
Bei Abweichungen wird `size` unverändert mit einem Hinweis angezeigt. Ein
besuchter Knoten wird nur einmal verfolgt, Zyklen und fehlende Snapshot-Knoten
werden gemeldet. Die Tiefengrenze der Inspektion gilt weiterhin; längere Ketten
können daher unvollständig sein und werden ausdrücklich gekennzeichnet.

Die interne Ansicht ergänzt Knoten, die nur über `last` oder `current` erreichbar
sind. Das ist keine Fehlerkorrektur: Beim Löschen des ersten Knotens einer
mehrgliedrigen Reihung lässt die Vorlage `current` auf diesem entfernten Knoten.
`getItem` und `setItem` verändern `current` ebenfalls tatsächlich; die Inspektion
ruft diese Methoden selbst niemals auf. Änderungen von Knotenfeldern und der
Containerreferenzen werden hervorgehoben. `append(null)` und ungültige Indizes
bleiben gemäß der vorgegebenen Implementierung wirkungslos.

Die Unterstützung für beschriebene Array-Container bleibt als weiterer Adapter
bestehen. Diese Ergänzung implementiert keinen zusätzlichen allgemeinen
List-Container, sondern das konkrete Speicherlayout der geforderten DynArray-Klasse.

## React Flow

Beide Diagrammansichten verwenden `@xyflow/react` mit React und React DOM.
`flow-model.ts` bildet die kopierten Snapshots auf stabile React-Flow-Knoten und
Kanten ab. Die interne Ansicht ordnet die realen Knoten in Listenreihenfolge horizontal
von links nach rechts an; der Container steht darüber. Containerreferenzen
enden oben an den Knoten, `next`-Pfeile verbinden sie seitlich.
`first`, `last`, `current` und `next` erhalten benannte Handles und gerichtete
Kanten zu den tatsächlichen Objekt-IDs. Nullreferenzen erzeugen keine Kanten.
Nicht erfasste Zielobjekte werden ausdrücklich als unvollständig dargestellt.
Die abstrakte Ansicht zeigt indizierte Inhalte ohne Implementierungspfeile.
Arrayadapter zeigen das reale Array als weiteren Diagrammknoten.

`flow-view.tsx` verwaltet ausschließlich Diagrammpositionen und den Viewport.
Die TypeScript-Konfiguration aktiviert dafür `jsx: react-jsx`; React, React DOM
und `@xyflow/react` sind samt Typdefinitionen und Lockdatei eingebunden.
Knoten können verschoben werden; Zoom, Pan und „Gesamte Struktur anzeigen“ sind
verfügbar. Bei unveränderter Topologie bleiben Positionen und Zoom erhalten;
bei hinzugefügten/entfernten Knoten wird animiert neu angeordnet. Zoom und
Bildausschnitt bleiben dabei erhalten. Einmalig beim Öffnen einer Ansicht wird
eingepasst; danach nur über die explizite Einpassen-Schaltfläche.
Neue Knoten, geänderte Felder und umgebogene Referenzen werden hervorgehoben.
Diagrammkanten können nicht neu verbunden und Knoten nicht gelöscht werden.
Keine Interaktion schreibt zurück in Java-Objekte. Die React-Wurzel bleibt
zwischen Debuggerschritten bestehen und wird nicht über DOM-Manipulationen geleert.

Primäre API-Dokumentation: https://reactflow.dev/learn und
https://reactflow.dev/api-reference/react-flow .

## Animation von Zustandsänderungen

`flow-animation.ts` trennt Übergangsplanung und Interpolation von Snapshot und
Adapter. Bestehende Knoten gleiten bei Normalgeschwindigkeit über 700 ms an die neue Layoutposition; neue
Knoten blenden von unten ein. Nicht mehr dargestellte Knoten werden als reine
historische Kopien ohne Runtime-Kanten kurz nach unten bewegt und ausgeblendet.
Sie tragen den Hinweis „Entfernt · vorheriger Zustand“. Ein tatsächlich noch
über `current` oder `last` erreichbarer, aus der first-Kette entfernter Knoten
wird dagegen unterhalb der Kette dargestellt und behält seine echten Kanten.
Das bildet insbesondere das Verhalten der bereitgestellten delete-Methode ab.

Die abstrakte Sicht verwendet für die bereitgestellte Klasse stabile Node-IDs,
auch bei gleichen Inhaltswerten. Arrayinhalte ohne solche IDs werden nach Wert
bzw. Objekt-ID mit Vorkommenszähler zugeordnet; identische primitive Duplikate
bleiben mehrdeutig. Es werden keine Containeroperationen aus Methodenaufrufen
erraten. RequestAnimationFrame aktualisiert die React-Flow-Positionen, sodass
Referenzkanten während der Bewegung ihren Knoten folgen.

Neue Änderungen unterbrechen einen laufenden Übergang und starten von den
bereits sichtbaren Positionen. Reine Status-/Feldaktualisierungen starten ihn
nicht erneut. Es gibt keine Warteschlange, die veraltete Zustände nachspielt.
Automatisches Einpassen bei Zustandsänderungen ist deaktiviert, damit die Kamera
während und nach der Animation unverändert bleibt. Ziehen von Knoten ist
während dieser kurzen automatischen Bewegung deaktiviert. Explizite Ansichtswechsel brechen
geplante Übergänge ab. Bei `prefers-reduced-motion: reduce` werden die Positionen
sofort übernommen und keine historischen Ausblendungskopien erzeugt.

## Einstellbare Animationsgeschwindigkeit

Der standardmäßig verborgene Range-Regler in einem Popover im React-Flow-Fenster reicht von 0,25× bis 3×
in 0,25er-Schritten, mit 1× als Standard. Die Anzeige nennt Multiplikator und
Dauer (2,80 s bis 0,23 s). Tastaturbedienung und `aria-valuetext` werden unterstützt.
`animation-speed.ts` hält die gemeinsame Anzeigeeinstellung unabhängig von der
IDE. `useSyncExternalStore` überträgt sie in die aktive React-Flow-Ansicht; beim
Wechsel von Container oder Ansicht bleibt die Einstellung erhalten. Ein Neuladen
der Seite stellt den Standard wieder her.

Jeder Animationsframe integriert die vergangene Zeit mit dem aktuellen Faktor.
Ein Verstellen während der Bewegung ändert dadurch die Geschwindigkeit ohne
Neustart oder Positionssprung. Bewegung und Ein-/Ausblenden verwenden denselben
Fortschritt; Farbpulse übernehmen die Dauer über eine CSS-Variable. Die reduzierte
Bewegung hat weiterhin Vorrang. Der Regler ändert weder Programmausführung noch
Snapshots, Layoutziele oder Kameraposition.

## Kompakte Bedienelemente und Verlauf

`flow-controls.tsx` bündelt die horizontalen Zoom-/Einpassen-Schaltflächen mit
einer Schieberegler-Schaltfläche. Das Speed-Popover liegt innerhalb des Canvas,
ist standardmäßig geschlossen und lässt sich per Escape oder Klick außerhalb
schließen. Escape führt den Fokus zurück zur auslösenden Schaltfläche.

`snapshot-history.ts` speichert bis zu 2000 beobachtete Anweisungsgrenzen und Debugger-
Haltepunkte als unveränderte Snapshot-Kopien. Reine Running-Statusereignisse
erzeugen keine Einträge; synchrone instruction-Ereignisse normaler Läufe schon. Die obere
Canvas-Leiste zeigt Position und Modus und bietet Zurück, Vorwärts, Wiederholen
und Live. Zurück springt ohne Animation; Vorwärts animiert den aufgezeichneten
Übergang. Wiederholen stellt kurz den vorherigen Zustand her und animiert erneut
zum ausgewählten Zustand. Manuelle Navigation und ein neuer Programmlauf brechen
einen geplanten Replay ab. Zoom und Bildausschnitt bleiben für dieselbe
Containeransicht erhalten.

Während eines Rückblicks werden neue Haltepunkte weiterhin aufgenommen, ohne die
historische Auswahl zu überschreiben. Live springt zum neuesten aufgezeichneten
Zustand und folgt wieder der Laufzeit. Bei Programmende bleibt der letzte Halt
mit „Programmende · letzter Zustand“ sichtbar. Die Begrenzung auf 2000 Einträge
wird bei Abschneiden älterer Einträge in der Leiste kenntlich gemacht; beim neuen
Programmlauf beginnt ein neuer Verlauf. Der ursprüngliche Debugger bleibt am tatsächlichen Ausführungsstand. Die Anwendung stellt keine Interpreter-
Checkpoints wieder her und führt beim Replay keine Java-Anweisung aus.

## Quelltextmarkierung im Rückblick

Die projektlokale Embedded-API ergänzt `setHistoryLocation({file, line})`, weiterhin
hinter `enableDebuggerAccess`. Der Visualizer setzt sie für den ausgewählten
historischen Snapshot und entfernt sie bei Live, neuer Ausführung oder fehlender
Position. Die hellblaue Ganzzeilenmarkierung und ein linker Randstreifen sind
separat von der echten grünen Ausführungsmarkierung. Der Tooltip erläutert, dass
die Position wie bei der IDE die nächste Anweisung am aufgezeichneten Halt meint.

Monaco-Modelldekorationen werden gezielt anhand eigener IDs verwaltet. Beim
Wechsel des historischen Orts werden alte Markierungen auch in anderen Dateien
entfernt. Die passende Datei wird über die bestehende IDE aktiviert und die Zeile
in den sichtbaren Bereich gescrollt, ohne beim Navigieren den Fokus aus dem
Verlauf in den Editor zu ziehen. Gleiche Orte werden nicht laufend neu gescrollt.
Fehlende Dateien und ungültige Zeilen erzeugen keine irreführende Ersatzmarkierung.
Die Position bezieht sich auf die gespeicherte Zeilennummer im aktuellen Quelltext;
Quelltextversionen selbst sind nicht Bestandteil der Runtime-Snapshots.

Monaco entfernt editor-eigene Dekorationen beim Modellwechsel. Beim Rückwechsel
auf Live wird daher, falls die IDE noch pausiert und ein echter Programmpointer
vorhanden ist, dessen Darstellung über den vorhandenen ProgramPointerManager
wiederhergestellt. Dabei wird kein Interpreter-/Step-Ereignis ausgelöst; weder
Program Counter, Stack, Objektfelder noch Verlaufseinträge werden verändert.
Die Anweisungsfunktionen des Compilers werden unverändert ausgeführt.

## Normale Programmläufe und automatisches Live

Die ursprüngliche Fullspeed-Schleife in `Thread.run` führt viele Anweisungen aus,
ohne UI-Ereignisse zu senden, und hält den aktuellen Step-Index lokal im Cache.
Daher genügt ein UI-Callback oder ein Microtask nach einem Tick nicht für eine
vollständige Aufnahme. Die beiden Ausführungsschleifen rufen jetzt ausschließlich
bei vorhandenen Beobachtern vor jeder bestehenden Anweisungsfunktion einen
Beobachter auf. Für diese synchrone Inspektion wird der zwischengespeicherte
Step-Index kurz sichtbar gemacht und vor der unveränderten Anweisungsfunktion
wiederhergestellt. Es werden keine Anweisungen ersetzt oder simuliert.

`Interpreter.beforeStepListeners` ist standardmäßig leer. Die Opt-in-Embedded-
Inspektion abonniert es; bei normaler Ausführung (`keepThread == false`) werden
Snapshots an Anweisungsgrenzen der Startdatei synchron und unabhängig von Tempo
oder Bildwiederholrate kopiert. Hilfsdateien werden im Verlauf ausgelassen.
Repl-Auswertung wird nicht als Programmlauf aufgezeichnet. Bei Debugger-
Einzelschritten bleiben die tatsächlich angehaltenen Zustände die Verlaufspunkte.
Eine neue Position bezeichnet weiterhin die nächste Anweisung an der jeweiligen
Grenze. Native Methoden und innerhalb einer kompilierten Anweisungsfunktion
zusammengefasste Operationen sind atomar; es werden keine zusätzlichen erfundenen
Zwischenzustände erzeugt. Das Aufzeichnen verursacht zusätzliche Laufzeit- und
Speicherkosten. Fehler eines Beobachters deaktivieren diesen mit Konsolenmeldung,
statt eine Java-Ausnahme im Schülerprogramm auszulösen.

Alle Aufnahmen werden sofort in den begrenzten Verlauf übernommen. Nur die
Benachrichtigung der Darstellung wird bis zum Microtask zusammengefasst; damit
bleiben auch Zwischenzustände eines in einem Browser-Tick abgeschlossenen Laufs
für Replay erhalten. Die letzten 2000 Zustände sind verfügbar; bei längeren Läufen
wird das Abschneiden früherer Einträge angezeigt. Die bestehenden Grenzen für
Objektzahl, Arraylänge und Inspektionstiefe gelten weiterhin.

Ein neues `executionRequested`-Signal wird von den tatsächlichen Start-, Step-
Into/Over- und Step-Out-Funktionen ausgelöst. Das Snapshot-Abonnement kennzeichnet
dies als `event: resume`. Der Verlauf bricht ein geplantes Replay ab, verlässt den
Rückblick und zeigt vor der Anweisung den tatsächlichen Stand. Das erzeugt keinen
zusätzlichen Verlaufseintrag. Insbesondere Step Into verwendet intern direkt
Scheduler-Zustandswechsel; deshalb reicht ein Interpreter-stateChanged-Listener
für diesen Fall nicht aus. Reines Navigieren im aufgezeichneten Verlauf löst
weiterhin keinen Ausführungsbefehl aus.

## Verlauf auf Ebene der Startdatei

Der Verlauf bleibt in der tatsächlich gestarteten Datei (hier Programm.java).
Der Inspector ermittelt diese aus dem untersten Program-Frame des Main-Threads
und liefert sie als `entryFile`; ein Dateiname wird nicht fest einprogrammiert.
Die synchrone Aufnahme normaler Läufe überspringt Anweisungen anderer Module.
Nach Rückkehr aus einem Containeraufruf wird am nächsten Anweisungsrand der
Startdatei der tatsächliche, bereits geänderte Containerzustand aufgenommen.
Hilfsaufrufe werden nicht auf eine erfundene Position im Aufrufer umetikettiert.

Auch explizite Debugger-Halte in Hilfsdateien werden vom Verlauf herausgefiltert.
Live zeigt diese weiterhin korrekt, wenn man mit Step Into in eine Methode geht.
Dazu speichert der Verlauf den letzten echten Live-Snapshot getrennt vom letzten
Verlaufseintrag: Live kann somit zu einer DynArray-Methode zurückkehren, obwohl
nur Programm.java im aufgezeichneten Verlauf erscheint. Rückblick und Replay
verwenden ausschließlich die Einträge der Startdatei, einschließlich der blauen
Quelltextmarkierung. Interne Felder und Speicherstrukturen werden weiterhin aus
den realen Objektzuständen gelesen, nun auf der Ebene kompletter Aufrufe.

## Aktionsabhängige Animationsphasen

`planTransition` unterscheidet anhand der tatsächlichen Knotenidentitäten und
Layoutänderungen die Profile insertion, removal und rearrange. Bei reinem
Einfügen mit verschobenen Nachbarn gehören die ersten 45 % der Übergangsdauer
zum Öffnen der Lücke: Die bisherigen Knoten erreichen ihre neuen Positionen,
während der neue Knoten unsichtbar unterhalb seines Zielplatzes wartet.
In den übrigen 55 % gleitet er nach oben und blendet ein. Beide Phasen haben
eine eigene Ease-out-Kurve; die Nachbarn bleiben während der zweiten Phase stehen.
Referenzkanten übernehmen die Deckkraft ihrer Endpunkte, damit keine Pfeile auf
den noch unsichtbaren Knoten zeigen.

Anhängen ohne verschobene Nachbarn benötigt keine erste Phase. Entfernen behält
das Absenken und Ausblenden bei, einschließlich weiterhin tatsächlich
referenzierter Knoten. Gemischte Änderungen und Umordnungen verwenden das
allgemeine Profil. Die Aktionen werden nicht aus Java-Methodennamen erraten.
Ein späterer Ausbau kann pro Profil weitere Choreografien hinzufügen.

Die gesamte Dauer bleibt bei 1× 700 ms und wird durch den bestehenden Regler
skaliert; laufende Geschwindigkeitsänderungen, Unterbrechungen, feststehender
Viewport und reduzierte Bewegung funktionieren für beide Phasen unverändert.
Die gestaffelten Bewegungen verändern ausschließlich die Darstellung eines
bereits tatsächlich erfassten Zielzustands, keine Java-Daten oder Verlaufseinträge.

## Vollflächige Oberfläche und geteilte Ansicht

Der Arbeitsbereich füllt das Browserfenster ohne zusätzliche Überschriften oder
untere Informationsspalten. React Flow belegt die gesamte rechte Seite. Seine
obere Leiste erstreckt sich mit 15 px Rand über die verfügbare Breite und enthält
Darstellungs- und Instanzauswahl, Verlaufsschaltflächen, den Scrubber und einen
kompakten Quelltext-/Laufzeitstatus. Warnungen zur tatsächlichen Datenstruktur
bleiben als Hinweis mit Beschreibung sichtbar. Erweiterte Arrayadapter werden
bei Bedarf im Einstellungen-Popover konfiguriert und ausdrücklich angewendet.

`visualizer-ui.ts` trennt Anzeigezustand von Benutzerauswahl. Dadurch können
Snapshot-Updates die React-Steuerelemente aktualisieren, ohne ihre DOM-Elemente
per imperativem Ersetzen neu zu erzeugen. `SnapshotHistory.seek` setzt einen
aufgezeichneten Index direkt ohne Zwischenanimation; Vorwärts und Wiederholen
behalten die Aktionsanimationen. Der ReactFlowProvider bleibt einschließlich
Toolbar auch bei leeren Zuständen im Verlauf montiert. Explizite Änderungen von
Ansicht oder Container lösen ein neues Einpassen aus; Scrubbing, Live-Rückkehr
und normale Runtime-Updates behalten den Bildausschnitt bei.

`split-pane.ts` verwaltet den vertikalen Trenner über Pointer-Capture. Begrenzte
Mindestbreiten, Pfeiltasten (Shift für größere Schritte), Home/End, sichtbarer
Fokus und ARIA-Separator-Werte unterstützen Maus, Touch und Tastatur. Ein
ResizeObserver ruft über die kleine Embedded-Methode `layoutEditor()` Monacos
bestehendes Layout auf; React Flow misst seine eigene Pane weiter selbst.
Weder Breitenverstellung noch UI-Auswahl verändern Compiler oder Runtime.

## Veröffentlichung

Der Actions-Workflow und `scripts/package-pages.mjs` erstellen ein statisches
Pages-Artifact mit relativem Basispfad, index.html und versionsgleichem
Quellarchiv. `privacy.html` und der Informationsknopf im Canvas nennen Datenschutz,
Lizenz und Quelltextdownload. Bei `cacheUserEdits: false` wird keine IndexedDB mehr
geöffnet; Lese-/Schreib-/Resetpfade beachten die deaktivierte Persistenz. Die
Standardkonfiguration verwendet keine Trackingdienste oder nicht notwendige
Browserpersistenz. Details zur Veröffentlichung stehen in docs/GITHUB_PAGES.md.
