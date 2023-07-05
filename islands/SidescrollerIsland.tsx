
import GeneralTiles from "../ui/GeneralTiles.tsx";
import {Inputs, useRef, useState} from 'preact/hooks'
import { useEvent, useKey, useKeySetter } from "../ui/hooks.tsx";
import { Game, Piece, PlayerInput, bufferedPlayerInput, playerInput } from "../sidescroller/game.ts";
import { render } from "../sidescroller/rendering.ts";
import { initialized } from "../sidescroller/main.ts";
export default function SidescrollerIsland() {
    const gameAndUpdates = useRef<readonly [Game, EventTarget, Piece]>(initialized)
    const game = gameAndUpdates.current[0]
    const updates = gameAndUpdates.current[1]
    const onUpdate = (listener: ()=>void, inputs: Inputs)=> {useEvent(updates, 'update', listener, inputs)}
    const player = gameAndUpdates.current[2]
    const [tiles, setTiles] = useState(render(game))
    const bufferedInput = (pressed: boolean, input: keyof PlayerInput)=>{
        if (!playerInput[input] && pressed && player.cooldown) {
            bufferedPlayerInput[input] = pressed
        }
        playerInput[input] = pressed
    }
    useKeySetter('z', (pressed)=>{
        bufferedInput(pressed, 'action')
    })
    useKeySetter('ArrowLeft', (pressed)=>{
        playerInput.left = pressed
    })
    useKeySetter('ArrowRight', (pressed)=>{
        playerInput.right = pressed
    })
    useKeySetter('ArrowUp', (pressed)=>{
        bufferedInput(pressed, 'up')
    })
    onUpdate(()=>{
            setTiles(render(game))
    }, [setTiles])
    return <GeneralTiles tiles={tiles}/>
}