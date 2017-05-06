import { stub } from 'sinon';
import factory from './';

const apiHost = 'test.com';

describe('API Fetch', () => {
  let nativeFetch, fetch;
  beforeEach(() => {
    nativeFetch = stub();
    fetch = factory({
      apiHost,
      fetch: nativeFetch,
    });
  });

  it('should call nativeFetchStub', async() => {
    try {
      await fetch();
    } catch (err) {}
    nativeFetch.should.be.called;
  });
  it('should call nativeFetchStub with body', async() => {
    const path = '/some-path';
    const data = { some: 'data' };
    try {
      await fetch(path, data, {});
    } catch (err) {}
    nativeFetch.should.be.calledWith('//' + apiHost + path);
    nativeFetch.args[0][1].body.should.equal(JSON.stringify(data));
  });
  it('should merge options', async() => {
    const path = '/some-path';
    const data = { some: 'data' };
    const opts = { headers: { auth: 'some auth' } };
    try {
      await fetch(path, data, opts);
    } catch (err) {}
    nativeFetch.should.be.calledWith('//' + apiHost + path);
    nativeFetch.args[0][1].body.should.equal(JSON.stringify(data));
    nativeFetch.args[0][1].headers.auth.should.equal(opts.headers.auth);
  });
  it('should handle rejection', async() => {
    const error = new Error('some error');
    nativeFetch.returns(Promise.reject(error));
    try {
      await fetch();
    } catch (err) {
      err.message.should.contain(error.message);
      return;
    }
    throw new Error('Didn\'t throw');
  });
  it('should throw text as body', async() => {
    const text = 'some response';
    nativeFetch.returns(Promise.resolve({ ok: true, text: () => Promise.resolve(text) }));
    try {
      await fetch();
    } catch (err) {
      err.message.should.contain(text);
    }
  });
  it('should handle json', async() => {
    const data = { some: 'data' };
    nativeFetch.returns(Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(data)) }));
    const res = await fetch();
    res.should.deep.equal(data);
  });
});
