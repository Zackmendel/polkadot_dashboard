import { ApiPromise, WsProvider } from "@polkadot/api";

const provider = new WsProvider("wss://rpc.polkadot.io");

export async function getStakingInfo(address: string) {
  const api = await ApiPromise.create({ provider });

  const [bonded, nominators, balances, locks] = await Promise.all([
    api.query.staking.bonded(address),
    api.query.staking.nominators(address),
    api.query.system.account(address),
    api.query.balances.locks(address),
  ]);

  let ledger = null;
  if (bonded.isSome) {
    ledger = await api.query.staking.ledger(bonded.unwrap());
  }

  const result = {
    address,
    bondedTo: bonded.isSome ? bonded.unwrap().toString() : "Not bonded",
    activeStake: ledger?.unwrapOrDefault()?.active?.toHuman?.() || "0",
    totalStake: ledger?.unwrapOrDefault()?.total?.toHuman?.() || "0",
    unlocking:
      ledger?.unwrapOrDefault()?.unlocking?.map((u) => ({
        value: u.value.toHuman(),
        era: u.era.toNumber(),
      })) || [],
    nominatedValidators:
      nominators?.unwrapOrDefault()?.targets?.map((t) => t.toHuman()) || [],
    balance: balances.data.free.toHuman(),
    locks: locks.map((l) => ({
      id: l.id.toHuman(),
      amount: l.amount.toHuman(),
    })),
  };

  return result;
}


