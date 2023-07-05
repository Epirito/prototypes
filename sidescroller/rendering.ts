import { Tile } from "../ui/GeneralTiles.tsx"

import { Game, Piece } from "./game.ts"

const glyphMap = {
    ground: '🧱',
    human: '👨',
    smoke: '💨',
    zombie: '🧟',
    empty: '.'
} as Record<string, string>

export function render(game: Game): Tile[][]  {
    const result = [] as Tile[][]
    for(let y = 0; y < game.board.size; y++) {
        let row = [] as Tile[]
        for(let x = 0; x < game.board.size; x++) {
            const cosmeticAppearance = game.cosmetic.pieceAt(x, y)?.appearance
            const piece = game.board.pieceAt(x, y)
            const boardAppearance = piece?.appearance
            const glyph = glyphMap[cosmeticAppearance ?? boardAppearance ?? 'empty']
            const yellow = (strength: number) => {
                // an unbounded positive number is passed in, so we need to map it to an 24-bit rgb byte
                strength = 255 - Math.floor(255 * (1 - 1/(strength/10+1)))
                return [strength, strength, 0] as [number, number, number]
            }
            if (piece?.cooldown!==undefined) {
                row.push({glyph, bg: piece.cooldown===0 ? [255,255,255] : yellow(piece.cooldown)})
            }else {
                row.push({glyph, bg: [0,0,0]})
            }
        }
        result.push(row)
    }
    return result
}