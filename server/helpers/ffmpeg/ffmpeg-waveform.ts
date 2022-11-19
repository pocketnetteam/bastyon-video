import { copy } from "fs-extra"
import { getFFmpeg, runCommand } from "./ffmpeg-commons"

// Generate a waveform image and replace the preview and thumbnail images
async function generateWaveform(mp3FilePath: string, previewPath: string, thumbnailPath: string) {

    let command = getFFmpeg(mp3FilePath, 'vod').output(previewPath).frames(1)
    command.complexFilter([
        {
            filter: "aformat",
            options: { channel_layouts: "mono" },
            inputs: "0:a",
            outputs: "1"
        },{
            filter: "showwavespic",
            options: { s: "960x120", colors: "#00a6ff" },
            inputs: "1",
            outputs: "fg"
        },{
            filter: "color",
            options: { s: "960x120", color: "#011621" },
            outputs: "bg"
        },{
            filter: "overlay",
            options: { format: "auto" },
            inputs: ['bg', 'fg'],
            outputs: "all"
        },{
            filter: "drawbox",
            options: { x: "(iw-w)/2", y: "(ih-h)/2",  w: "iw", h: "1", color: "#00a6ff" },
            inputs: "all"
        }
    ])

    // Generate the audio wave image with ffmpeg
    await runCommand({ command })

    // Copy the preview image to update the thumbnail
    await copy(previewPath, thumbnailPath)
}

export {
    generateWaveform
}