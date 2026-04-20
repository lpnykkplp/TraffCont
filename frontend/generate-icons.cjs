const { Jimp } = require("jimp");
const path = require("path");

async function generateIcons() {
    try {
        console.log("Reading icon.jpg...");
        const image = await Jimp.read(path.join(__dirname, "public", "icon.jpg"));
        
        console.log("Resizing 192x192...");
        image.resize({ w: 192, h: 192 });
        await image.write(path.join(__dirname, "public", "pwa-192x192.png"));
        
        console.log("Resizing 512x512...");
        const image2 = await Jimp.read(path.join(__dirname, "public", "icon.jpg"));
        image2.resize({ w: 512, h: 512 });
        await image2.write(path.join(__dirname, "public", "pwa-512x512.png"));
        
        console.log("Resizing for favicon (64x64)...");
        const image3 = await Jimp.read(path.join(__dirname, "public", "icon.jpg"));
        image3.resize({ w: 64, h: 64 });
        await image3.write(path.join(__dirname, "public", "favicon.png"));

        console.log("Resizing for apple touch icon (180x180)...");
        const image4 = await Jimp.read(path.join(__dirname, "public", "icon.jpg"));
        image4.resize({ w: 180, h: 180 });
        await image4.write(path.join(__dirname, "public", "apple-touch-icon.png"));

        console.log("Icons generated successfully!");
    } catch (error) {
        console.error("Error generating icons:", error);
    }
}

generateIcons();
