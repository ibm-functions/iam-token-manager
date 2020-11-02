const needle = require('needle')
const TokenManager = require('../')
const tm = new TokenManager({ iamApikey: '12345' })
const validToken = {
  body: {
    access_token: 'myaccesstoken',
    refresh_token: 'refreshtoken',
    expiration: 1533674057,
    expires_in: 3600
  }
}

jest.mock('needle')
test('should fetch token', () => {
  needle.mockResolvedValue(Promise.resolve(validToken))
  return tm.getToken().then(t => expect(t).toEqual(validToken.body.access_token))
})
test('should fetch auth header', () => {
  needle.mockResolvedValue(Promise.resolve(validToken))
  return tm.getAuthHeader().then(h => expect(h).toEqual(`Bearer ${validToken.body.access_token}`))
})
test('should call requestToken() only once with many parallel getAuthHeader() calls', () => {
  needle.mockResolvedValue(Promise.resolve(validToken))
  const spy = jest.spyOn(tm, 'requestToken')
  const spy2 = jest.spyOn(tm, 'getToken')

  const proms = []
  for (let i = 0; i < 10; i++) {
    proms.push(tm.getAuthHeader().then(h => expect(h).toEqual(`Bearer ${validToken.body.access_token}`)))
  }
  return Promise.all(proms)
    .then(() => {
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(10)
      spy.mockRestore()
      spy2.mockRestore()
    })
})
