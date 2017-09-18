(function () {
    'use strict';

    angular.module('BlurAdmin.pages.home')
        .controller('BuyWithEuroCtrl', BuyWithEuroCtrl);

    /** @ngInject */
    function BuyWithEuroCtrl($rootScope,$scope,$location,cookieManagement,environmentConfig,$http,errorToasts,errorHandler,$window) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');

        $scope.makingPayment = false;
        $scope.reference = "";
        $scope.toggleBuyEuroView = function () {
            $scope.makingPayment = !$scope.makingPayment;
        }

        $http.get(environmentConfig.API + '/company/bank-account/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 201 || res.status === 200) {
                    $scope.reference = res.data.data[0].reference;
                }
            }).catch(function (error) {
                $scope.loadingEtheriumView = false;
                errorToasts.evaluateErrors({message: "Failed to load ECH rates in ETH."});
            });
    }

})();