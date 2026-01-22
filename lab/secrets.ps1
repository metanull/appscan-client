# Objective => identify distinct files where credentials have been found in scans from both AppScan on Cloud and Azure DevOps repos

try {
    $asoc = node dist/index.js apps --json | ConvertFrom-Json # | Select-Object -First 3
    $azdo = node dist/index.js azdo-apps --json | ConvertFrom-Json # | Select-Object -First 3

    $asoc |% {
        $app = node dist/index.js app $_.id --json | ConvertFrom-Json
        $dirs = node dist/index.js scans $app.id --json | ConvertFrom-Json
        $dirs |% {
            $dir = $_
            $issues = node dist/index.js issues $dir.id --active --json | ConvertFrom-Json
            $issues |? { $_.IssueTypeId -eq 'Authentication.Credentials.Unprotected'} |% {
                $issue = $_

                [pscustomobject] @{
                    src = 'ASoC'
                    issue = $issue
                    dir = $dir
                    app = $app
                    links = [pscustomobject]@{
                    }
                }
            }
        }
    }

    $azdo |% {
        $app = node dist/index.js azdo-app $_.id --json | ConvertFrom-Json
        $dirs = node dist/index.js azdo-repos --appId $app.id --json | ConvertFrom-Json
        $dirs |% {
            $dir = $_
            $issues = node dist/index.js azdo-issues --appId $app.id --repositoryId $dir.id --json | ConvertFrom-Json
            $issues |? {$_.alertType -eq 2} |% {
                $issue = $_

                [pscustomobject] @{
                    src = 'AzDO'
                    issue = $issue
                    dir = $dir
                    app = $app
                    links = [pscustomobject]@{
                        app = $app._links | Select-Object @{n='Self';e={ $_.self.web }}
                        dir = $dir.webUrl
                    }
                }
            }
        }
    }

} catch {
    Write-Error $_
}