param([switch]$Reload)
$qa=$PSScriptRoot
$tabs=Invoke-RestMethod 'http://127.0.0.1:9223/json'
$ws=[Net.WebSockets.ClientWebSocket]::new()
$null=$ws.ConnectAsync([Uri]$tabs[0].webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
function Send-CDP($id,$method,$params){
 $json=@{id=$id;method=$method;params=$params}|ConvertTo-Json -Compress -Depth 10
 $bytes=[Text.Encoding]::UTF8.GetBytes($json)
 $null=$ws.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
 do{$buffer=New-Object byte[] 1048576;$all=[Text.StringBuilder]::new();do{$res=$ws.ReceiveAsync([ArraySegment[byte]]::new($buffer),[Threading.CancellationToken]::None).GetAwaiter().GetResult();[void]$all.Append([Text.Encoding]::UTF8.GetString($buffer,0,$res.Count))}while(!$res.EndOfMessage);$message=$all.ToString()|ConvertFrom-Json}while($message.id -ne $id)
 return $message
}
if($Reload){$null=Send-CDP 1 'Page.navigate' @{url=([Uri](Join-Path $qa 'css-audit.html')).AbsoluteUri}}
$result=Send-CDP 2 'Runtime.evaluate' @{expression="JSON.parse(document.querySelector('#report').textContent)";returnByValue=$true}
$r=$result.result.result.value
$r|ConvertTo-Json -Depth 12|Set-Content (Join-Path $qa 'css-audit-results.json')
Write-Output ('Complete: '+$r.complete+'; Cases: '+$r.results.Count)
$r.results|Where-Object {$_.missingCSS.Count -or $_.overflow.Count}|ConvertTo-Json -Depth 8
$ws.Dispose()
