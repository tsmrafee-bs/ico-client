(function () {
    'use strict';

    angular.module('BlurAdmin.pages.home')
        .controller('HomeCtrl', HomeCtrl);

    /** @ngInject */
    function HomeCtrl($rootScope,$scope,$location,toastr,cookieManagement,environmentConfig,$http,errorToasts,errorHandler,$window) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.loadingCurrencies = true;
        $scope.showView = '';
        $scope.ico_status = 'open';

        $http.get(environmentConfig.ICO_API + '/user/icos/?currency__code=ECH', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': vm.token
            }
        }).then(function (res) {
            if (res.status === 201 || res.status === 200) {
                var data = res.data.data;
                $scope.currency = res.data.data.results[0];
                $scope.ico_status = $scope.currency.status;
                $rootScope.ico_status = $scope.ico_status;
            }
        }).catch(function (error) {
            errorToasts.evaluateErrors(error.data);
        });

        vm.getUserAccounts = function(){
            if(vm.token) {
                $scope.loadingCurrencies = true;
                $http.get(environmentConfig.API + '/accounts/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingCurrencies = false;
                    if (res.status === 200) {
                        $scope.currencies = res.data.data.results[0].currencies;
                        $scope.activeCurrency = $scope.currencies.find(function(element){
                            return element.currency.code === 'ECH';
                        });
                    }
                }).catch(function (error) {
                    $scope.loadingCurrencies = false;
                    if(error.status == 403){
                        errorHandler.handle403();
                        return;
                    }
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getUserAccounts();

        $scope.getAmount = function(amount, div){
            var retval = amount / Math.pow(10,div);
           // console.log(retval)
            return retval;
        }

        $scope.addressCopied = function(){
            toastr.success('Address copied');
        }

        $scope.getLatestTransactions = function(){
            if(vm.token) {
                var transactionsUrl = environmentConfig.API + "/transactions/";

                $http.get(transactionsUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingTransactions = false;
                    if (res.status === 200) {
                        $scope.transactionsData = res.data.data;
                        $scope.transactions = $scope.transactionsData.results;
                        
                        $scope.transactionsInEch = $scope.transactions.filter(function(node){
                            return node.currency.code == 'ECH';
                        });

                        if($scope.transactionsInEch.length >= 10) {
                            $rootScope.transactionsLimitExceeded = true;
                        }
                        else {
                            $rootScope.transactionsLimitExceeded = false;
                        }
                    }
                }).catch(function (error) {
                    if (error.status == 403) {
                        errorHandler.handle403();
                        return
                    }
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        $scope.getLatestTransactions();
    }

})();
