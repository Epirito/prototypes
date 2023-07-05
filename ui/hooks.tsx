import {useEffect, useState, Inputs} from 'preact/hooks'
export function useDOMEvent<T extends keyof DocumentEventMap>(eventName: T, listener: (e: DocumentEventMap[T]) => void, inputs: Inputs) {
    useEffect(() => {
        document.addEventListener(eventName, listener);
        return () => {
            document.removeEventListener(eventName, listener);
        }
    }, inputs);
}
export function useEvent(eventTarget: EventTarget, eventName: string, listener: (e: Event) => void, inputs: Inputs) {
    useEffect(() => {
        eventTarget.addEventListener(eventName, listener);
        return () => {
            eventTarget.removeEventListener(eventName, listener);
        }
    }, inputs);
}
export function useKey(key: string) {
    const [isDown, setIsDown] = useState(false)
    useDOMEvent('keydown', (e) => {
        if (e.key === key) {
            setIsDown(true)
        }
    }, [setIsDown]);
    useDOMEvent('keyup', (e) => {
        if (e.key === key) {
            setIsDown(false)
        }
    }, [setIsDown]);
    return isDown
}
export function useKeySetter(key: string, setPressed: (pressed: boolean) => void) {
    useDOMEvent('keydown', (e) => {
        if (e.key === key) {
            setPressed(true)
        }
    }, [setPressed]);
    useDOMEvent('keyup', (e) => {
        if (e.key === key) {
            setPressed(false)
        }
    }, [setPressed]);
}