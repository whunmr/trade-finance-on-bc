const truffleAssert = require('truffle-assertions');
const assert = require("chai").assert;

const MetaCoin = artifacts.require("MetaCoin");
const TradeFinance = artifacts.require("TradeFinance");

function assert_struct_eq(a1, a2) {
  return assert.equal(JSON.stringify(a1), JSON.stringify(a2));
}

contract('Testing for TradeFinance Contract', async(accounts) => {
  let seller = accounts[0];
  let buyer = accounts[1];
  let price = 1e19;
  let digest = "86d3f3a95c324c9479bd8986968f4327";

    
  it("should contains zero order in contract after deployed", async() => {
    let ___c = await TradeFinance.deployed();
    let order_count = await ___c.order_count();
    assert.equal(order_count, 0);
  })

    
  it("should able to create order, deposit and release escrow.", async() => {
    let ___c = await TradeFinance.deployed();
    let order_id = await ___c.create_order.call(buyer, price, digest);
    let tx       = await ___c.create_order     (buyer, price, digest);
      
    truffleAssert.eventEmitted(tx, 'OrderCreated', (ev) => {
      return ev.ricardian_digest == digest;
    });

    //////////////////////////////////////////////////////////////////////////////
    let deposit_amount = 2e19;
    await ___c.deposit(order_id, {value: deposit_amount, from: buyer});

    let order = await ___c.orders.call(order_id);
    assert_struct_eq( order
                    , [order_id, seller, buyer, price.toString()
                    , deposit_amount.toString(), digest, false]);
      
    //////////////////////////////////////////////////////////////////////////////
    tx = await ___c.release_escrow(order_id, {from: buyer});

    assert.equal((await ___c.orders.call(order_id))[6]/*.paid*/, true);

    truffleAssert.eventEmitted(tx, 'EscrowReleased', (ev) => {
      return ev.order_id.toNumber() == order_id;
    });
  })
  
})
