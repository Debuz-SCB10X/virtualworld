import { Client, EnvironmentEndpoint } from "./client";

const env: EnvironmentEndpoint =
{
  dev: "ws://localhost:4000",
  prod: "wss://scb10x-virtualworld.ws.dbzapi.com/",
  //prod: "wss://debuz-job-application.herokuapp.com",
};

env.dev = "wss://scb10x-virtualworld.ws.dbzapi.com/";

const client = new Client(env);
client.start();