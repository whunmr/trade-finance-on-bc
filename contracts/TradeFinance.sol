pragma solidity ^0.4.18;

contract TradeFinance {
  
  struct Order {
    uint64 id;
    address seller;
    address buyer;
    uint128 price;
    uint128 escrow;
    string ricardian_digest;
    bool paid;
  }

  
  mapping (uint64 => Order) public orders;
  uint128 public order_count = 0;

  
  event OrderCreated( uint64 order_id, address seller, address buyer
                    , uint128 price, string ricardian_digest);
  event OrderDeposited(uint64 order_id);
  event EscrowReleased(uint64 order_id);


  function createOrder(address _buyer, uint128 _price, string _digest) public returns (uint64) {
    require(_buyer != address(0));
    require(_price > 0);
    
    order_count++;

    uint64 order_id = uint64(order_count);
    require(order_count == uint128(order_id));

    Order memory order = Order(order_id, msg.sender, _buyer, _price, 0, _digest, false);
    orders[order_id] = order;

    emit OrderCreated(order_id, msg.sender, _buyer, _price, _digest);
    return order_id;
  }

  
  function deposit(uint64 order_id) public payable {
    Order storage order = orders[order_id];
    require(msg.sender == order.buyer);
    require(msg.value >= order.price);
    require(order.escrow == 0);
    
    order.escrow = uint128(msg.value);
    emit OrderDeposited(order_id);
  }

  
  function releaseEscrow(uint64 order_id) public {
    Order storage order = orders[order_id];
    require(msg.sender == order.buyer);
    require(order.paid == false);

    order.paid = true;
    order.seller.transfer(order.price);
    if (order.escrow > order.price) {
      order.buyer.transfer(order.escrow - order.price);
    }

    emit EscrowReleased(order_id);
  }
  
}
