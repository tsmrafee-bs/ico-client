(function () {
    'use strict';

    angular.module('BlurAdmin.pages.home')
        .controller('AccountBalanceCtrl', AccountBalanceCtrl);

    /** @ngInject */
    function AccountBalanceCtrl($rootScope,$scope,$location,cookieManagement,environmentConfig,$http,errorToasts,errorHandler,$window) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');

        $scope.showView = '';
        $scope.view = function(view){
          if($rootScope.ico_status == 'open'){
            $scope.showView = view;
            $rootScope.buyPage = view;
          }
        }
    }

})();