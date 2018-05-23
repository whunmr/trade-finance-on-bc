pragma solidity ^0.4.18;

import "./oraclizeAPI.sol";

contract TradeFinance is usingOraclize {
  
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
  mapping (bytes32 => uint64) public oraclize_id_to_order_ids;
  uint128 public order_count = 0;

  //////////////////////////////////////////////////////////////////////////////
  function create_order(address buyer, uint128 price, string digest) public returns (uint64) {
    require(buyer != address(0));
    require(price > 0);
    
    return __create_order(__alloc_order_id(), msg.sender, buyer, price, digest);
  }

  function __create_order( uint64 order_id
                         , address seller
                         , address buyer
                         , uint128 price
                         , string digest) internal returns (uint64) {
    Order memory order = Order(order_id, seller, buyer, price, 0, digest, false);
    orders[order_id] = order;

    emit OrderCreated(order_id, seller, buyer, price, digest);
    return order_id;
  }
    
  function __alloc_order_id() internal returns (uint64) {
    order_count++;
    require(order_count == uint128(uint64(order_count)));
    return uint64(order_count);
  }

  //////////////////////////////////////////////////////////////////////////////
  function deposit(uint64 order_id) public payable {
    Order storage order = orders[order_id];
    require(msg.sender == order.buyer);
    require(msg.value >= order.price);
    require(order.escrow == 0);
    
    order.escrow = uint128(msg.value);
    emit OrderDeposited(order_id);
  }

  //////////////////////////////////////////////////////////////////////////////
  function release_escrow(uint64 order_id) public {
    Order storage order = orders[order_id];
    require(msg.sender == order.buyer);
    require(order.paid == false);

    __release_escrow(order, order_id);
  }

  function __release_escrow(Order storage order, uint64 order_id) internal {
    order.paid = true;
    order.seller.transfer(order.price);
    if (order.escrow > order.price) {
      order.buyer.transfer(order.escrow - order.price);
    }

    emit EscrowReleased(order_id);
  }

  function release_escrow_by_seller(uint64 order_id) public payable {
    Order storage order = orders[order_id];
    require(msg.sender == order.seller);
    require(order.paid == false);

    if (oraclize_getPrice("URL") <= this.balance) {
      bytes32 oraclize_id
        = oraclize_query("URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP");
      oraclize_id_to_order_ids[oraclize_id] = order_id;
    }
  }

  function __callback(bytes32 oraclize_id, string result) {
    require(msg.sender == oraclize_cbAddress());

    uint64 order_id = oraclize_id_to_order_ids[oraclize_id];
    
    bool order_received = order_id != 0
                          && bytes(result).length != 0;
    
    if (order_received) {
      Order storage order = orders[order_id];
      require(order.paid == false);

      __release_escrow(order, order_id);
    }
  }
  
  //////////////////////////////////////////////////////////////////////////////
  event OrderCreated( uint64 order_id, address seller, address buyer
                    , uint128 price, string ricardian_digest);
  event OrderDeposited(uint64 order_id);
  event EscrowReleased(uint64 order_id);
}

