
import { Game, Piece,walk, characterCooldownEnd, playerInput, jump, bufferedPlayerInput, strike, PlayerInput, hp } from "./game.ts"
const playerAction = (game: Game, player: Piece) => {
    if (playerInput.action || bufferedPlayerInput.action) {
        strike(game, player)
    }else
    if (playerInput.up || bufferedPlayerInput.up) {
        jump(game, player)
    }else if (playerInput.xAxis !== 0) {
        walk(game, player, playerInput.xAxis)
    }
    for(const input in bufferedPlayerInput) {
        bufferedPlayerInput[input as keyof PlayerInput] = false
    }

}
const followPlayer = (game: Game, me: Piece)=>{
    const playerPos = game.board.piecePos(game.player)!
    const myPos = game.board.piecePos(me)!
    const diff = playerPos[0] - myPos[0]
    if (Math.abs(diff)===1) {
        strike(game, me)
    }else {
        walk(game, me, Math.sign(diff))
    }
}
export const playerCharacter = ()=>({
    appearance: 'human',
    facing: 1,
    cooldown: 0,
    movementCooldown: 10,
    onCooldownEnd: characterCooldownEnd(playerAction),
})
export const ground = ()=>({
    appearance: 'ground',
})
export const projectile = (appearance: string, movementCooldown: number) => (direction: number) => ({
    appearance,
    cooldown: movementCooldown,
    movementCooldown,
    onCooldownEnd: (game: Game, me: Piece)=>{
        walk(game, me, direction)
    },
})
export const water = projectile('drop', 3)


export const enemy = ()=>({
    appearance: 'zombie',
    cooldown: 20,
    movementCooldown: 40,
    hp: hp(2),
    onCooldownEnd: characterCooldownEnd(followPlayer),
})