(function () {
    'use strict';

    angular.module('BlurAdmin.pages.verifyUserEmail', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('verifyUserEmail', {
                url: '/email-verify/',
                views:{
                    'admin':{
                        controller: 'VerifyUserEmailCtrl'
                    }
                }
            });
    }

})();
