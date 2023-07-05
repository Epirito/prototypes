const requestAnimationFrame = globalThis.requestAnimationFrame || ((_)=>{})
const maxDelay = 2000
const animationFrameRequester = (f: ()=>void, fps = 60)=>{
    let last = performance.now()
    const delta = 1000/fps
    const g = ()=>{
        const now = performance.now()
        while (now - last > delta) {
            last = Math.max(now - delta - maxDelay, last + delta)
            f()
        }
        requestAnimationFrame(g)
    }
    g()
}
export default animationFrameRequester