/**
 * @typedef {Object} IpfsCryptParams
 * @prop {string} key - Encryption key
 * @prop {string} hmacKey - Encryption HMAC key
 * @prop {string} [host]
 * @prop {number} [port]
 * @prop {string} [protocol]
 * @prop {Headers|Record<string, string>} [headers] - Request headers.
 * @prop {number|string} [timeout] - Amount of time until request should timeout in ms or humand readable. https://www.npmjs.com/package/parse-duration for valid string values.
 * @prop {string} [apiPath] - Path to the API.
 * @prop {URL|string} [url] - Full API URL.
 */

const IpfsHttpClient = require('ipfs-http-client')
const NodeCrypt = require('./crypto')

class IpfsCrypt {
  
  /**
   * Initialize IPFS-Crypt
   * @param {IpfsCryptParams} params
   */
  constructor(params = {}) {
    this.params = params
  }

  /**
   * Import a file or data into IPFS with encryption.
   * @param {Buffer} buffer Buffer of a file
   */
  async add(buffer) {
    try {
      const crypto = new NodeCrypt({ key: this.params.key, hmacKey: this.params.hmacKey })
      const ipfs = IpfsHttpClient(this.params)
      const encryptedBuffer = crypto.encryptBuffer(buffer)
      const file = await ipfs.add(encryptedBuffer)
      return file
    } catch (error) {
      throw new Error(error)
    }
  }
  
  /**
   * Returns a decrypted file buffer by a valid IPFS Path.
   * @param {String} path IPFS hash of encrypted file on ipfs
   * @returns {Buffer}
   */
  async cat(path) {
    try {
      const crypto = new NodeCrypt({ key: this.params.key, hmacKey: this.params.hmacKey })
      const ipfs = IpfsHttpClient(this.params)
      const chunks = []
      for await (const chunk of ipfs.cat(path)) {
        chunks.push(chunk)
      }
      const encryptedBuffer = Buffer.concat(chunks)
      const decryptedBuffer = crypto.decryptBuffer(encryptedBuffer)
      return decryptedBuffer
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = {
  IpfsCrypt,
  IpfsHttpClient
}