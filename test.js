"use strict";


const appModule = require('./index');
const supertest = require('supertest');
const should = require('should');


function getBaseUrl() {
    const port = appModule.config.defaultPort;
    const addr = '127.0.0.1';
    return 'http://' + addr + ':' + port;
}

const url = getBaseUrl();


function request(method, path) {
    const r = supertest(url)[method](path);

    const oldEnd = r.end;

    r.end = (callback) => {
        oldEnd.call(r, ((error, response) => {
            should(error).be.exactly(null);
            callback(response);
        }));
    };
    return r;
}

function get(path) {
    return request('get', path);
}


describe('epitech-search', function () {
    this.timeout(1000 * 60);

    before((done) => {
        appModule.servePromise.then(done);
    });

    it("should return a JSON error when the route doesn't exist", (done) => {
        get('/eiuaeiuaeuiaeiuaeiuae')
            .set('Accept', 'application/json')
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({
                error: 'not_found'
            })
            .end(() => done());
    });

    it("should return a text error when the route doesn't exist", (done) => {
        get('/eiuaeiuaeuia')
            .set('Accept', 'text/html')
            .expect(404)
            .expect('Content-Type', /text\/plain/)
            .expect(/not_found/)
            .end(() => done());
    });

    it("GET /user/:login", (done) => {
        get('/user/motet_a')
            .expect('Content-Type', /json/)
            .expect({
                login: 'motet_a',
                firstName: 'antoine',
                lastName: 'motet',
                location: 'FR/LYN',
                year: 2015,
            })
            .end(() => done());
    });

    it("GET /user/ 404 with bad login", (done) => {
        get('/user/')
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({
                error: 'not_found'
            })
            .end(() => done());
    });

    it("GET /user/:login 404", (done) => {
        get('/user/etsiruanetiurnateisru')
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({
                error: 'not_found'
            })
            .end(() => done());
    });

    it("GET /compl without parameters", (done) => {
        get('/compl?')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({
                error: 'bad_request'
            })
            .end(() => done());
    });

    it("GET /compl with login", (done) => {
        get('/compl?q=motet_a')
            .expect('Content-Type', /json/)
            .expect((res) => {
                if (res.body[0].login !== 'motet_a')
                    throw new Error('Expected motet_a as first result');
            })
            .end(() => done());
    });

    it("GET /compl with names", (done) => {
        get('/compl?q=AnToInE+MotET')
            .expect('Content-Type', /json/)
            .expect((res) => {
                if (res.body[0].login !== 'motet_a')
                    throw new Error('Expected motet_a as first result');
            })
            .end(() => done());
    });

    it("GET /compl with date and an incomplete first name", (done) => {
        get('/compl?q=motet+2015+antoin')
            .expect('Content-Type', /json/)
            .expect((res) => {
                if (res.body[0].login !== 'motet_a')
                    throw new Error('Expected motet_a as first result');
            })
            .end(() => done());
    });

});
