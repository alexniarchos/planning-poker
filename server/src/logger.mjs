import pino from "pino";

const logger = pino(
  pino.transport({
    targets: [
      {
        target: "pino-pretty",
      },
      {
        target: "@logtail/pino",
        options: { sourceToken: process.env.LOGTAIL_TOKEN },
      },
    ],
  })
);

export default logger;
