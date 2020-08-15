# ipfs-crypt

> Add file to ipfs with encryption and cat back decrypted file.

- aes-256-ctr encryption algorithm
- custom Initialization Vector for each encrypted value
- HMAC/constant time compare to prevent tampering

[![NPM Version][npm-image]][npm-url]

## Install

```bash
npm i @kyc-crypto/ipfs-crypt
```

## Usage Example

```javascript
const crypto = require('crypto')
const { IpfsCrypt } = require('@kyc-crypto/ipfs-crypt')

const key = crypto.randomBytes(32).toString('hex');
const hmacKey = crypto.randomBytes(32).toString('hex');

// initialize IpfsCrypt
const ipfsCrypt = new IpfsCrypt(
  {
    key,
    hmacKey,
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https'
  }
);

// Add and cat file
(async () => {
  try {
    console.log('uploading file...')

    // Adding file to ipfs
    const file = await ipfsCrypt.add(fs.readFileSync('./document.png'))
    console.log('file', file)

    // Get decrypted buffer
    const decryptedBuffer = await ipfsCrypt.cat(file.path)

    // Write buffer to file
    fs.writeFileSync('./document.dec.png', decryptedBuffer)

    console.log('done!')
  } catch (error) {
    console.log(error)
  }
})()
```
**Package also exports ipfs-http-client**
```javascript
const { IpfsHttpClient } = require('@kyc-crypto/ipfs-crypt')
```


## License

[MIT](https://github.com/KYCCrypto/ipfs-crypt/blob/master/LICENSE)

[npm-image]: https://img.shields.io/npm/v/@kyc-crypto/ipfs-crypt.svg?style=for-the-badge&logo=npm&color=32CD32
[npm-url]: https://www.npmjs.com/package/@kyc-crypto/ipfs-crypt