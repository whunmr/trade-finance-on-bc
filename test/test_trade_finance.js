const truffleAssert = require('truffle-assertions');
const assert = require("chai").assert;

const MetaCoin = artifacts.require("MetaCoin");
const TradeFinance = artifacts.require("TradeFinance");

function assert_struct_eq(a1, a2) {
    return assert.equal(JSON.stringify(a1), JSON.stringify(a2));
}

contract('Testing for TradeFinance Contract', async (accounts) => {
  var instance;
    
  beforeEach(async () => {
    instance = await TradeFinance.deployed();
  });
  
  afterEach(async () => {
  });
    
  it("should contains zero order in contract after deployed", async() => {
    let order_count = await instance.order_count();
    assert.equal(order_count, 0);
  })

  it("should able to create order", async() => {
    let seller = accounts[0];
    let buyer = accounts[1];

    let price = 10000000000000000000;
    let digest = "86d3f3a95c324c9479bd8986968f4327";

    let order_id = await instance.createOrder.call(buyer, price, digest);
    let tx       = await instance.createOrder(buyer, price, digest);
    let order = await instance.orders.call(order_id);

    assert_struct_eq( order
                    , [order_id, accounts[0], accounts[1], price.toString(), "0", digest, false]);

    truffleAssert.eventEmitted(tx, 'OrderCreated', (ev) => {
      return ev.ricardian_digest = digest;
    });


      
    let escrow_value = 20000000000000000000;

    await instance.deposit(order_id, {value: escrow_value, from: buyer});
      
      
    order = await instance.orders.call(order_id);
    assert_struct_eq( order
                      , [order_id, accounts[0], accounts[1], price.toString()
                      , escrow_value.toString(), digest, false]);

    let expected_balance = escrow_value;
    let actual_balance = web3.eth.getBalance(instance.address);
    assert.equal(actual_balance, expected_balance);

    result = await instance.releaseEscrow(order_id, {from: buyer});
    console.log(result);
  })

     
    
  //it("should put 10000 MetaCoin in the first account", async () => {
  //   let instance = await MetaCoin.deployed();
  //   let balance = await instance.getBalance.call(accounts[0]);
  //   assert.equal(balance.valueOf(), 10000);
  //})
  //
  //it("should call a function that depends on a linked library", async () => {
  //  let meta = await MetaCoin.deployed();
  //  let outCoinBalance = await meta.getBalance.call(accounts[0]);
  //  let metaCoinBalance = outCoinBalance.toNumber();
  //  let outCoinBalanceEth = await meta.getBalanceInEth.call(accounts[0]);
  //  let metaCoinEthBalance = outCoinBalanceEth.toNumber();
  //  assert.equal(metaCoinEthBalance, 2 * metaCoinBalance);
  //});
  //
  //it("should send coin correctly", async () => {
  //
  //  // Get initial balances of first and second account.
  //  let account_one = accounts[0];
  //  let account_two = accounts[1];
  //
  //  let amount = 10;
  //
  //
  //  let instance = await MetaCoin.deployed();
  //  let meta = instance;
  //
  //  let balance = await meta.getBalance.call(account_one);
  //  let account_one_starting_balance = balance.toNumber();
  //
  //  balance = await meta.getBalance.call(account_two);
  //  let account_two_starting_balance = balance.toNumber();
  //  await meta.sendCoin(account_two, amount, {from: account_one});
  //
  //  balance = await meta.getBalance.call(account_one);
  //  let account_one_ending_balance = balance.toNumber();
  //
  //  balance = await meta.getBalance.call(account_two);
  //  let account_two_ending_balance = balance.toNumber();
  //
  //  assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amo");
  //  assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amo");
  //});

})
