# Reuse the existing TeenLaunch logo for native launcher/splash resources.
Add-Type -AssemblyName System.Drawing
$mobileRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$resRoot = Join-Path $mobileRoot 'android/app/src/main/res'
$logo = [Drawing.Image]::FromFile((Join-Path $mobileRoot 'site/assets/icons/app_icon.png'))
function Save-LogoCanvas([string]$Target, [int]$Width, [int]$Height, [int]$LogoSize) {
  $canvas = [Drawing.Bitmap]::new($Width, $Height)
  $graphics = [Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([Drawing.Color]::White)
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $ratio = [Math]::Min($LogoSize / $logo.Width, $LogoSize / $logo.Height)
    $drawWidth = [int]($logo.Width * $ratio)
    $drawHeight = [int]($logo.Height * $ratio)
    $graphics.DrawImage($logo, [int](($Width-$drawWidth)/2), [int](($Height-$drawHeight)/2), $drawWidth, $drawHeight)
    $canvas.Save($Target, [Drawing.Imaging.ImageFormat]::Png)
  } finally { $graphics.Dispose(); $canvas.Dispose() }
}
try {
  foreach ($density in @(@('mdpi',1),@('hdpi',1.5),@('xhdpi',2),@('xxhdpi',3),@('xxxhdpi',4))) {
    $dir = Join-Path $resRoot ('mipmap-' + $density[0])
    $size = [int](48 * $density[1])
    Save-LogoCanvas (Join-Path $dir 'ic_launcher.png') $size $size ([int]($size*.82))
    Save-LogoCanvas (Join-Path $dir 'ic_launcher_round.png') $size $size ([int]($size*.72))
    $foreground = [int](108 * $density[1])
    Save-LogoCanvas (Join-Path $dir 'ic_launcher_foreground.png') $foreground $foreground ([int](60*$density[1]))
  }
  foreach ($splash in Get-ChildItem -LiteralPath $resRoot -Recurse -Filter splash.png) {
    $original = [Drawing.Image]::FromFile($splash.FullName)
    $width = $original.Width; $height = $original.Height; $original.Dispose()
    Save-LogoCanvas $splash.FullName $width $height ([int]([Math]::Min($width,$height)*.3))
  }
  Write-Output 'TeenLaunch Android launcher and splash resources prepared.'
} finally { $logo.Dispose() }
