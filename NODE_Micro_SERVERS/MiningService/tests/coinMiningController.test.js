import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import axiosMockAdapter from "axios-mock-adapter";
import * as coinMiningController from "../Controllers/coinMiningController.js";
import CoinsMining from "../Models/coinMining.js";
import Balance from "../Models/balance.js";
import {
  getCoinMinings,
  postCoinMining,
} from "../Controllers/coinMiningController.js";
import { mockRequest, mockResponse } from "./testHelpers.js";

describe("coinMiningController functions", function () {
  this.timeout(10000); // Increase timeout to 10 seconds

  let axiosMock, sandbox;

  before(() => {
    axiosMock = new axiosMockAdapter(axios);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    axiosMock.reset();
  });

  after(() => {
    axiosMock.restore();
  });

  describe("getCoinMinings", () => {
    it("should fetch and return all coin mining records", async () => {
      const mockCoins = [
        { _id: "1", name: "Coin1", userID: "user1" },
        { _id: "2", name: "Coin2", userID: "user2" },
      ];

      const req = mockRequest({ query: {} });
      const res = mockResponse();
      const next = sinon.stub();

      // Adjust the mock to ensure chaining works correctly
      const findStub = sandbox.stub(CoinsMining, "find").returns({
        countDocuments: sinon.stub().returns({
          filter: sinon.stub().returns({
            sort: sinon.stub().returns({
              limitfields: sinon.stub().returns({
                paginate: sinon.stub().returns({ query: mockCoins }),
              }),
            }),
          }),
        }),
        totalCountPromise: Promise.resolve(2),
      });

      await getCoinMinings(req, res, next);

      expect(findStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          status: "success",
          resource: "coinsMining",
          RecordsEstimate: 2,
          action: "getAll",
          length: mockCoins.length,
          data: mockCoins,
        })
      ).to.be.true;
    });
  });

  describe("postCoinMining", () => {
    it("should create a new coin mining record if the user hasn't watched in the last 24 hours", async () => {
      const req = mockRequest({
        user: { _id: "user1" },
        body: { videoId: "video123", watchcode: "123456" },
        headers: { authorization: "Bearer testtoken" },
      });
      const res = mockResponse();
      const next = sinon.stub();

      sandbox.stub(CoinsMining, "findOne").resolves(null);

      axiosMock
        .onGet(
          `http://${process.env.DEV_E_VIDEO_HOST}/api/s/v1.00/evideo/evuplv/video123`
        )
        .reply(200, {
          data: { watchcode: "123456", nextViewTime: new Date() },
        });

      sandbox
        .stub(CoinsMining, "create")
        .resolves([{ _id: "mockedId", coins: 50 }]);

      sandbox.stub(Balance, "findOne").returns({
        session: sinon.stub().returns({
          save: sinon.stub().resolves(),
        }),
      });

      await postCoinMining(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          status: "success",
          resource: "coinsMining",
        })
      ).to.be.true;
    });

    it("should return an error if the user watched the video in the last 24 hours", async () => {
      const req = mockRequest({
        user: { _id: "user1" },
        body: { videoId: "video123", watchcode: "123456" },
      });
      const res = mockResponse();
      const next = sinon.stub();

      sandbox.stub(CoinsMining, "findOne").resolves({});

      await postCoinMining(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledWith({
          status: "error",
          alreadydone:
            "Sorry, you have already completed this task within the last 24 hours.",
        })
      ).to.be.true;
    });
  });
});
