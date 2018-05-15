import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';

import buildSchema from './schema';
import config from './config';

const graphqlEndpoint = '/graphql';
const WS_GQL_PATH = '/subscriptions';

// Arguments usually come from env vars
export async function run() {
  const PORT = 3010;

  const schema = await buildSchema();

  const app = express();
  const server = createServer(app);

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(cookieParser(config.sessionStoreSecret));

  app.use(
    graphqlEndpoint,
    graphqlExpress((req) => {
      const query = req.query.query || req.body.query;
      if (query && query.length > 2000) {
        throw new Error('Query too large...');
      }

      return {
        schema,
        // tracing: true,
        // cacheControl: true,
        context: {
        },
      };
    }),
  );

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: graphqlEndpoint,
      subscriptionsEndpoint: `ws://localhost:${PORT}${WS_GQL_PATH}`,
    }),
  );

  // app.listen(PORT, () => console.log('123..'));

  server.listen(PORT, () => {
    // eslint-disable-next-line no-new
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        // onConnect: (connectionParams, webSocket, context) => {
        //   console.log('connectionParams', connectionParams);
        //   // console.log('context', context);
        // },
        // onOperation: (message, params, webSocket) => {
        //   console.log('message', message)
        //   console.log('params', params)
        // },
        // onOperationDone: webSocket => {
        //   console.log('webSocket', webSocket)
        // },
        // onDisconnect: (webSocket, context) => {
        //   console.log('dis...')
        // },
      },
      {
        server,
        path: WS_GQL_PATH,
      },
    );
  });
}
