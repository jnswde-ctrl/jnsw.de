param(
  [int]$Port = 3000,
  [int]$CheckIntervalSeconds = 10
)

try {
  $ErrorActionPreference = 'Stop'

  function Write-Activity([string]$Message, [ConsoleColor]$Color = 'Gray') {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
  }

  function Test-LocalSite {
    Write-Activity "Prüfe http://localhost:$Port/ …" 'DarkGray'
    try {
      $response = Invoke-WebRequest -UseBasicParsing "http://localhost:$Port/" -TimeoutSec 4
      $isHealthy = $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
      if ($isHealthy) { Write-Activity "Instanz erreichbar (HTTP $($response.StatusCode))." 'Green' }
      else { Write-Activity "Instanz antwortet mit HTTP $($response.StatusCode)." 'Yellow' }
      return $isHealthy
    } catch {
      Write-Activity "Instanz nicht erreichbar: $($_.Exception.Message)" 'Red'
      return $false
    }
  }

  Write-Activity 'Starte reine Überwachung. Es wird keine Instanz gestartet oder beendet.' 'Cyan'
  if (-not (Test-LocalSite)) {
    Write-Activity 'Bitte starte die Website zuerst separat und führe dann dieses Skript erneut aus.' 'Yellow'
    Read-Host 'Enter drücken zum Schließen'
    exit 1
  }

  Write-Activity "Überwachung aktiv. Prüfrhythmus: $CheckIntervalSeconds Sekunden. Mit Strg+C beenden." 'Cyan'
  while ($true) {
    Write-Activity "Warte $CheckIntervalSeconds Sekunden bis zur nächsten Prüfung …" 'DarkGray'
    Start-Sleep -Seconds $CheckIntervalSeconds
    if (-not (Test-LocalSite)) {
      Write-Activity 'Überwachung beendet, weil die Instanz ausgefallen ist.' 'Red'
      Read-Host 'Enter drücken zum Schließen'
      exit 1
    }
  }
}
catch {
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Fehler: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host 'Enter drücken zum Schließen'
}