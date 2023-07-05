import { JSX } from "preact/jsx-runtime";
export type Tile = {glyph: string, bg: [number, number, number]}
export default function GeneralTiles(props: {
    tiles: Tile[][], 
    onMouseDown?: (pos: [number, number])=>void, 
    onMouseMove?: (pos: [number, number] | undefined)=>void, 
    onMouseUp?: (pos: [number, number])=>void}) {
    const tiles = props.tiles
    const onMouseDown = props.onMouseDown
    const onMouseMove = props.onMouseMove
    const onMouseUp = props.onMouseUp
    return (<div
        onMouseLeave={()=>{onMouseMove?.(undefined)}}
        style={{
        userSelect: 'none', 
        fontFamily: 'Courier New', 
        gridTemplateColumns: `repeat(${tiles[0].length}, 20px)`, 
        gridTemplateRows: `repeat(${tiles.length}, 20px)`, 
        gap: 0,
        display: 'grid', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 'fit-content'
    }}>
        {([] as JSX.Element[]).concat(...tiles.map((row, y) => 
            row.map((tile, x) => (
            <div 
                onMouseEnter={()=>{onMouseMove?.([x, y])}} 
                onMouseDown={(e)=>{
                    e.preventDefault()
                    onMouseDown?.([x, y])
                }}
                onMouseUp={(e)=>{
                    e.preventDefault()
                    onMouseUp?.([x, y])
                }}
                style={{backgroundColor: `rgba(${tile.bg.join(',')})`, width: "100%", height: "100%", textAlign: "center"}}>
                {tile.glyph}
            </div> 
            ))))}
    </div>)
}