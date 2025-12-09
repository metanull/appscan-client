try {
	Get-Command appscan
} catch {
	Write-Warning "Npm module @metanull/appscan-client not found"
	npm install -g @metanull/appscan-client
}
try {
	$apps = appscan apps --json | convertfrom-json |% {$_ | Select-Object Id, Name, Description, RiskRating, OpenIssues, ScanTechnologies }
	$scans = $apps |? {$true -or $_.Name -in ('Agora2Task (acceptance)','SAST-Translation Services')} |% { appscan scans $_.Id --json | ConvertFrom-Json} |% { $_ | Select-Object AppId, @{N='ScanId';E={$_.Id}}, AppName, @{N='ScanName';E='Name'}, Technology }
	# $issues = $scans |? {$true} |% { appscan issues $_.ScanId --json | ConvertFrom-Json }
	$scaIssues = $scans|?{$_.Technology -eq 'ScaAnalyzer'}|% { appscan issues $_.ScanId --json | ConvertFrom-Json }
	$sastIssues = $scans|?{$_.Technology -eq 'StaticAnalyzer'}|% { appscan issues $_.ScanId --json | ConvertFrom-Json }
	$dastIssues = $scans|?{$_.Technology -eq 'DynamicAnalyzer'}|% { appscan issues $_.ScanId --json | ConvertFrom-Json }

	$scaIssues | Select-Object -First 5 | ConvertTo-Json | Out-File reports\sast.json
	$sastIssues | Select-Object -First 5 | ConvertTo-Json | Out-File reports\sast.json
	$dastIssues | Select-Object -First 5 | ConvertTo-Json | Out-File reports\dast.json
} catch {
	Write-Error $_
}
