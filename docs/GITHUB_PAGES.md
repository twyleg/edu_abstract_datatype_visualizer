# GitHub Pages veröffentlichen

Vorgesehenes Repository: `twyleg/edu_abstract_datatype_visualizer`.
Vorgesehene Adresse: https://twyleg.github.io/edu_abstract_datatype_visualizer/

## Erstes Hochladen

Die gesamte IDE ist als normale Quelldateien unter `upstream/` enthalten. Dort
befindet sich absichtlich kein verschachteltes `.git` und kein Git-Submodule.
Auch `upstream/package-lock.json` muss in den ersten Commit aufgenommen werden.
Abhängigkeiten, Builds und die redundante ungenutzte Datei `celestial.zip`
werden ignoriert. Die einzelnen tatsächlich benötigten Assets bleiben enthalten.

Repository auf GitHub zunächst leer anlegen. Dann zum Beispiel:

```sh
git add .
git commit -m "Initial visualizer with GitHub Pages deployment"
git branch -M main
git remote add origin https://github.com/twyleg/edu_abstract_datatype_visualizer.git
git push -u origin main
```

Falls bereits ein Remote oder Commit vorhanden ist, diese Schritte entsprechend
überspringen. Es wurden durch die Vorbereitung keine Commits oder Pushes ausgeführt.

## Pages aktivieren

Im GitHub-Repository unter **Settings → Pages → Build and deployment → Source**
**GitHub Actions** auswählen. Die Datei `.github/workflows/pages.yml` baut bei
Pushes auf `main` oder `master` sowie auf Pull Requests. Nur die Standardbranch
wird veröffentlicht. Der Workflow kann außerdem manuell gestartet werden.
Falls die erste Ausführung vor dem Aktivieren von Pages scheitert, nach dem
Aktivieren in Actions erneut starten.

Der Build installiert Node 22 und exakt die eingecheckten Abhängigkeiten, prüft
TypeScript und Tests, erstellt die Website und testet sie mit Chromium unter
`/edu_abstract_datatype_visualizer/`. Danach wird ausschließlich der fertige
Ordner `upstream/dist-visualizer/` als Pages-Artifact übertragen. Deployments
verwenden GitHubs `github-pages`-Umgebung und den integrierten Token; ein eigener
Deploy-Schlüssel oder Personal Access Token ist nicht erforderlich.

Der relative Vite-Basispfad unterstützt sowohl die Projektadresse unter einem
Unterpfad als auch eine spätere eigene Domain. `index.html` ist der Einstieg;
`visualizer.html` bleibt erreichbar. Für eine eigene Domain zuerst die Domain in
GitHub konfigurieren; es wird absichtlich keine erfundene CNAME-Datei mitgeliefert.

## GPL-Quelltext und Hinweise

`npm run build:pages` erstellt neben dem Build eine `source.zip` aus genau dem
gebauten Git-Commit, `LICENSE.txt`, `UPSTREAM.md`, `THIRD_PARTY_NOTICES.txt` und
`build-info.json`. Die Quelltextdateien einschließlich Buildwerkzeugen und
Lockdateien müssen daher vor dem Pages-Build committed sein. Die Informations-
Schaltfläche neben den Zoom-Tasten und `privacy.html` verlinken diese Downloads.
Es wird kein fremder unveränderter Upstream-Stand als Ersatz für die angepassten
Quellen angeboten.

Lokale Prüfung nach einem Commit:

```sh
npm ci
npm run build:pages
cd upstream
npx playwright install chromium
cd ..
npm run test:pages
```

Der Smoke-Test startet selbst einen statischen Server auf einem freien Port.
Er prüft den Repository-Unterpfad, IDE und Webworker, einen normalen Java-Lauf,
Downloads, fehlende Ressourcen, externe Startanfragen und Browserspeicher.
Für normale Entwicklung bleibt `npm run dev` verfügbar; `npm run build` allein
baut die Anwendung, ohne das veröffentlichungsbezogene Quellarchiv zu erzeugen.

## Datenschutz / Cookie-Banner

Die mitgelieferte Konfiguration hat keine Cookies, Analytics oder Werbung.
Editor-Caching ist deaktiviert; die IDE öffnet dann auch keine IndexedDB mehr.
Replay und Einstellungen bleiben im Arbeitsspeicher. Assets, Fonts und Worker
werden selbst gehostet. Daher wird für diese Konfiguration kein optionaler
Consent-Banner eingebaut. Das normale Abrufen und Cachen notwendiger Webdateien
bleibt Teil des ausdrücklich gewünschten Dienstes (§ 25 Abs. 2 TDDDG).

`upstream/public/privacy.html` nennt das GitHub-Konto `twyleg` und
`mail@twyleg.de`, erläutert die lokale Verarbeitung und GitHub Pages als Hoster.
GitHub protokolliert IP-Adressen für Sicherheitszwecke. Diese Hosting-Verarbeitung
ist von Cookies oder Tracking in der Anwendung zu unterscheiden. Eigene
Schülerprogramme können bei Nutzung von Netzwerk-APIs selbst Anfragen auslösen.
Wer später Speichern, Analytics, externe Inhalte oder andere Dienste aktiviert,
muss die Datenschutzinformationen und den Einwilligungsbedarf neu bewerten.

Quellen:

- [GitHub: Custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection)
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)
