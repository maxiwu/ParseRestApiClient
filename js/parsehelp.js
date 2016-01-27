//Option #1, AngularJS + Parse
function ParseRestHttp(httpobj, appId, restKey) {
	this.appId = appId;
	this.restKey = restKey;
	this.httpo = httpobj;
	this.req = this.InitParseReq();
}

// depend on AngularJS, without method and url
ParseRestHttp.prototype.InitParseReq = function() {
	var req = {};
	req.headers = {
		"X-Parse-Application-Id" : this.appId,
		"X-Parse-REST-API-Key" : this.restKey,
		"Content-Type" : "application/json"
	};
	this.req = req;
	return req;
}

// tell Parse that this request needs to create a session
ParseRestHttp.prototype.UseSession = function(value) {
	if (value) {
		this.req.headers["X-Parse-Revocable-Session"] = 1;
	} else {
		delete this.req.headers["X-Parse-Revocable-Session"];
	}
}

// after parse give you a session, use it in new request
ParseRestHttp.prototype.SetSession = function(token) {
	this.req.headers["X-Parse-Session-Token"] = token;
}

// make GET request
ParseRestHttp.prototype.Get = function(url, params, data) {
	var req = this.req;
	req.url = url;
	req.method = 'GET';

	if (params != null) {
		req.params = params;
	}
	if (data != null) {
		req.data = data;
	}
	return this.httpo(req);
}
// make PUT request
ParseRestHttp.prototype.Put = function(url, params, data) {
	var req = this.req;
	req.url = url;
	req.method = 'PUT';

	if (params != null) {
		req.params = params;
	}
	if (data != null) {
		req.data = data;
	}
	return this.httpo(req);
}
// make POST request
ParseRestHttp.prototype.Post = function(url, params, data) {
	var req = this.req;
	req.url = url;
	req.method = 'POST';

	if (params != null) {
		req.params = params;
	}
	if (data != null) {
		req.data = data;
	}
	return this.httpo(req);
}

ParseRestHttp.prototype.PrRegister = function(username, password, email) {
	var url = "https://api.parse.com/1/users";
	var data = {
		"username" : username,
		"password" : password,
		"email" : email
	};
	return this.Post(url, null, data);
}

ParseRestHttp.prototype.PrLogin = function(username, password) {
	var url = "https://api.parse.com/1/login";
	this.UseSession(true);
	var params = {
		"username" : username,
		"password" : password
	};
	return this.Get(url, params);
}

ParseRestHttp.prototype.PrLogout = function(sessionToken) {
	var url = "https://api.parse.com/1/logout";
	this.SetSession(sessionToken);
	return this.Post(url);
}

ParseRestHttp.prototype.PrLinkToFacebook = function(PrUser, fbAuthData) {
	var url = "https://api.parse.com/1/users/" + PrUser.objectId; // parse
																	// user id
	this.SetSession(PrUser.sessionToken);
	var data = {
		"authData" : this.GenerateFbAuthData(fbAuthData)
	};
	return this.Put(url, null, data);
}

ParseRestHttp.prototype.FbLogin = function(fbAuthData) {
	var url = "https://api.parse.com/1/users/";
	this.UseSession(true);

	var data = {
		"authData" : this.GenerateFbAuthData(fbAuthData)
	};
	return this.Post(url, null, data);
}

ParseRestHttp.prototype.PrUnlinkFromFacebook = function(PrUser) {
	var url = "https://api.parse.com/1/users/" + PrUser.objectId; // parse
																	// user id
	this.SetSession(PrUser.sessionToken);
	var data = {
		"authData" : {
			"facebook" : null
		}
	};
	return this.Put(url, null, data);
}

ParseRestHttp.prototype.GenerateFbAuthData = GenFbAuthData;

// generate Parse format authData from Facebook authData
function GenFbAuthData(fbAuth) {
	var extd = new Date();
	extd.setSeconds(extd.getSeconds() + fbAuth.expiresIn);
	// JSON object
	var data = {
		"facebook" : {
			"id" : fbAuth.userID,
			"access_token" : fbAuth.accessToken,
			"expiration_date" : extd.toISOString()
		}
	};
	return data;
}

// Option #2, use dependency injection
function ParseRestCHttp() {
}

ParseRestCHttp.prototype.SetApp = function(appId, restKey) {
	this.appId = appId;
	this.restKey = restKey;
}
// UrlSetter(url)
ParseRestCHttp.prototype.SetUrl;
ParseRestCHttp.prototype.Get;
ParseRestCHttp.prototype.Post;
ParseRestCHttp.prototype.Put;
// SetHeader(key,value)
ParseRestCHttp.prototype.SetHeader;
// RemoveHeader(key)
ParseRestCHttp.prototype.RemoveHeader;
// SetParams(params)
ParseRestCHttp.prototype.SetParams;
// SetReqBody(data)
ParseRestCHttp.prototype.SetReqBody;

ParseRestCHttp.prototype.ReadMessage = function(token) {
	this.SetUrl("https://api.parse.com/1/classes/PrivateData");
	this.SetHeader("X-Parse-Application-Id", this.appId);
	this.SetHeader("X-Parse-REST-API-Key", this.restKey);
	this.SetHeader("Content-Type", "application/json");
	if (token) {
		this.SetHeader("X-Parse-Session-Token", token);
	}

	// this.Get is Async
	this.result = this.Get();
	return this;
}

ParseRestCHttp.prototype.PrRegister = function(username, password, email) {
	this.SetUrl("https://api.parse.com/1/users");
	this.SetHeader("X-Parse-Application-Id", this.appId);
	this.SetHeader("X-Parse-REST-API-Key", this.restKey);
	this.SetHeader("Content-Type", "application/json");
	this.SetReqBody({
		"username" : username,
		"password" : password,
		"email" : email
	});

	// this.Get is Async!
	this.result = this.Post();
	return this;
}

ParseRestCHttp.prototype.OnSuccess = function(callback) {
	if (typeof this.callback == 'undefined') {
		this.callback = new Array();
	}
	this.callback.push(callback);
}

ParseRestCHttp.prototype.DoOnSuccessCallback = function(response) {
	for (var i = 0; i < this.callback.length; i++) {
		this.callback[i](response);
	}
}