# PowerShell script to fix MUI Grid v2 migration issues
# This script converts deprecated Grid props (xs, sm, md, lg, xl) to the new size prop

Write-Host "🔄 Starting MUI Grid v2 migration fix..." -ForegroundColor Cyan

# Get all TypeScript and JavaScript files in src directory
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.jsx", "*.ts", "*.js" | Where-Object { $_.Name -notlike "*node_modules*" }

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "📁 Found $totalFiles files to process..." -ForegroundColor Yellow

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Processing MUI Grid Migration" -Status "Processing: $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    # Pattern 1: <Grid item xs={...}> -> <Grid size={...}>
    if ($content -match '<Grid\s+item\s+xs=\{(\d+)\}\s*>') {
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s*>', '<Grid size={$1}>'
        $modified = $true
        Write-Host "  ✓ Fixed single xs prop in $($file.Name)" -ForegroundColor Green
    }
    
    # Pattern 2: <Grid item xs={...} sm={...}> -> <Grid size={{ xs: ..., sm: ... }}>
    if ($content -match '<Grid\s+item\s+((?:xs|sm|md|lg|xl)=\{[^}]+\}\s*)+>') {
        # Complex regex to handle multiple breakpoint props
        $content = $content -replace '<Grid\s+item\s+((?:xs|sm|md|lg|xl)=\{[^}]+\}\s*)+>', {
            param($match)
            $props = $match.Groups[1].Value
            
            # Extract individual props
            $propsArray = @()
            $xs = if ($props -match 'xs=\{([^}]+)\}') { "xs: $($matches[1])" } else { $null }
            $sm = if ($props -match 'sm=\{([^}]+)\}') { "sm: $($matches[1])" } else { $null }
            $md = if ($props -match 'md=\{([^}]+)\}') { "md: $($matches[1])" } else { $null }
            $lg = if ($props -match 'lg=\{([^}]+)\}') { "lg: $($matches[1])" } else { $null }
            $xl = if ($props -match 'xl=\{([^}]+)\}') { "xl: $($matches[1])" } else { $null }
            
            # Build size object
            $sizeProps = @($xs, $sm, $md, $lg, $xl) | Where-Object { $_ }
            
            if ($sizeProps.Count -eq 1 -and $xs -and $xs -match 'xs: (\d+)') {
                "<Grid size={$($matches[1])}>"
            } else {
                "<Grid size={{ $($sizeProps -join ', ') }}>"
            }
        }
        $modified = $true
    }
    
    # Pattern 3: Handle items without explicit breakpoints
    $content = $content -replace '<Grid\s+item\s*>', '<Grid>'
    
    if ($content -ne $originalContent) {
        $modified = $true
    }
    
    if ($modified) {
        try {
            Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $modifiedFiles++
            Write-Host "  ✅ Updated: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error updating $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Progress -Activity "Processing MUI Grid Migration" -Completed

Write-Host "`n🎉 Migration completed!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Processed files: $processedFiles" -ForegroundColor White
Write-Host "  • Modified files: $modifiedFiles" -ForegroundColor Yellow
Write-Host "  • Success rate: $([math]::Round(($modifiedFiles / $processedFiles) * 100, 2))%" -ForegroundColor Green

if ($modifiedFiles -gt 0) {
    Write-Host "`n⚠️  Please review the changes and test your application!" -ForegroundColor Yellow
    Write-Host "🔗 Reference: https://mui.com/material-ui/migration/upgrade-to-grid-v2/" -ForegroundColor Blue
}
