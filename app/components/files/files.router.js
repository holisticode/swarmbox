'use strict';

FilesRouter.$inject = ['$stateProvider'];

function FilesRouter($stateProvider) {
    $stateProvider
        .state('files', {
            url: '/files',
            templateUrl: 'app/components/files/files.html',
            controller: require('./files.controller'),
            controllerAs: 'vm',
            reloadOnSearch: false
        })
}

module.exports = function(swarmapp) {
    swarmapp.config(FilesRouter);
};

