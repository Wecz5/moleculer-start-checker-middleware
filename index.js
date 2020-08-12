module.exports = (timeoutMs, exitCode) => ({
  name: "startChecker",
  starting(broker) {
    this.exitCode = 0;
    this.timeoutID = setTimeout(() => {
      broker.logger.error(
        "some services did not start in time, stopping broker"
      );
      this.exitCode = exitCode;
      broker.stop();
    }, timeoutMs);
  },
  started(broker) {
    clearTimeout(this.timeoutID);
  },
  stopped(broker) {
    if (process.ENV_NAME && process.ENV_NAME === "TEST_ENV") {
      console.log("in test condition");
      process.ENV_Result = "broker stopped";
    } else {
      if (this.exitCode) {
        process.exit(this.exitCode);
      }
    }
  },
});
