const fastify = require("fastify")();
const path = require("path");
const fastifyStatic = require("@fastify/static");
const PORT = 8045;

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.get("/", async (request, reply) => {
  return reply.sendFile("launcher.html");
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });

    console.log("Server running on port " + PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
