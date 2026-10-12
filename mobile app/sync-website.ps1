$root = Join-Path $PSScriptRoot 'site'
$base = [Uri]'https://www.teenlaunch.app/'
$pending = [Collections.Generic.Queue[string]]::new()
$seen = [Collections.Generic.HashSet[string]]::new()
$failures = [Collections.Generic.List[string]]::new()
@('index.html','js/home-simplified.js','pages/about.html','pages/help.html','pages/career_dna_test.html','pages/my-journey.html','pages/portfolio-builder.html','pages/career-copilot.html','pages/settings.html','assets/icons/app_icon.png') | ForEach-Object { $pending.Enqueue($_) }
while ($pending.Count -gt 0 -and $seen.Count -lt 240) {
 $path = $pending.Dequeue()
 if (!$seen.Add($path)) { continue }
 try {
  $uri = [Uri]::new($base,$path)
  $dest = Join-Path $root $path
  New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
  Invoke-WebRequest -Uri $uri -OutFile $dest -UseBasicParsing -TimeoutSec 20
  if ($path -match '\.(html|css|js)$') {
   $content = [IO.File]::ReadAllText($dest)
   $pattern = '(?:src|href)\s*=\s*["'']([^"'']+)["'']|url\(["'']?([^\)"'' ]+)|["'']((?:\.?\.?/)?(?:pages|js|css|data|assets|components)/[^"''`<>\s]+)["'']'
   foreach ($match in [regex]::Matches($content,$pattern)) {
    $ref = ($match.Groups | Select-Object -Skip 1 | Where-Object Success | Select-Object -First 1).Value
    try {
     $link = [Uri]::new($uri,$ref)
     $child = $link.AbsolutePath.TrimStart('/')
     if ($link.Host -eq $base.Host -and $child -match '\.(html|css|js|json|png|jpg|jpeg|svg|webp|ico|pdf)$' -and !$seen.Contains($child)) { $pending.Enqueue($child) }
    } catch {}
   }
  }
 } catch { $failures.Add($path) }
}
@{checked=$seen.Count; failures=@($failures)} | ConvertTo-Json | Set-Content (Join-Path $PSScriptRoot 'download-report.json')
Write-Output "Downloaded $($seen.Count-$failures.Count) files. Failed: $($failures -join ', ')"
