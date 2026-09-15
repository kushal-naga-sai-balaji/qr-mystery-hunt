const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');
const gameData = require('../data/gameData');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

async function generateAllQRs(customBaseUrl = null) {
  const localIp = getLocalIpAddress();
  const port = process.env.PORT || 3840;
  const baseUrl = customBaseUrl || process.env.BASE_URL || `http://${localIp}:${port}`;

  const qrOutputDir = path.join(__dirname, '../public/qrs');
  if (!fs.existsSync(qrOutputDir)) {
    fs.mkdirSync(qrOutputDir, { recursive: true });
  }

  console.log(`📡 Generating QR Codes with Base URL: ${baseUrl}`);
  const manifest = [];

  for (const stage of gameData.stages) {
    const linkA = `${baseUrl}/stage/${stage.id}/a`;
    const linkB = `${baseUrl}/stage/${stage.id}/b`;
    const linkC = `${baseUrl}/stage/${stage.id}/c`;
    const gatewayUrl = `${baseUrl}/stage/${stage.id}`;

    // The QR payload text: Question + 3 links
    const qrPayload = [
      `🕵️ STAGE ${stage.id}: ${stage.name.toUpperCase()}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `❓ PUZZLE QUESTION:`,
      stage.qrQuestion,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Select your portal:`,
      `1) ${linkA}`,
      `2) ${linkB}`,
      `3) ${linkC}`,
      `⚠️ Only ONE portal holds the true key! (Max 2 attempts)`
    ].join('\n');

    const pngFile = `qr_stage_${stage.id}.png`;
    const svgFile = `qr_stage_${stage.id}.svg`;
    const pngPath = path.join(qrOutputDir, pngFile);
    const svgPath = path.join(qrOutputDir, svgFile);

    // Generate high resolution PNG
    await QRCode.toFile(pngPath, qrPayload, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 600,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // Generate vector SVG
    const svgString = await QRCode.toString(qrPayload, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    fs.writeFileSync(svgPath, svgString, 'utf8');

    manifest.push({
      stageId: stage.id,
      stageName: stage.name,
      pngUrl: `/qrs/${pngFile}`,
      svgUrl: `/qrs/${svgFile}`,
      links: [
        { portal: 'a', url: linkA, title: stage.portals[0].title, type: stage.portals[0].type },
        { portal: 'b', url: linkB, title: stage.portals[1].title, type: stage.portals[1].type },
        { portal: 'c', url: linkC, title: stage.portals[2].title, type: stage.portals[2].type }
      ],
      gatewayUrl,
      payloadText: qrPayload
    });

    console.log(`✅ Generated QR Stage ${stage.id}: ${pngFile} & ${svgFile}`);
  }

  const manifestPath = path.join(qrOutputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), stages: manifest }, null, 2));
  console.log(`🎉 QR Generation Complete. Manifest saved to ${manifestPath}`);
  return manifest;
}

if (require.main === module) {
  const customUrl = process.argv[2] || null;
  generateAllQRs(customUrl)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error generating QRs:', err);
      process.exit(1);
    });
}

module.exports = { generateAllQRs, getLocalIpAddress };
