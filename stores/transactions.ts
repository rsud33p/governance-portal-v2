import create, { State } from 'zustand';
import invariant from 'tiny-invariant';

import { parseTxError } from '../lib/errors';
import getMaker from '../lib/maker';
import TX from '../types/transaction';

interface Store extends State {
  transactions: { [from: string]: TX[] };
  initTx: (from: string, txObject: any, message: string | null) => void;
  setPending: (from: string, txObject: any) => void;
  setMined: (from: string, txObject: any) => void;
  setError: (from: string, txObject: any, error: { message: string }) => void;
}

const [useTransactionsStore, transactionsApi] = create<Store>((set, get) => ({
  transactions: {},

  initTx: (from, txObject, message) => {
    const pastTxs = get().transactions[from];
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'initialized';
    set({
      transactions: {
        [from]: (pastTxs || []).concat([
          {
            submittedAt,
            status,
            message,
            hash: null,
            error: null,
            errorType: null
          }
        ])
      }
    });
  },

  setPending: (from, txObject) => {
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'pending';
    set(state => {
      const transaction = state.transactions[from].find(
        tx => tx.submittedAt === submittedAt
      );
      invariant(
        transaction,
        `Unable to find tx from ${from} submitted at ${submittedAt}`
      );
      transaction.status = status;
      transaction.hash = txObject.hash;
      return state;
    });
  },

  setMined: (from, txObject) => {
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'mined';
    set(state => {
      const transaction = state.transactions[from].find(
        tx => tx.submittedAt === submittedAt
      );
      invariant(
        transaction,
        `Unable to find tx from ${from} submitted at ${submittedAt}`
      );
      transaction.status = status;
      return state;
    });
  },

  setError: (from, txObject, error) => {
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'error';
    set(state => {
      const transaction = state.transactions[from].find(
        tx => tx.submittedAt === submittedAt
      );
      invariant(
        transaction,
        `Unable to find tx from ${from} submitted at ${submittedAt}`
      );
      const errorType = transaction.hash ? 'failed' : 'not sent';
      transaction.status = status;
      transaction.error = parseTxError(error.message);
      transaction.errorType = errorType;
      return state;
    });
  },

  track: async (tx, message = null) => {
    const maker = await getMaker();
    maker.service('transactionManager').listen(tx, {
      initialized: ({ metadata: { action }, ...txObject }) => {
        const from = action.from;
        get().initTx(from, txObject, message);
      },
      pending: ({ metadata: { action }, ...txObject }) => {
        const from = action.from;
        get().setPending(from, txObject);
      },
      mined: ({ metadata: { action }, ...txObject }) => {
        const from = action.from;
        get().setMined(from, txObject);
      },
      error: ({ metadata: { action }, ...txObject }, error) => {
        const from = action.from;
        get().setError(from, txObject, error);
      }
    });

    // noop catch since we handle tx errors via the manager
    tx.catch(() => {});
  }
}));

export default useTransactionsStore;
export { transactionsApi };
