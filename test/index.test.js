const test = require("ava");
const { v4: uuid } = require("uuid");
const { ServiceBroker } = require("moleculer");
const startCheckerMiddleware = require("..");
process.ENV_NAME = "TEST_ENV";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createBrokerAndService = ({
  namespace,
  timeoutMs = 2000,
  exitCode = 1,
}) => {
  const broker = new ServiceBroker({
    namespace,
    middlewares: [startCheckerMiddleware(timeoutMs, exitCode)],
  });
  broker.createService({ name: `${namespace}_service1` });
  return broker;
};

test("startcheck returns 0 when services start successfully", async (t) => {
  const broker = createBrokerAndService({ namespace: uuid() });
  await broker.start();
  t.assert(broker.exitCode === 0);
  await broker.stop();
  t.assert(broker.exitCode === 0);
});

test("startcheck returns 1 when services do not start successfully before timeout", async (t) => {
  const namespace = uuid();
  const broker = createBrokerAndService({ namespace });
  broker.createService({
    name: `${namespace}_service2`,
    async started() {
      await sleep(3000);
    },
  });

  await broker.start();
  t.assert(process.ENV_Result === "broker stopped");
});
