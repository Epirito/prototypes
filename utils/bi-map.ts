export default class BiMap<T0, T1> {
    private from0: Map<T0, T1>
    private from1: Map<T1, T0>
    constructor() {
        this.from0 = new Map()
        this.from1 = new Map()
    }
    get(key: T0) {return this.from0.get(key)}
    getByValue(value: T1) {return this.from1.get(value)}
    set(key: T0, value: T1) {
        const currentKey = this.getByValue(value)
        if (currentKey) {
            this.delete(currentKey)
        }
        const currentValue = this.get(key)
        if (currentValue) {
            this.delete(key)
        }
        this.from0.set(key, value)
        this.from1.set(value, key)
    }
    delete(key: T0) {
        const value = this.get(key)
        if (value===undefined) {
            return false
        }
        this.from0.delete(key)
        this.from1.delete(value)
        return true
    }
    deleteByValue(value: T1) {
        const key = this.getByValue(value)
        if (key===undefined) {
            return false
        }
        this.from0.delete(key)
        this.from1.delete(value)
        return true
    }
    forEach(callback: (value: T1, key: T0) => void) {
        this.from0.forEach(callback)
    }
}