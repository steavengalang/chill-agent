# chill-agent PowerShell statusline indicator
$flag = Join-Path $HOME ".chill-agent-active"
if (Test-Path $flag) {
  try {
    $data = Get-Content $flag | ConvertFrom-Json
    if ($data.active) {
      Write-Host " ◷ chill:$($data.mode) " -ForegroundColor Black -BackgroundColor Cyan -NoNewline
    }
  } catch {}
}
