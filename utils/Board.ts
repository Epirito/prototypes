import BiMap from "./bi-map.ts";
import { numberHash, numberHashReverse } from "./vector.ts";


export default class Board<T extends Record<string, unknown>> {
    piecesByPosHash: BiMap<number, T>
    posHash: (pos: [number, number])=>number
    posHashReverse: (hash: number)=>[number, number]
    constructor(readonly size: number, readonly outOfBounds: T) {
        this.piecesByPosHash = new BiMap<number, T>()
        this.posHash = numberHash(size)
        this.posHashReverse = numberHashReverse(size)
    }
    pieceAt(x: number, y: number) {
        if (x<0 || x>=this.size || y<0 || y>=this.size) return this.outOfBounds
        return this.piecesByPosHash.get(this.posHash([x, y]))
    }
    place(piece: T, x: number, y: number) {
        if (x<0 || x>=this.size || y<0 || y>=this.size) return
        this.piecesByPosHash.set(this.posHash([x, y]), piece)
    }
    takeOut(piece: T) {
        this.piecesByPosHash.deleteByValue(piece)
    }
    piecePos(T: T) {
        const posHash = this.piecesByPosHash.getByValue(T)  
        return posHash ? this.posHashReverse(posHash) : undefined
    }
    forEachPiece(callback: (piece: T, pos: [number, number])=>void) {
        this.piecesByPosHash.forEach((piece, posHash) => {
            callback(piece, this.posHashReverse(posHash))
        })
    }
}