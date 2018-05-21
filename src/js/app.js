App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');
    
      for (i = 0; i < 10; i ++) {
        petTemplate.find('.panel-title').text("Order id: " + i);

        petTemplate.find('.seller').text("N/A");
        petTemplate.find('.buyer').text("N/A");
        petTemplate.find('.price').text("");
        petTemplate.find('.ricardian_digest').text("");
        petTemplate.find('.paid').text("");

        petTemplate.find('.btn-create').attr('data-id', i);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
      // Is there an injected web3 instance?
      if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider;
      } else {
          // If no injected web3 instance is detected, fall back to Ganache
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
      
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('TradeFinance.json', function(data) {
          var TradeFinanceArtifact = data;
          App.contracts.Adoption = TruffleContract(TradeFinanceArtifact);
          App.contracts.Adoption.setProvider(App.web3Provider);
          return App.markAdopted();
      });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
      var adoptionInstance;

      App.contracts.Adoption.deployed().then(function(instance) {
          adoptionInstance = instance;

          return adoptionInstance.getAdopters.call();
      }).then(function(adopters) {
          for (i = 0; i < adopters.length; i++) {
              if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                  $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
              }
          }
      }).catch(function(err) {
          console.log(err.message);
      });

  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

      web3.eth.getAccounts(function(error, accounts) {
          if (error) {
              console.log(error);
          }

          console.log(accounts);
          
          var account = accounts[0];

          App.contracts.Adoption.deployed().then(function(instance) {
              adoptionInstance = instance;

              // Execute adopt as a transaction by sending account
              return adoptionInstance.adopt(petId, {from: account});
          }).then(function(result) {
              return App.markAdopted();
          }).catch(function(err) {
              console.log(err.message);
          });
      });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
