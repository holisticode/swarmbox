angular.module('swarmapp').component('askDialog', {
  templateUrl: 'askDialog.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;
    $ctrl.question = "";

    $ctrl.title = "Please confirm";

    $ctrl.ok = function () {
      $ctrl.close({$value: true});
    };

    $ctrl.$onInit = function () {
      $ctrl.question = this.resolve.question;
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});
