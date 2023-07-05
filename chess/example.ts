import { Tile } from "../ui/GeneralTiles.tsx";
import Board from "../utils/Board.ts";

function singlePiece() {
    const piece = {}
    const board = new Board(8, {})
    board.place(piece, 4,4)
    return board
}
function renderBoard(board: Board<any>): Tile[][]  {
    const result = [] as Tile[][]
    for(let y = 0; y < board.size; y++) {
        let row = [] as Tile[]
        for(let x = 0; x < board.size; x++) {
            row.push({glyph: board.pieceAt(x, y) ? '👨' : '❄️', bg: [0,0,0]})
        }
        result.push(row)
    }
    return result
}
export {singlePiece, renderBoard}
// ice emoji: ❄️