import { mergeSchemas } from 'graphql-tools';

import baseSchema from './remote/base';
import clinicSchema from './remote/clinic';
import localSchema from './remote/local';

export default async () => {
  const sSchema = await baseSchema();
  const cSchema = await clinicSchema();
  const lSchema = await localSchema();
  return mergeSchemas({
    schemas: [sSchema, cSchema, lSchema],
    onTypeConflict: (left, right) => right,
  });
};

