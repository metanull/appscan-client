pushd "C:\ITStore\phave\Dev\appscan-client"

if(-not $secretList) {
  $secretList = node dist/index.js list-azdo-secrets --include-fixed --include-dismissed --json |
    ConvertFrom-Json
}
$secretList.validationFingerprints.validationFingerprintJson |
      ConvertFrom-Json |
      group-object secret |
      Sort-Object count -Descending |<#
      select -first 10 |
      #> Select Count,Name |% {
        $alertSecret = $_.Name
        $alertCount = $_.Count
        write-warning "($alertCount) $alertSecret"

        $SearchResult = node dist/index.js azdo-search $alertSecret --json 2>$null |
            ConvertFrom-Json
        $SearchResult |
          Select -ExpandProperty Results |% {
            #write-warning $_.repository
            #write-warning $_.repository.name
            [pscustomobject]@{
                Alerts = $alertCount
                Value = $alertSecret
                Path = $_.path
                Project = $_.project | Select -ExpandProperty name
                Repository = $_.repository | Select -ExpandProperty name
                Matches = $_.matches.content.Count
            }
          } |
          Group-Object Value |% {
            [pscustomobject]@{
                Alerts = $_.Group | Select -First 1 | Select -ExpandProperty Alerts
                Value = $_.Group | Select -First 1 | Select -ExpandProperty Value
                Found = $_.Group.Matches | Measure -Sum | Select -ExpandProperty Sum
                Locations = $_.Group | Group-Object Project,Repository,Path | Select-Object -ExpandProperty Name
            }
          }
      } |
      Tee-Object -Variable CountedSecrets |
      Sort-Object Found,Alerts -Descending
