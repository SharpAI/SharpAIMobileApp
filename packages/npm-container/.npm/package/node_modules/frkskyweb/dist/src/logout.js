var request = require('request');
var Utils = require('./utils');
var utils_1 = require("./utils");
var Consts = require('./consts');
var es6_promise_1 = require("es6-promise");
'use strict';
var rejectWithError = function (reject, error) {
    utils_1.default.throwError(error);
    reject(error);
};
var Logout = (function () {
    function Logout(cookieJar) {
        this.requestWithJar = request.defaults({ jar: cookieJar });
    }
    Logout.prototype.doLogout = function () {
        var _this = this;
        return new es6_promise_1.Promise(this.sendLogoutRequest.bind(this));
    };
    Logout.prototype.sendLogoutRequest = function (resolve, reject) {
        this.requestWithJar.get(Consts.SKYPEWEB_LOGOUT_URL, function (error, response, body) {
            if (error) {
                console.log("logout failed");
                rejectWithError(reject, 'logout failed.');
            } else {
                console.log("logout success");
                resolve("Success");
            }
        });
    };
    return Logout;
})();
module.exports = Logout;
