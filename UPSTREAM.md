# Third-party IDE provenance

This repository vendors the full source of Martin Pabst's Online-IDE, rather
than a nested Git repository or a submodule. A normal checkout contains all
modified sources needed to build the visualizer.

- Project: https://github.com/martin-pabst/Online-IDE-new-compiler
- Original revision: c039e8a7d510fa46be3884d0f63f9a247ec93a68
- Original IDE license: GNU GPL version 3, retained in upstream/LICENSE
- Application license: GPL-3.0-only (LICENSE)
- Integration changes: UPSTREAM.patch and docs/ANALYSE.md
- Original runtime and compiler are used; no alternative Java interpreter.

The unused upstream celestial.zip download archive is excluded from this
repository. Its individual texture assets and License.txt remain included.
Assets and npm dependencies retain their own notices and license terms.
The provided DynArray implementation retains the author's attribution (Lae).
