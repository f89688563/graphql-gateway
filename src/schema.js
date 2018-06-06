import { HttpLink } from 'apollo-link-http';
import { mergeSchemas, introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import ws from 'ws';

import { remoteSchema } from './config';

const loadRemoteSchema = async ({ uri, wsUri }) => {
  try {
    const httpLink = new HttpLink({ uri, fetch });

    // 建立子服务的ws链接，用于支持subscription
    const wsLink = new WebSocketLink({
      uri: wsUri,
      options: {
        reconnect: true,
      },
      webSocketImpl: ws,
    });

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink,
    );
    const schema = await introspectSchema(link);
    const executableSchema = makeRemoteExecutableSchema({
      schema,
      link,
    });
    return executableSchema;
  } catch (e) {
    console.log('fetching schema error: ', e);
    return {};
  }
};

const load = async () => {
  const schemas = []
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < remoteSchema.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const schema = await loadRemoteSchema(remoteSchema[i])
    schemas.push(schema);
  }
  return schemas;
}

export default async () => {
  const schemas = await load();
  return mergeSchemas({
    schemas,
    onTypeConflict: (left, right) => right,
  });
};

