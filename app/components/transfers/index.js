(function () {
'use strict';

angular.module('swarmapp')
        .controller('TransfersRouter', ['$stateProvider', TransfersRouter]);

function TransfersRouter($stateProvider) {
    $stateProvider
        .state('transfers', {
            url: '/transfers',
            templateUrl: 'app/components/transfers/transfers.html',
            controller: transfersController,
            controllerAs: 'vm'/*,
            resolve: {
                products: require('../services/resolve/products-list.resolve')
            }
            */
        })
}

angular.module('swarmapp').config(TransfersRouter);

function transfersController($state) {
    var vm = this;
    vm.hashes = hashes;
}

})();
