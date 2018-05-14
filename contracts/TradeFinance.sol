pragma solidity ^0.4.18;

contract TradeFinance {
  
  struct Order {
    uint64 id;
    address seller;
    address buyer;
    string ricardian_digest;
  }

  mapping (uint64 => Order) public orders;
  uint128 public order_count;

  constructor() public {
    order_count = 0;
  }

  function createOrder(address _buyer, string ricardian_digest) public returns (uint64) {
    order_count++;
    require(order_count == uint128(uint64(order_count)));

    Order memory order = Order(uint64(order_count), msg.sender, _buyer, ricardian_digest);

    orders[uint64(order_count)] = order;
    return uint64(order_count);
  }

  
}
