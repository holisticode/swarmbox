'use strict';

TransfersRouter.$inject = ['$stateProvider'];

function TransfersRouter($stateProvider) {
    $stateProvider
        .state('transfers', {
            url: '/transfers',
            templateUrl: 'app/components/transfers/transfers.html',
            controller: require('./transfers.controller'),
            controllerAs: 'vm'
        })
}

module.exports = function(swarmapp) {
    swarmapp.config(TransfersRouter);
};


