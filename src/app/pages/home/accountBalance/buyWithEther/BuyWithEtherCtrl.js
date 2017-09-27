(function () {
    'use strict';

    angular.module('BlurAdmin.pages.home')
        .controller('BuyWithEtherCtrl', BuyWithEtherCtrl);

    /** @ngInject */
    function BuyWithEtherCtrl($rootScope,$scope,$location,$timeout,$interval,cookieManagement,environmentConfig,$http,errorToasts,errorHandler,$window) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.makingEtherPayment = true;
        $scope.eth = null;
        $scope.ethWatt = null;
        $scope.toggleBuyEtherView = function () {
            $scope.makingEtherPayment = !$scope.makingEtherPayment;
        }

        $http.get(environmentConfig.ICO_API + '/user/icos/?currency__code=ECH', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': vm.token
            }
        }).then(function (res) {
            if (res.status === 201 || res.status === 200) {
                var data = res.data.data;
                $scope.currency = res.data.data.results[0];
                $scope.getRatesEth();
            }
        }).catch(function (error) {
            if(error.status == 403 || error.status == 401){
                    errorHandler.handle403();
                    return
                }
            errorToasts.evaluateErrors(error.data);
        });

        $scope.getRatesEth = function() {
            $http.get(environmentConfig.ICO_API + '/user/icos/' + $scope.currency.id + '/rates/?currency__code=ETH', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 201 || res.status === 200) {
                    var data = res.data.data.results[0];
                    var rate = data.rate;
                    $scope.divisibilityEth = data.currency.divisibility;
                    $scope.ethRate = rate / Math.pow(10,$scope.divisibilityEth);
                }
            }).catch(function (error) {
                $scope.loadingEtheriumView = false;
                if(error.status == 403 || error.status == 401){
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors({message: "Failed to load ECH rates in ETH."});
            });
            $http.get(environmentConfig.ICO_API + '/user/icos/' + $scope.currency.id + '/rates/?currency__code=EUR', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 201 || res.status === 200) {
                    var data = res.data.data.results[0];
                    var rate = data.rate;
                    $scope.divisibilityEur = data.currency.divisibility;
                    $scope.eurRate = rate / Math.pow(10,$scope.divisibilityEur);
                }
            }).catch(function (error) {
                $scope.loadingEtheriumView = false;
                if(error.status == 403 || error.status == 401){
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors({message: "Failed to load ECH rates in EUR."});
            });
        }

        $http.get(environmentConfig.ETH_API + "/user/", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': vm.token
            }
        }).then(function (res) {
            if (res.status === 201 || res.status === 200) {
                $scope.ethereumAddress = res.data.data;
                console.log($scope.ethereumAddress);
            }
        }).catch(function (error) {
            if(error.status == 403 || error.status == 401){
                    errorHandler.handle403();
                    return
                }
            errorToasts.evaluateErrors(error.data);
        });

        $scope.placeQuoteEth = function(eth){
            var ethint = eth.toFixed($scope.divisibilityEth);
            for(var i=0;i<$scope.divisibilityEth;i++){
                ethint = ethint*10;
            }
            ethint = ethint.toFixed(0);
            if($rootScope.allVerified === false) {
               errorToasts.evaluateErrors({message: "You are not yet fully verified. Please complete the details above. Our team will review your details and get to you as soon as possible."});
               return;
            }
            if($rootScope.transactionsLimitExceeded) {
                errorToasts.evaluateErrors({message: "You have reached your limit of 10 transactions."});
                return;
            }
            if(!$rootScope.creditSwitch){
                errorToasts.evaluateErrors({message: "Your account has been temporarily disabled for making transactions."});
                return;
            }
            $http({
                method: 'POST',
                url: environmentConfig.ICO_API + '/user/icos/' + $scope.currency.id + '/quotes/',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                },
                data: {
                    deposit_amount: ethint,
                    deposit_currency: "ETH"
                }
            }).then(function (res) {
                if (res.status === 201 || res.status === 200) {
                    $scope.toggleBuyEtherView();
                    $scope.quoteeth = res.data.data;
                    var quoteEth = {
                        quote: $scope.quoteeth,
                        time: new Date().getTime()
                    };
                    var qouteEthTime = 600000;
                    localStorage.removeItem("quoteRth");
                    localStorage.setItem("quoteEth", JSON.stringify(quoteEth));
                    localStorage.removeItem("eth");
                    localStorage.setItem("eth", eth);
                    $scope.startEthTimeout(qouteEthTime, $scope.quoteeth.id);
                }
            }).catch(function (error) {
                $scope.loadingEtheriumView = false;
                if(error.status == 403 || error.status == 401){
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors(error.data);
            });
        }

        $scope.startEthTimeout = function(time, quote_id) {
            var timeLeft = Math.floor(time / 1000);

            $scope.ethInterval = $interval(function () {
                timeLeft -= 1;
                var minutes = Math.floor(timeLeft / 60);
                var seconds = Math.floor(timeLeft % 60);
                if (seconds < 10) {
                    seconds = '0' + seconds;
                }
                $scope.qouteEthTime = minutes + ":" + seconds;
            }, 1000);

            $scope.purchaseInterval = $interval(function () {
                $http.get(environmentConfig.ICO_API + '/user/icos/' + $scope.currency.id + '/purchases/?quote__id=' + quote_id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200 && res.data.data.results.length > 0) {
                        $interval.cancel($scope.ethInterval);
                        $interval.cancel($scope.purchaseInterval);
                        $timeout.cancel($scope.ethTimeout);
                        $scope.completeEth()
                    }
                });
            }, 10 * 1000);

            $scope.ethTimeout = $timeout(function () {
                $scope.toggleBuyEtherView();
                localStorage.removeItem("quoteEth");
                $interval.cancel($scope.ethInterval);
                $interval.cancel($scope.purchaseInterval);
                $scope.eth = null;
                $scope.ethWatt = null;
            }, time);
        }

        var quote = localStorage.getItem("quoteEth");
        if(quote === null) {
            $scope.toggleBuyEtherView();
        }
        else {
            var data = JSON.parse(quote);
            $scope.quoteeth = data.quote;
            var currentDate = new Date();
            var timeLeft = parseInt(data.time) - currentDate.getTime() + 600000;

            if(timeLeft>0){
                $scope.startEthTimeout(timeLeft);
                $scope.eth = localStorage.getItem("eth");
            }
            else{
                $scope.toggleBuyEtherView();
                localStorage.removeItem("quoteEth");
                $scope.eth = null;
                $scope.ethWatt = null;
            }
        }

        $scope.cancelEth = function() {
            var check = $window.confirm("Do you really want to cancel?")
            if(check===false){
                return;
            }
            $scope.toggleBuyEtherView();
            localStorage.removeItem("quoteEth");
            $timeout.cancel($scope.ethTimeout);
            $interval.cancel($scope.ethInterval);
            $scope.eth = null;
            $scope.ethWatt = null;
        }

        $scope.completeEth = function() {
            localStorage.removeItem("quoteEth");
            $timeout.cancel($scope.ethTimeout);
            $interval.cancel($scope.ethInterval);
            $scope.toggleBuyEtherView();
            $scope.eth = null;
            $scope.ethWatt = null;
            if($location.$$path == '/home' && $rootScope.buyPage == 'ether') {
                $location.path('/transactions');
            }
        }
    }

})();
