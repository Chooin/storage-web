interface config {
  use?: string,
  pre?: string,
  expire?: number | null
}

const $LS = window.localStorage
const $SS = window.sessionStorage

function isDef (v: any): boolean {
  return typeof v !== 'undefined' && v !== null
}

function getObjectType (v: any): string {
  return Object.prototype.toString.call(v).slice(8, -1)
}

function tip (v: string): void {
  if (typeof console !== 'undefined') console.warn(`[Tip]: ${v}`)
}

class Storages {
  defaults: {
    use: string,
    pre: string,
    expire: number | null
  }

  constructor () {
    this.defaults = {
      use: 'local',
      pre: '',
      expire: null
    }
  }

  set (
    key: string | {key: string, value: any}[],
    value: any,
    config: config
  ) {
    if (isDef(key)) {
      if (Array.isArray(key)) {
        for (let i in key) {
          this._set(key[i].key, key[i].value, config)
        }
      } else {
        this._set(key, value, config)
      }
    } else {
      tip('Wrong set storage')
    }
  }

  get (
    key: string,
    config: config
  ) {
    let value: any
    if (isDef(key)) {
      let store = this.getStore(key, config)
      let value = this.getStorage(config).getItem(key)
      if (store) {
        if (value) {
          return store.type === 'String' ? value : JSON.parse(value)
        } else {
          tip('获取 Storage 失败，Storage 中不存在该 key')
          return null
        }
      } else {
        try {
          return value ? JSON.parse(value) : null
        } catch (_) {
          this.getStorage(config).removeItem(key)
          return null
        }
      }
    } else {
      tip('获取 Storage 失败，key 不能为空')
    }
  }

  remove (
    key: string | string[],
    config: config
  ) {
    if (Array.isArray(key)) {

    } else {
      this._remove(key, config)
    }
  }

  clear (
    config: config
  ) {

  }

  getConfig (config: config) {
    return (<any>Object).assign(this.defaults, config)
  }

  getKey (
    key: string,
    config: config
  ) {
    return `${this.getConfig(config).pre}${key}`
  }

  getStorage (
    config: config
  ) {
    return /^(l|local|localStorage)$/.test(this.getConfig(config).use)
      ? $LS
      : $SS
  }

  getExpire (
    config: config
  ) {
    return this.getConfig(config).expire
  }

  getStoreName (
    config: config
  ) {
    return `__${this.getConfig(config).pre}_storage_web`
  }

  store (
    config: config
  ) {
    let store: any
    store = this.getStorage(config).getItem(this.getStoreName(config))
    store = store ? JSON.parse(store) : []
    return store
  }

  getStore (
    key: string,
    config: config
  ) {
    const store = this.store(config)
    if (store[key]) {
      return store[key]
    } else {
      tip('无法确定参数类型')
    }
  }

  setStore (
    key: string,
    type: string,
    config: config
  ) {

  }

  removeStore (
    key: string,
    config: config
  ) {
    const store = this.store(config)
    delete store[key]
    this.getStorage(config).setItem(
      this.getStoreName(config),
      JSON.stringify(store)
    )
  }

  _set (
    key: string,
    value: any,
    config: config
  ) {
    if (isDef(key)) {
      key = this.getKey(key, config)
      let storage = this.getStorage(config)
      if (isDef(value)) {
        let objectType = getObjectType(value)
        this.setStore(key, objectType, config)
        if (
          objectType === 'String' ||
          objectType === 'Number'
        ) {
          storage.setItem(key, value)
        } else {
          storage.setItem(key, JSON.stringify(value))
        }
      } else {
        storage.removeItem(key)
      }
    } else {
      tip('Wrong set storage')
    }
  }

  _remove (
    key: string,
    config: config
  ) {

  }
}

export default new Storages()