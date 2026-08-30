$ErrorActionPreference = 'Stop'
$inputDoc = (Resolve-Path 'deliverables\Peregrino_Hackathon_Produto_e_User_Stories_Atualizado.docx').Path
$outputDir = Join-Path (Resolve-Path '.docx-work').Path 'updated-render'
New-Item -ItemType Directory -Force $outputDir | Out-Null
$outputPdf = Join-Path $outputDir 'Peregrino_Hackathon_Produto_e_User_Stories_Atualizado.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $document = $word.Documents.Open($inputDoc, $false, $true)
    try {
        $document.ExportAsFixedFormat($outputPdf, 17)
    }
    finally {
        $document.Close($false)
    }
}
finally {
    $word.Quit()
}
Write-Output $outputPdf
