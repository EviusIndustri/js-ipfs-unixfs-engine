/* eslint-env mocha */
'use strict'

const importer = require('./../src').importer

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const BlockService = require('ipfs-block-service')
const pull = require('pull-stream')
const CID = require('cids')
const Ipld = require('ipld')
const randomByteStream = require('./helpers/finite-pseudorandom-byte-stream')

const strategies = [
  'flat',
  'trickle',
  'balanced'
]

const expectedHashes = {
  flat: 'QmRgXEDv6DL8uchf7h9j8hAGG8Fq5r1UZ6Jy3TQAPxEb76',
  balanced: 'QmVY1TFpjYKSo8LRG9oYgH4iy9AduwDvBGNhqap1Gkxme3',
  trickle: 'QmYPsm9oVGjWECkT7KikZmrf8imggqKe8uS8Jco3qfWUCH'
}

module.exports = (repo) => {
  strategies.forEach(strategy => {
    const options = {
      strategy: strategy
    }

    describe('go-ipfs interop using importer:' + strategy, () => {
      let ipld

      before(() => {
        const bs = new BlockService(repo)
        ipld = new Ipld(bs)
      })

      it('yields the same tree as go-ipfs', function (done) {
        this.timeout(10 * 1000)
        pull(
          pull.values([
            {
              path: 'big.dat',
              content: randomByteStream(45900000, 7382)
            }
          ]),
          importer(ipld, options),
          pull.collect((err, files) => {
            expect(err).to.not.exist()
            expect(files.length).to.be.equal(1)

            const file = files[0]
            expect(new CID(file.multihash).toBaseEncodedString()).to.be.equal(expectedHashes[strategy])
            done()
          })
        )
      })
    })
  })
}
