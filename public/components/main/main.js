'use strict';

var app = angular.module('main', ['ui.router']);

app.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
    
    $urlRouterProvider.when('', '/').otherwise('/');
    $httpProvider.interceptors.push('ResponseHandlerService');

    var authorize = ['AuthService', function(AuthService){
        return AuthService.authorize();
    }];
    
    
    $stateProvider
    .state("login", {
        url: "/",
        templateUrl : "/components/main/templates/login.html",
        access : {restricted: false}
    })
    .state("register", {
        url: "/register",
        templateUrl : "/components/main/templates/register.html",
        access : {restricted: false}
    })
    .state("room", {
        url: "/room/:roomName",
        templateUrl : "/components/room/room.html",
        access : {restricted: true},
        resolve : {
            authorize : authorize,
            hasMembbership : ['AuthService', '$stateParams', '$rootScope', function(AuthService, $stateParams, $rootScope) {
                return AuthService.hasRoomMembership($rootScope.userId, $stateParams.roomName);
            }]
        }
    })
    .state("home", {
        url: "/home",
        templateUrl : "/components/home/home.html",
        access : {restricted: true},
        resolve : {
            authorize : authorize
        }
    });
});

app.run(function($rootScope, $location, $state, AuthService, RoomService, socket) {
    
    $rootScope.$on('$stateChangeStart', function(event, next, toParams, loggedIn) {
        AuthService.isLoggedIn().then(function(userId){
            $rootScope.userId = userId;
            if(!userId && next.access.restricted) {
                $state.go('login');
                $state.reload();

            } else if(userId && !next.access.restricted){
                $state.go('home');
            }
            
        });
    });

});