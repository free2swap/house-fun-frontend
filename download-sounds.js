const https = require('https');
const fs = require('fs');
const path = require('path');

const sounds = [
    { url: 'https://freesound.org/data/previews/209/209224_2282212-lq.mp3', name: 'chip.mp3' },
    { url: 'https://freesound.org/data/previews/209/209241_2282212-lq.mp3', name: 'heartbeat.mp3' },
    { url: 'https://freesound.org/data/previews/320/320181_5260872-lq.mp3', name: 'win.mp3' }
];

const dir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

sounds.forEach(sound => {
    const dest = path.join(dir, sound.name);
    const file = fs.createWriteStream(dest);
    https.get(sound.url, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${sound.name}`);
        });
    }).on('error', err => {
        fs.unlink(dest);
        console.error(`Error downloading ${sound.name}: ${err.message}`);
    });
});
