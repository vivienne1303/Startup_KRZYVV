param([int]$Port=8765)
$root=[IO.Path]::GetFullPath($PSScriptRoot)
$listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Any,$Port)
$listener.Start()
Write-Output "TeenLaunch preview listening on port $Port"
$types=@{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.json'='application/json';'.webmanifest'='application/manifest+json';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.svg'='image/svg+xml';'.webp'='image/webp';'.ico'='image/x-icon';'.pdf'='application/pdf'}
try {
 while($true){
  $client=$listener.AcceptTcpClient()
  try {
   $client.ReceiveTimeout=4000;$client.SendTimeout=4000
   $stream=$client.GetStream();$reader=[IO.StreamReader]::new($stream,[Text.Encoding]::ASCII,$false,1024,$true)
   $first=$reader.ReadLine()
   if(!$first){continue}
   while($reader.ReadLine()){}
   $parts=$first.Split(' ');$method=$parts[0]
   $path=[Uri]::UnescapeDataString(($parts[1] -split '\?')[0]).Replace('/',[IO.Path]::DirectorySeparatorChar).TrimStart([char[]]'\/')
   if(!$path){$path='index.html'}
   $file=[IO.Path]::GetFullPath((Join-Path $root $path));$extension=[IO.Path]::GetExtension($file).ToLowerInvariant()
   $status='200 OK';$type='text/plain; charset=utf-8';$body=[Text.Encoding]::UTF8.GetBytes('Not found')
   if($method -notin @('GET','HEAD')){$status='405 Method Not Allowed'}
   elseif(!$file.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -or !$types.ContainsKey($extension) -or !(Test-Path -LiteralPath $file -PathType Leaf)){$status='404 Not Found'}
   else{$type=$types[$extension];$body=[IO.File]::ReadAllBytes($file)}
   $head=[Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n")
   $stream.Write($head,0,$head.Length)
   if($method -ne 'HEAD'){$stream.Write($body,0,$body.Length)}
   $stream.Flush()
  }catch{}finally{$client.Dispose()}
 }
}finally{$listener.Stop()}
