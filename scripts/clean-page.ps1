$f = "D:\Visa Project\1-5-26\visa\src\app\(supplier)\supplier\applications\[id]\page.tsx"
$lines = [System.IO.File]::ReadAllLines($f)
$idx = 0
for ($i = $lines.Count - 1; $i -ge 0; $i--) {
    if ($lines[$i] -eq '"use client";') { $idx = $i; break }
}
$kept = $lines[$idx..($lines.Count - 1)]
[System.IO.File]::WriteAllLines($f, $kept, [System.Text.Encoding]::UTF8)
Write-Host "Done. Kept $($kept.Count) lines (started at line $($idx+1))"
