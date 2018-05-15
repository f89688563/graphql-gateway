import { HttpLink } from 'apollo-link-http';
import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';

export default async () => {
  try {
    const link = new HttpLink({ uri: 'http://localhost:3020/graphql', fetch });
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
