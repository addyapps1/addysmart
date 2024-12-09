// Import sinon
import sinon from "sinon";

// Mock response helper function (using the second structure)
export const mockResponse = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res); // Added 'send' for consistency
  return res;
};

// Mock request helper function
export const mockRequest = (data = {}) => ({
  ...data,
  headers: data.headers || {},
  query: data.query || {},
  params: data.params || {},
  body: data.body || {},
  user: data.user || {},
});
