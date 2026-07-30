$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$captureDir = Join-Path $root "tmp\pdfs\html-wireframes"
$previewDir = Join-Path $root "tmp\pdfs\wireframe-site"
New-Item -ItemType Directory -Force -Path $captureDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $previewDir "pages") | Out-Null

$files = @(
    Get-ChildItem -LiteralPath $root -Filter "*.html" -File
    Get-ChildItem -LiteralPath (Join-Path $root "pages") -Filter "*.html" -File
) | Sort-Object FullName

$index = 0
foreach ($file in $files) {
    $index++
    $relative = $file.FullName.Substring($root.Length + 1).Replace("\", "/")
    $slug = $relative.Replace("/", "__").Replace(".html", "")
    $output = Join-Path $captureDir ("{0:D2}__{1}.png" -f $index, $slug)
    $html = Get-Content -LiteralPath $file.FullName -Raw
    $html = $html -replace '(?is)<script[^>]+src=["''][^"'']*auth-guard\.js["''][^>]*>\s*</script>', ''
    $base = if ($relative.StartsWith("pages/")) {
        '<base href="http://127.0.0.1:4173/pages/">'
    } else {
        '<base href="http://127.0.0.1:4173/">'
    }
    $previewState = if ($relative -ne "pages/auth.html") {
        '<script>localStorage.setItem("teenlaunch_token","wireframe-preview");localStorage.setItem("teenlaunch_user",JSON.stringify({id:"wireframe-user",email:"student@teenlaunch.app",name:"Jennie Tan",role:"student"}));</script>'
    } else {
        ''
    }
    $html = $html -replace '(?i)<head>', ("<head>`r`n  " + $base + "`r`n  " + $previewState)
    $previewFile = Join-Path $previewDir $relative.Replace("/", "\")
    Set-Content -LiteralPath $previewFile -Value $html -Encoding UTF8
    $previewRelative = $previewFile.Substring($root.Length + 1).Replace("\", "/")
    $url = "http://127.0.0.1:4173/" + $previewRelative

    & $chrome `
        --headless=new `
        --disable-gpu `
        --hide-scrollbars `
        --force-device-scale-factor=1 `
        --window-size=1440,1000 `
        --screenshot="$output" `
        "$url" | Out-Null

    if (-not (Test-Path -LiteralPath $output)) {
        throw "Screenshot was not created for $relative"
    }
    Write-Output ("{0:D2}/{1:D2} {2}" -f $index, $files.Count, $relative)
}
