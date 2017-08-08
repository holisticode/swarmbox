'use strict';

TransfersController.$inject = ['$state', 'HashHistory', 'StartState', 'PubSub'];

function TransfersController($state, HashHistory, StartState, PubSub) {
  var vm = this;
  vm.hashes = HashHistory.getHashes(StartState.isStarted());

  PubSub.subscribe("hashHistory", function(message) {
    if (message == "updated") {
      vm.hashes = HashHistory.getHashes(StartState.isStarted());
    }
  });
}

module.exports = TransfersController;

