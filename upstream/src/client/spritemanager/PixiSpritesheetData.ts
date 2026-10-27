export type PixiSpritesheetData = {
    frames: {
        [name: string]: {
            frame: { x: number, y: number, w: number, h: number },
            rotated: boolean,
            trimmed: boolean,
            spriteSourceSize: { x: number, y: number, w: number, h: number },
            sourceSize: { w: number, h: number },
            pivot: { x: number, y: number },
            isSystemSpritesheet?: boolean
        }
    },
    meta: {
        app: string,
        version: string,
        image: string,
        format: "RGBA8888",
        size: { w: number, h: number },
        scale: string
    }
}