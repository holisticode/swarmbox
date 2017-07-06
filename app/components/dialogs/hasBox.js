angular.module('swarmapp').component('hasBox', {
  templateUrl: 'hasBoxContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      //$ctrl.hash = $ctrl.resolve.hash;
    };

    $ctrl.has = function () {
      $ctrl.close({$value: true});
    };

    $ctrl.hasNot= function () {
      $ctrl.close({$value: false});
    };
  }
});
