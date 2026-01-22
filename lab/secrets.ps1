# Objective => identify distinct files where credentials have been found in scans from both AppScan on Cloud and Azure DevOps repos

# Suppress Node.js deprecation warnings (url.parse() in azure-devops-node-api)
$env:NODE_NO_WARNINGS = 1

try {
    $asoc = node dist/index.js apps --json | ConvertFrom-Json
    $azdo = node dist/index.js azdo-apps --json | ConvertFrom-Json

    $asoc |? {$_} |% {
        $app = node dist/index.js app $_.id --json | ConvertFrom-Json
        $dirs = node dist/index.js scans $app.id --json | ConvertFrom-Json
        $dirs |? {$_} |% {
            $dir = $_
            $issues = node dist/index.js issues $dir.id --active --json | ConvertFrom-Json
            $issues |? {$_} |? { $_.IssueTypeId -eq 'Authentication.Credentials.Unprotected'} |% {
                $issue = $_
                [pscustomobject] @{
                    src = 'ASoC'
                    type = $issue.Source
                    severity = $issue.Severity
                    location = $issue.Location
                    fingerprint = $issue.context
                    url = $issue.SourceFileUrl
                    dirId = $dir.Id
                    dirName = $dir.Name
                    dirUrl = $dir.LatestExecution.GitRepository
                    appId = $app.Id
                    appName = $app.Name
                    appUrl = $null
                    custom = [pscustomobject]$app.customFields
                    data = @{
                        issue = $issue
                        dir = $dir
                        app = $app
                    }
                }
            }
        }
    }

    $azdo |? {$_} |% {
        $app = node --no-deprecation dist/index.js azdo-app $_.id --json | ConvertFrom-Json
        $dirs = node --no-deprecation dist/index.js azdo-repos --appId $app.id --json | ConvertFrom-Json
        $dirs |? {$_} |% {
            $dir = $_
            $issues = node --no-deprecation dist/index.js azdo-issues --appId $app.id --repositoryId $dir.id --json | ConvertFrom-Json
            $issues |? {$_} |? {$_.alertType -eq 2} |% {
                $issue = $_

                [pscustomobject] @{
                    src = 'AzDO'
                    type = $issue.tools.rules.friendlyName
                    severity = switch ($issue.severity) {
                        0 { 'INFO' }
                        1 { 'LOW' }
                        2 { 'MEDIUM' }
                        3 { 'HIGH' }
                        4 { 'CRITICAL' }
                        default { [string]$issue.severity }
                    }
                    location = $issue.physicalLocations.filePath
                    fingerprint = $issue.truncatedSecret
                    url = $issue.physicalLocations.versionControl.itemUrl
                    dirId = $dir.id
                    dirName = $dir.name
                    dirUrl = $dir.webUrl
                    appId = $app.id
                    appName = $app.name
                    appUrl = $app._links | Select-Object @{n='Self';e={ $_.self.web }} | Select-Object -ExpandProperty Self
                    custom = @{}
                    data = @{
                        issue = $issue
                        dir = $dir
                        app = $app
                    }
                }
            }
        }
    }

} catch {
    Write-Error $_
}