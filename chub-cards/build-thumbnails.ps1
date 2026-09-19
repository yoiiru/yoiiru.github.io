Add-Type -AssemblyName System.Drawing
$thumbnailDirectory = Join-Path $PSScriptRoot 'thumbnails'
[System.IO.Directory]::CreateDirectory($thumbnailDirectory) | Out-Null
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encoderOptions = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderOptions.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
try {
    foreach ($cardFile in Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.png') {
        $sourceImage = [System.Drawing.Image]::FromFile($cardFile.FullName)
        $thumbnail = [System.Drawing.Bitmap]::new(480, 640)
        $graphics = [System.Drawing.Graphics]::FromImage($thumbnail)
        try {
            $graphics.Clear([System.Drawing.Color]::FromArgb(32, 32, 32))
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $scale = [Math]::Max(480.0 / $sourceImage.Width, 640.0 / $sourceImage.Height)
            $cropWidth = [single](480 / $scale)
            $cropHeight = [single](640 / $scale)
            $cropX = [single](($sourceImage.Width - $cropWidth) / 2)
            $cropY = [single](($sourceImage.Height - $cropHeight) / 2)
            $destination = [System.Drawing.Rectangle]::new(0, 0, 480, 640)
            $graphics.DrawImage($sourceImage, $destination, $cropX, $cropY, $cropWidth, $cropHeight, [System.Drawing.GraphicsUnit]::Pixel)
            $thumbnail.Save((Join-Path $thumbnailDirectory ($cardFile.BaseName + '.jpg')), $jpegEncoder, $encoderOptions)
        } finally {
            $graphics.Dispose()
            $thumbnail.Dispose()
            $sourceImage.Dispose()
        }
    }
} finally {
    $encoderOptions.Dispose()
}
