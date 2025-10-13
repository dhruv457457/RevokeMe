/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type Approval_t = {
  readonly amount: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly owner: string; 
  readonly spender: string; 
  readonly tokenAddress: string
};

export type Approval_indexedFieldOperations = {};
