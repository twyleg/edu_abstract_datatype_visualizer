SET inkscape=C:\Program Files\Inkscape\bin\inkscape.com

start /b "" "%inkscape%" --export-background-opacity="0,0" --export-id="minesweeper" --export-height=32 -o "minesweeper.png" .\Minesweeper.svg

start /b "" "%inkscape%" --export-background-opacity="0,0" --export-id="minesweeper-numbers" --export-height=64 -o "minesweeper-numbers.png" .\Minesweeper.svg