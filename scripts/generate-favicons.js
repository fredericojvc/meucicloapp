const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminho da imagem matriz enviada pelo usuário
const sourceImage = 'C:/Users/fjvca/.gemini/antigravity/brain/4f0bf770-131c-4196-b8f2-f9007ced6430/.user_uploaded/media_1795449645061_b9c8c00e.jpg';
const publicDir = path.resolve('public');
const tempDir = path.resolve('temp_icons');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 1. Script PowerShell para gerar as versões PNG em alta qualidade via .NET System.Drawing
const psScript = `
Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile('${sourceImage}')

function Save-Resized-Png($srcImg, $width, $height, $outPath, $bgColorHex = $null) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($bgColorHex) {
        $color = [System.Drawing.ColorTranslator]::FromHtml($bgColorHex)
        $g.Clear($color)
    }

    $g.DrawImage($srcImg, 0, 0, $width, $height)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Gerado: $outPath ($($width)x$($height))"
}

# 1.1 Gerar os tamanhos oficiais na pasta public
Save-Resized-Png $src 512 512 '${publicDir.replace(/\\/g, '/')}/icon-512.png'
Save-Resized-Png $src 192 192 '${publicDir.replace(/\\/g, '/')}/icon-192.png'
Save-Resized-Png $src 180 180 '${publicDir.replace(/\\/g, '/')}/apple-touch-icon.png' '#0B192C'
Save-Resized-Png $src 96 96 '${publicDir.replace(/\\/g, '/')}/favicon-96x96.png'

# 1.2 Gerar os frames para compor o favicon.ico (16, 32, 48)
Save-Resized-Png $src 48 48 '${tempDir.replace(/\\/g, '/')}/icon-48.png'
Save-Resized-Png $src 32 32 '${tempDir.replace(/\\/g, '/')}/icon-32.png'
Save-Resized-Png $src 16 16 '${tempDir.replace(/\\/g, '/')}/icon-16.png'

$src.Dispose()
`;

fs.writeFileSync(path.join(tempDir, 'generate.ps1'), psScript, 'utf8');

console.log('Executando geração via PowerShell / System.Drawing...');
execSync(`powershell -ExecutionPolicy Bypass -File "${path.join(tempDir, 'generate.ps1')}"`, { stdio: 'inherit' });

// 2. Empacotar favicon.ico contendo 16x16, 32x32 e 48x48 em formato ICO padrão com payloads PNG
function createIco(images) {
  // images: array of { width, height, buffer }
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = count * dirEntrySize;
  let currentOffset = headerSize + dirSize;

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0); // width
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image data size
    entry.writeUInt32LE(currentOffset, 12); // image data offset
    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(count, 4); // number of images

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

const p16 = fs.readFileSync(path.join(tempDir, 'icon-16.png'));
const p32 = fs.readFileSync(path.join(tempDir, 'icon-32.png'));
const p48 = fs.readFileSync(path.join(tempDir, 'icon-48.png'));

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: p16 },
  { width: 32, height: 32, buffer: p32 },
  { width: 48, height: 48, buffer: p48 }
]);

const icoPath = path.join(publicDir, 'favicon.ico');
fs.writeFileSync(icoPath, icoBuffer);
console.log(`✓ Gerado: ${icoPath} (${icoBuffer.length} bytes, contendo 16x16, 32x32, 48x48)`);

// Limpar pasta temporária
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('✓ Concluído com sucesso!');
