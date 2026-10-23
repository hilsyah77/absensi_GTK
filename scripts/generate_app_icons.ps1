param (
    [string]$SourcePath = "C:\Users\rmhqu\.gemini\antigravity-ide\brain\3f05475b-80b8-4613-b214-186b6a00cf67\.user_uploaded\media_1792740419538.png",
    [string]$ProjectRoot = "e:\presesi in_out"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
    Write-Error "Source image not found: $SourcePath"
    exit 1
}

Write-Host "Loading source image from: $SourcePath"
$sourceImg = [System.Drawing.Image]::FromFile($SourcePath)

function Resize-Image {
    param (
        [System.Drawing.Image]$img,
        [int]$targetWidth,
        [int]$targetHeight,
        [string]$outputPath,
        [double]$scaleRatio = 1.0,
        [bool]$makeRound = $false,
        [bool]$whiteBg = $false
    )

    $dir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $destBmp = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($whiteBg) {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
        $graphics.FillRectangle($brush, 0, 0, $targetWidth, $targetHeight)
        $brush.Dispose()
    } else {
        $graphics.Clear([System.Drawing.Color]::Transparent)
    }

    if ($makeRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetWidth, $targetHeight)
        $graphics.SetClip($path)
    }

    $drawW = [int]($targetWidth * $scaleRatio)
    $drawH = [int]($targetHeight * $scaleRatio)
    $offsetX = [int](($targetWidth - $drawW) / 2)
    $offsetY = [int](($targetHeight - $drawH) / 2)

    $destRect = New-Object System.Drawing.Rectangle $offsetX, $offsetY, $drawW, $drawH
    $graphics.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $destBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBmp.Dispose()
    if ($makeRound) { $path.Dispose() }

    Write-Host "Generated: $outputPath ($targetWidth x $targetHeight)"
}

# Android mipmap targets
$resRoot = Join-Path $ProjectRoot "android\app\src\main\res"

# Mipmap definitions: [density, size, fgSize]
$densities = @(
    @{ Name = "mipmap-mdpi";    Size = 48;  FgSize = 108 },
    @{ Name = "mipmap-hdpi";    Size = 72;  FgSize = 162 },
    @{ Name = "mipmap-xhdpi";   Size = 96;  FgSize = 216 },
    @{ Name = "mipmap-xxhdpi";  Size = 144; FgSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($d in $densities) {
    $folder = Join-Path $resRoot $d.Name
    
    # 1. Standard square launcher (with white background & slight padding so it looks like a clean app icon)
    $outLauncher = Join-Path $folder "ic_launcher.png"
    Resize-Image -img $sourceImg -targetWidth $d.Size -targetHeight $d.Size -outputPath $outLauncher -scaleRatio 0.90 -whiteBg $false

    # 2. Round launcher
    $outRound = Join-Path $folder "ic_launcher_round.png"
    Resize-Image -img $sourceImg -targetWidth $d.Size -targetHeight $d.Size -outputPath $outRound -scaleRatio 0.85 -makeRound $false

    # 3. Adaptive icon foreground (safe zone is ~66% - 72%)
    $outFg = Join-Path $folder "ic_launcher_foreground.png"
    Resize-Image -img $sourceImg -targetWidth $d.FgSize -targetHeight $d.FgSize -outputPath $outFg -scaleRatio 0.72 -whiteBg $false
}

# PWA icons in public/
$publicDir = Join-Path $ProjectRoot "public"
Resize-Image -img $sourceImg -targetWidth 192 -targetHeight 192 -outputPath (Join-Path $publicDir "icon-192.png") -scaleRatio 0.88
Resize-Image -img $sourceImg -targetWidth 512 -targetHeight 512 -outputPath (Join-Path $publicDir "icon-512.png") -scaleRatio 0.88
Resize-Image -img $sourceImg -targetWidth 512 -targetHeight 512 -outputPath (Join-Path $publicDir "icon-maskable-512.png") -scaleRatio 0.75
Resize-Image -img $sourceImg -targetWidth 64 -targetHeight 64 -outputPath (Join-Path $publicDir "favicon.png") -scaleRatio 0.90

$sourceImg.Dispose()
Write-Host "All icons generated successfully!"
