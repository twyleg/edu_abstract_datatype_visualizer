SET inkscape=C:\Program Files\Inkscape\bin\inkscape.exe

for %%f in (*.svg) do (
    echo %%~nf ...
	start /b "" "%inkscape%" --export-background-opacity="0,0" -o "%%~nf.png" .\%%~nf.svg
)