const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const userController = require('../../rest/controllers/userController');
const userService = require('../../src/services/userService');

const expect = chai.expect;

describe('User Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.post('/register', userController.register);
    app.post('/login', userController.login);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      const fakeUser = { name: 'Lucas', email: 'lucas@email.com' };
      sinon.stub(userService, 'registerUser').returns(fakeUser);

      const res = await request(app)
        .post('/register')
        .send({ name: 'Lucas', email: 'lucas@email.com', password: '123456' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.deep.equal(fakeUser);
    });

    it('deve retornar erro se email já cadastrado', async () => {
      sinon.stub(userService, 'registerUser').returns(null);

      const res = await request(app)
        .post('/register')
        .send({ name: 'Lucas', email: 'lucas@email.com', password: '123456' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Email já cadastrado');
    });
  });

  describe('login', () => {
    it('deve autenticar usuário com sucesso', async () => {
      const fakeResult = { token: 'jwt-token', email: 'lucas@email.com' };
      sinon.stub(userService, 'authenticate').returns(fakeResult);

      const res = await request(app)
        .post('/login')
        .send({ email: 'lucas@email.com', password: '123456' });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(fakeResult);
    });

    it('deve retornar erro se credenciais inválidas', async () => {
      sinon.stub(userService, 'authenticate').returns(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'lucas@email.com', password: 'wrongpass' });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Credenciais inválidas');
    });
  });
});