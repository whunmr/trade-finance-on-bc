pragma solidity ^0.4.18;

contract TradeFinance {
  
  struct Order {
    uint64 id;
    address seller;
    address buyer;
    string ricardian_digest;
  }

  
  mapping (uint64 => Order) public orders;
  uint128 public order_count = 0;

  
  event OrderCreated(uint64 id, address seller, address buyer, string ricardian_digest);
  
  
  function createOrder(address _buyer, string ricardian_digest) public returns (uint64) {
    order_count++;

    uint64 order_id = uint64(order_count);
    require(order_count == uint128(order_id));

    Order memory order = Order(order_id, msg.sender, _buyer, ricardian_digest);
    orders[order_id] = order;

    emit OrderCreated(order_id, msg.sender, _buyer, ricardian_digest);
    return order_id;
  }


  
}
