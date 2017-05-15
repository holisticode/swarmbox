'use strict';

FilesRouter.$inject = ['$stateProvider'];

function FilesRouter($stateProvider) {
    $stateProvider
        .state('files', {
            url: '/files',
            template: require('./files.html'),
            controller: require('./files.controller'),
            controllerAs: 'vm'/*,
            resolve: {
                products: require('../services/resolve/products-list.resolve')
            }
            */
        })
}

module.exports = function(ngapp) {
    ngapp.config(FilesRouter);
};

