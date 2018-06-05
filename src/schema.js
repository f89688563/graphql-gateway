import { HttpLink } from 'apollo-link-http';
import { mergeSchemas, introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';

import { remoteSchema } from './config';

const loadRemoteSchema = async (uri) => {
  try {
    const link = new HttpLink({ uri, fetch });
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

