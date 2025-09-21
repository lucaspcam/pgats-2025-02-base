const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const checkoutController = require('../../rest/controllers/checkoutController');
const userService = require('../../src/services/userService');
const checkoutService = require('../../src/services/checkoutService');

const expect = chai.expect;

describe('Checkout Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.post('/checkout', checkoutController.checkout);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Autenticação', () => {
    it('deve retornar 401 se o token for inválido', async () => {
      sinon.stub(userService, 'verifyToken').returns(null);

      const res = await request(app)
        .post('/checkout')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Token inválido');
    });
  });

  describe('Checkout', () => {
    it('deve retornar sucesso e valorFinal se checkout for válido', async () => {
      sinon.stub(userService, 'verifyToken').returns({ id: 1 });
      sinon.stub(checkoutService, 'checkout').returns({ total: 100, items: [], freight: 10, paymentMethod: 'boleto' });

      const res = await request(app)
        .post('/checkout')
        .set('Authorization', 'Bearer valid-token')
        .send({
          items: [{ productId: 1, quantity: 2 }],
          freight: 10,
          paymentMethod: 'boleto'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('valorFinal', 100);
      expect(res.body).to.have.property('freight', 10);
      expect(res.body).to.have.property('paymentMethod', 'boleto');
    });

    it('deve retornar 400 se checkoutService lançar erro', async () => {
      sinon.stub(userService, 'verifyToken').returns({ id: 1 });
      sinon.stub(checkoutService, 'checkout').throws(new Error('Erro no checkout'));

      const res = await request(app)
        .post('/checkout')
        .set('Authorization', 'Bearer valid-token')
        .send({
          items: [{ productId: 1, quantity: 2 }],
          freight: 10,
          paymentMethod: 'boleto'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Erro no checkout');
    });
  });
});