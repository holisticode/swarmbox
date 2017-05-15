'use strict';

TransfersRouter.$inject = ['$stateProvider'];

function TransfersRouter($stateProvider) {
    $stateProvider
        .state('transfers', {
            url: '/transfers',
            template: require('./transfers.html'),
            controller: require('./transfers.controller'),
            controllerAs: 'vm'/*,
            resolve: {
                products: require('../services/resolve/products-list.resolve')
            }
            */
        })
}

module.exports = function(ngapp) {
    ngapp.config(TransfersRouter);
};

