type Key = string | number

export default class Storage {
  protected $ls
  protected $ss
  protected $s
  protected defaults

  constructor (defaults) {
    if (this._type(defaults) === '[object String]') {
      this.defaults = {
        use: defaults,
        pre: '',
        strict: true,
        expire: null
      }
    } else if (this._type(defaults) === '[object Object]') {
      this.defaults = {
        use: defaults.use,
        pre: this._type(defaults.pre) === '[object String]' ? defaults.pre : '',
        strict: this._type(defaults.strict) === '[object Boolean]' ? defaults.strict : true,
        expire: this._type(defaults.expire) === '[object Number]' ? defaults.expire : null
      }
    } else {
      throw new Error('Wrong storage option')
    }
    this.$ls = window.localStorage
    this.$ss = window.sessionStorage
    this.$s = this.defaults.use === 's' && this.defaults.use === 'session' && this.defaults.use === 'sessionStorage'
              ? this.$ss
              : this.$ls
  }

  /**
   * Get storage value
   * @param  {String} key
   * @return {*}
   */
  get (key: Key) {
    if (this._isDef(key)) {
      key = `${this.defaults.pre}${key}`
      if (this.defaults.strict) {
        let value = this.$s.getItem(key)
        if (value === null) return null
        try {
          value = JSON.parse(value)
          if ((value.expire && value.expire > new Date().getTime()) || value.expire === null) {
            return value.data
          } else {
            this.$s.removeItem(key)
            return null
          }
        } catch (_) {
          this.$s.removeItem(key)
          this._console('Wrong get storage')
        }
      } else {
        try {
          return JSON.parse(this.$s.getItem(key))
        } catch (_) {
          return this.$s.getItem(key)
        }
      }
    } else {
      this._console('Wrong get storage')
    }
  }

  /**
   * Set storage value
   * @param  {String/Array} key
   * @param  {*} value
   */
  set (key: Key | {key: string | number, value: any}[], value: any) {
    if (Array.isArray(key)) {
      for (let i in key) this._set(key[i].key, key[i].value)
    } else {
      this._set(key, value)
    }
  }

  /**
   * Remove storage value
   * @param  {String/Array} key
   */
  remove (key: Key) {
    if (Array.isArray(key)) {
      for (let i in key) this._remove(key[i])
    } else {
      this._remove(key)
    }
  }

  /**
   * Clear storage value
   */
  clear () {
    if (this.defaults.pre) {
      for (let i = 0; i < this.$ls.length; i++) {
        if (this.$ls.key(i).indexOf(this.defaults.pre) === 0) this._remove(this.$ls.key(i))
      }
      for (let i = 0; i < this.$ss.length; i++) {
        if (this.$ss.key(i).indexOf(this.defaults.pre) === 0) this._remove(this.$ss.key(i))
      }
    } else {
      this.$ss.clear()
      this.$ls.clear()
    }
  }

  _set (key: Key, value: any) {
    if (this._isDef(key)) {
      key = `${this.defaults.pre}${key}`
      if (this._isDef(value)) {
        if (this.defaults.strict) {
          this.$s.setItem(key, JSON.stringify({
            data: value,
            expire: this.defaults.expire,
            type: this._type(value)
          }))
        } else {
          if (this._type(value) === '[object String]' || this._type(value) === '[object Number]') {
            this.$s.setItem(key, value)
          } else {
            this.$s.setItem(key, JSON.stringify(value))
          }
        }
      } else {
        this.$s.removeItem(key)
      }
    } else {
      this._console('Wrong set storage')
    }
  }

  _remove (key: Key) {
    if (key) {
      this.$s.removeItem(`${this.defaults.pre}${key}`)
    } else {
      this._console('Wrong remove storage')
    }
  }

  _type (v: any): string {
    return Object.prototype.toString.call(v)
  }

  _console (v: string): void {
    if (typeof console !== 'undefined') console.warn(v)
  }

  _isDef (v: any): boolean {
    return typeof v !== 'undefined' && v !== null
  }
}