import Board from "../utils/Board.ts"
import { sum } from "../utils/vector.ts"
const maxSubTileAcc = 10
export type Cosmetic = {
    appearance: string,
    cooldown?: number,
    onCooldownEnd?: (game: Game, me: Cosmetic)=>void,
}
type IBar = {
    max: number
    current: number
    onDepleted?: (game: Game, me: Piece)=>void;
}
export class Bar {
    static subtract(game: Game, me: Piece, bar: IBar, amount: number) {
        bar.current -= amount
        if (bar.current <= 0) {
            bar.onDepleted?.(game, me)
        }
    }
}
export const hp = (max: number) => ({
    max,
    current: max,
    onDepleted: (game: Game, me: Piece)=>{
        game.board.takeOut(me)
    }
}) as Bar
export type Piece = {
    facing?: number,
    children?: Piece[],
    float?: number,
    appearance: string,
    cooldown?: number,
    hp?: Bar,
    movementCooldown?: number,
    onCooldownEnd?: (game: Game, me: Piece)=>void,
}
export type Game = {
    board: Board<Piece>,
    cosmetic: Board<Cosmetic>,
    player: Piece
}
const size = 16
export const game = (player: Piece)=> ({
    board: new Board(16, {}),
    cosmetic: new Board(16, {}),
    player,
}) as Game
export const smoke = ()=>({
    appearance: 'smoke',
    cooldown: 6,
    onCooldownEnd: (game: Game, me: Piece)=>{
        game.cosmetic.takeOut(me)
    },
})
export const walk = (game: Game, me: Piece, direction: number)=>{
    /*if (below(game, me) && direction!==0) {
        game.cosmetic.place(smoke(), ...game.board.piecePos(me)!)
    }*/
    me.facing = direction
    me.cooldown = me.movementCooldown
    return hMove(game, me, direction)
}
export const jump = (game: Game, me: Piece)=> {
    if (below(game, me)) {
        //game.cosmetic.place(smoke(), ...game.board.piecePos(me)!)
        vMove(game, me, -1)
        me.float = 2
        me.cooldown = me.movementCooldown
    }
}
export function tryPlace(game: Game, piece: Piece, pos: [number, number]) {
    if (game.board.pieceAt(...pos)) return true
    game.board.place(piece, ...pos)
    return false
}
export function atomicTryPlace(game: Game, transaction: {piece: Piece, pos: [number, number]}[]) {
    const oldPositions = [] as [number, number][]
    for(const {piece} of transaction) {
        oldPositions.push(game.board.piecePos(piece)!)
        game.board.takeOut(piece)

    }
    for(const {pos} of transaction) {
        if (game.board.pieceAt(...pos)) {
            transaction.forEach(({piece}, i)=>{
                game.board.place(piece, ...oldPositions[i])
            })
            return true
        }
    }
    for(const {piece, pos} of transaction) {
        game.board.place(piece, ...pos)
    }
    return false
}
const axisMove = (axis: 0|1) => (game: Game, character: Piece, direction: number) => {
    const delta = [0,0] as [number, number]
    delta[axis] = direction
    const deltaIncrement = (x: [number, number])=>sum(x, delta)
    return atomicTryPlace(game, [...(character?.children ?? []), character].map(x=>({
        piece: x, 
        pos: deltaIncrement(game.board.piecePos(x)!)
    })))
}
const gravityCooldown = 10
export const hMove = axisMove(0)
export const vMove = axisMove(1)
export const characterCooldownEnd = (
        takeAction: (game: Game, character: Piece)=>void
    ) => (game: Game, character: Piece) => {
    takeAction(game, character)
    if (!below(game, character)) {
        if (character.cooldown && character.float!==undefined && character.float>0) {
            character.float--
        }else {
            vMove(game, character, 1)
            character.cooldown = gravityCooldown
        }
    }
}
export type PlayerInput = {
    right: boolean,
    left: boolean,
    up: boolean,
    action: boolean
}
export const playerInput = {
    get xAxis() {
        return (this.right ? 1 : 0) - (this.left ? 1 : 0)
    },
    right: false,
    left: false,
    up: false,
    action: false
}
export const bufferedPlayerInput = {
    right: false,
    left: false,
    up: false,
    action: false
}
export function runCooldown(game: Game, piece: Piece) {
    if (piece.cooldown!==undefined) {
        if (piece.cooldown===0) {
            piece.onCooldownEnd?.(game, piece)
        }
        piece.cooldown = Math.max(0, piece.cooldown - 1)
    }
}
export function tick(game: Game) {
    game.board.forEachPiece(piece=>{
        runCooldown(game, piece)
    })
    game.cosmetic.forEachPiece(piece=>{
        runCooldown(game, piece)
    })
}

export function below(game: Game, piece: Piece) {
    const pos = game.board.piecePos(piece)
    if (!pos) return undefined
    return game.board.pieceAt(pos[0], pos[1]+1)
}
function inFrontOf(game: Game, me: Piece) {
    const pos = game.board.piecePos(me)
    if (!pos) return undefined
    return game.board.pieceAt(pos[0]+me.facing!, pos[1])
}
export const strike = (game: Game, me: Piece) => {
    const target = inFrontOf(game, me)
    if (target?.cooldown!==undefined) {
        target.cooldown = target.movementCooldown
        hMove(game, target, me.facing!)
    }
    if (target?.hp!==undefined) {

    }
    me.cooldown = me.movementCooldown
}