import animationFrameRequester from "../utils/animation-frame-requester.ts";
import { playerCharacter, enemy, ground, } from "./stuff.ts";
import {tick, game} from './game.ts'
function example() {
    const myPlayer = playerCharacter()
    const myGame = game(myPlayer)
    for (let i = 0; i < myGame.board.size; i++) {
        myGame.board.place(ground(), i, myGame.board.size)
    }
    myGame.board.place(myPlayer, 4, 4)
    myGame.board.place(enemy(), 7, 4)
    const updates = new EventTarget()
    const loop = ()=> {
        tick(myGame)
        updates.dispatchEvent(new Event('update'))
    }
    animationFrameRequester(loop)
    return [myGame, updates, myPlayer] as const
}
export { example };