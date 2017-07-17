angular.module('swarmapp').component('loadingSwarmboxComponent', {
  templateUrl: 'loadingSwarmboxContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (PubSub) {
    var $ctrl = this;

    $ctrl.title     = "Connecting to you swarmbox...";
    $ctrl.messages  = [];
    $ctrl.status    = "";
    $ctrl.endpoint  = "";

    $ctrl.$onInit = function () {
      PubSub.subscribe("loadingSwarmbox", function(message) {
        if (message.status == "connecting") {
          message.statusMsg = "Trying to connect to: ";
          $ctrl.messages.push(message);
        } else { 
          message.statusMsg = "Result: ";
          $ctrl.messages.push(message);
        }
      });
      //$ctrl.hash = $ctrl.resolve.hash;
    };
  }
});
