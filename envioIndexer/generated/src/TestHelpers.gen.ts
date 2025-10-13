/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {ERC20_Approval_event as Types_ERC20_Approval_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type ERC20_Approval_createMockArgs = {
  readonly owner?: Address_t; 
  readonly spender?: Address_t; 
  readonly value?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const ERC20_Approval_processEvent: EventFunctions_eventProcessor<Types_ERC20_Approval_event> = TestHelpersJS.ERC20.Approval.processEvent as any;

export const ERC20_Approval_createMockEvent: (args:ERC20_Approval_createMockArgs) => Types_ERC20_Approval_event = TestHelpersJS.ERC20.Approval.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const ERC20: { Approval: { processEvent: EventFunctions_eventProcessor<Types_ERC20_Approval_event>; createMockEvent: (args:ERC20_Approval_createMockArgs) => Types_ERC20_Approval_event } } = TestHelpersJS.ERC20 as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
