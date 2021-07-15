(function () {
  console.log('auth');
  aimauth = {};
  function Account(id_token) {
    const id = this.idToken = JSON.parse(atob((this.id_token = id_token).split('.')[1]));
    this.sub = id.sub;
    this.name = id.name || id.email || id.sub;
    this.username = id.preferred_username || this.name;
    this.accountIdentifier = this.idToken.oid;
  };
  Account.prototype = {
    // getSecret() {
    //   console.log(111111, this.id_token);
    //   return $().url('https://aliconnect.nl/api/').query('request_type', 'account_secret').headers('Authorization', 'Bearer ' + this.id_token).get();
    // },
  }
  aimauth.NodeApplication = function UserAgentApplication(config) {
  }
  aimauth.UserAgentApplication = function UserAgentApplication(config) {
    aimClient = this;
    Aim.extend($.config, config);
    config = this.config = $.config;
    this.clients = [];
    this.servers = new Map;
    this.storage = window[config.cache.cacheLocation];
    this.clientId = config.auth.client_id = config.client_id || config.auth.client_id;
    // config.auth.scopes = config.scope.split(' ');

    // this.clientSecret = config.client_secret = this.storage.getItem('client_secret');
    if (this.storage.getItem('aim.id_token')) {
      this.account = new Account(this.storage.getItem('aim.id_token'));
      console.log(this.account);
    }
    if (this.storage.getItem('aim.access_token')) {
      // console.log(this.storage.getItem('access_token'));
    }
    const url = new URL(document.location);
    if (url.searchParams.has('code')){
      // return console.error(url.searchParams.get('code'));
      this.getAccessToken({code: url.searchParams.get('code')}).then(e => {
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        document.location.href = url.href;
      });
      throw "Sign in processed. Please wait";
    }



    // console.error(this.config.components, this.config, $().schemas())


    (function loadpar(arr, path = '') {
      if (arr) {
        for (let [key,value] of Object.entries(arr)) {
          if (typeof value === 'object') {
            loadpar(value, `${path}${key}-`);
          } else {
            // console.log(`%${path}${key}%`,value);
            $.his.api_parameters[`%${path}${key}%`] = value;
          }
        }
      }
    })(config);
    // if (config.components && config.components.schemas) {
    //   $().schemas(config.components.schemas);
    // }
    $.his.items = {};
  }
  aimauth.UserAgentApplication.prototype = {
    // getClient(src) {
    //   src = new URL(src, this.config.url ? this.config.url : document.location).href;
    //   // console.log(src, this.config.url, this.servers.length);
    //   for (let [url, client] of this.servers.entries()) {
    //     if (src.match(url)) return client;
    //   }
    //   return this.clients[0];
    // },
    api(src) {
      for (let client of this.clients) {
        // console.log(client, client.config.servers);
        // client.config.servers = Array.from(client.config.servers);
        for (let [i,server] of Object.entries(client.config.servers)) {
          // console.log(i,server);
          if (src.match(server.url) || !src.match(/^http/)) {
            return client.api(src);
          }
        }
      }
    },
    clientAttr(options) {
      return $().url('https://aliconnect.nl/api').query({
        request_type: 'client_attr',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).post(options).then(e => {
        console.log(e.target.responseText)
      })
    },
    getAccount() {
      return this.account;
    },
    getAccessToken(options){
      if (options){
        options = Object.assign({
          grant_type: 'authorization_code',
          // code: options.code, // default, overide by params
          client_id: this.config.auth.client_id,
          // 'client_secret' => $this->client_secret,
          access_type: 'offline', // only if access to client data is needed when user is not logged in
        }, options);
        // console.debug(options);
        return $.promise('getAccessToken', resolve => $()
        .url(new URL('token', this.config.auth.url).href)
        .post(options)
        // .post()
        .then(e => {
          console.log(this);
          this.storage.setItem(`aim.${this.clientId}.id_token`, e.body.id_token);
          this.storage.setItem('aim.id_token', e.body.id_token);
          this.storage.setItem('aim.access_token', e.body.access_token);
          this.storage.setItem('aim.refresh_token', e.body.refresh_token);
          this.account = new Account(e.body.id_token);
          // return;
          // this.init({auth: e.body});
          // const url = new URL(document.location.href);
          // url.searchParams.delete('code');
          // url.searchParams.delete('state');
          // $.his.replaceUrl( url.toString() );
          // $.clipboard.reload();
          resolve();
        }));
      }
      // console.debug(this.access_token);
      return this.access_token;
    },
    init(){
      return this;
      // return console.warn(this);
      // Object.assign(this, options);
      // const auth = this.config.auth;
      // ['id_token', 'refresh_token', 'access_token'].forEach(token => $().storage(token, auth[token] = auth[token] || $().storage(token) || ''));
      // window.sessionStorage.clear();
      // localStorage.clear();
      const access_token = auth.api_key || auth.access_token || auth.id_token;
      // console.log([access_token, auth.api_key, auth.access_token, auth.id_token]);
      if (access_token){
        try {
          // console.error(access_token);
          this.access = JSON.parse(atob(access_token.split('.')[1]));
          this.sub = this.access.sub;
          this.aud = this.access.aud;
          if (this.ws){
            this.send({ headers: {Authorization:'Bearer ' + aimClient.getAccessToken() } });
          }
        } catch (err){
        }
      }
      if (token = this.token(auth.api_key)){
        this.access_token = token.token;
      } else if (token = this.token(auth.access_token)){
        const refresh = this.token(this.access_token = auth.refresh_token);
        if (refresh){
          clearTimeout(this.refreshTokenTimeout);
          // console.error(`REFRESH EXPIRES IN ${expires_in}`, $.auth.refreshTokenTimeout);
          this.refreshTokenTimeout = setTimeout(this.refreshToken, (refresh.expires_in - 2) * 1000);
        }
      }
      // $().storage(this.key+'AuthProvider',this.auth)
      return this;
    },
    login(options){
      return $.promise('Login', async (resolve, fail) => {
        // console.log('LOGIN', options);
        // return;

        if (options !== undefined){
          let state = Math.ceil(Math.random() * 99999);
          console.log(99999, options);
          options = {
            // scope: 'name+email+phone_number',
            response_type: 'code',
            client_id: this.config.auth.client_id = this.config.auth.client_id || this.config.auth.clientId,
            redirect_uri: this.config.auth.redirect_uri = this.config.auth.redirect_uri || this.config.auth.redirectUri || this.config.redirect_uri || this.config.redirectUri,
            state: state,
            prompt: 'consent',
            scope: options.scope || options.scopes.join(' ') || '',
            // socket_id: $.WebsocketClient.socket_id,
          }
          const url = $().url(this.config.auth.url).query(options).toString();
          console.log(url, this.config);
          if (document.location.protocol === 'file:'){
            options.socket_id = this.ws.socket_id;
            this.loginWindow = window.open(
              url,
              'login',
              `top=${10},left=${10},width=400,height=500,resizable=0,menubar=0,status=0,titlebar=0`
            );
          } else {
            $.clipboard.reload(url);
          }
        }
        this.init();

        window.addEventListener('focus', e => {
          if (this.access_token) {
            // console.log('JE BENT INGELOGT, DUS CONTROLEREN OF TOKEN NOG OK IS ALS HET EEN INLOG TOKEN IS');
            const access = this.access;
            // als een nonce aanwezig is dan is het een inlog token.
            // controleer of token nog actief is, c.q. gebruiker is ingelogt
            if (access.nonce) {
              $().url('https://login.aliconnect.nl/api/oauth').headers('Authorization', 'Bearer ' + this.access_token).post({
                request_type: 'access_token_verification',
                // access_token: aimClient.access_token,
              }).then(e => {
                if (e.target.status !== 200) {
                  $().logout();
                }
              });
            }
            // console.log(aimClient);
          }
        });

        // console.log(this);
        if (this.account) {
          resolve(this.account);
        } else {
          fail('no login');
        }

        // let previousIdToken = $.auth.id_token;
        // let previousAccessToken = $.auth.access_token;
        // $.auth.init();
        // if ($.auth.id_token && previousIdToken !== $.auth.id_token){
        // 	$().emit('login');
        // }
      });
    },
    loginPopup(options) {
      return $.promise('LoginPopup', async (resolve, fail) => {
        options = {
          // scope: 'name+email+phone_number',
          response_type: 'code',
          client_id: this.config.auth.client_id = this.config.auth.client_id || this.config.auth.clientId,
          // redirect_uri: this.config.auth.redirect_uri = this.config.auth.redirect_uri || this.config.auth.redirectUri || this.config.redirect_uri || this.config.redirectUri,
          // state: state,
          prompt: 'consent',
          scope: options.scope || options.scopes.join(' ') || '',
          // socket_id: $.WebsocketClient.socket_id,
        }
        const url = $().url(this.config.auth.url).query(options).toString();
        const height = 600;
        const width = 400;
        let rect = document.body.getBoundingClientRect();
        let top = window.screenTop + (window.innerHeight - height) / 2;
        let left = window.screenLeft + (window.innerWidth - width) / 2;
        const popup = window.open(url, 'loginPopup', `top=${top},left=${left},width=${width},height=${height},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`);

        // popup.addEventListener('onload', e => {
        //   console.log(e);
        // })

        // This does nothing, assuming the window hasn't changed its location.
        // setInterval(()=>{
        //   console.log('msg');
        //   popup.postMessage("hello there!", "https://login.aliconnect.nl");
        // },1000);
        // popup.postMessage("The user is 'bob' and the password is 'secret'",
        //
        const interval = setInterval(() => {
          popup.postMessage({
            msg: "loginPopup",
          }, "https://login.aliconnect.nl");
        },1000);
        window.addEventListener("message", (event) => {
          console.log(event.origin, event);
          if (event.data.msg === 'loginPopupAck') {
            clearInterval(interval);
          }
          if (event.data.url) {
            this.getAccessToken({code: new URL(event.data.url, document.location).searchParams.get('code')}).then(e => {
              resolve({
                accessToken: this.storage.getItem('aim.access_token'),
                account: this.account,
                accountState: "72fc40a8-a2d7-4998-afd0-3a74589015ac",
                expiresOn: null,
                fromCache: false,
                idToken: this.account.idToken,
                // idToken: {
                //   rawIdToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5Pbz…SUqywC4QuHklGPvrKVQiMc9jpdJfz2DMIfT6O--gxZD2ApJZg",
                //   claims: {…},
                //   issuer: "https://login.microsoftonline.com/09786696-f227-4199-91a0-45783f6c660b/v2.0",
                //   objectId: "f40f8462-da7f-457c-bd8c-d9e5639d2975", subject: "w6TIVTl01uuD9UHe12Fk6YLiilqhf1arasLwPwGnxV0", …}
                // idTokenClaims: {aud: "4573bb93-5012-4c50-9cc5-562ac8f9a626", iss: "https://login.microsoftonline.com/09786696-f227-4199-91a0-45783f6c660b/v2.0", iat: 1625751439, nbf: 1625751439, exp: 1625755339, …}
                scopes: [],
                tenantId: "09786696-f227-4199-91a0-45783f6c660b",
                tokenType: "id_token",
                uniqueId: "f40f8462-da7f-457c-bd8c-d9e5639d2975",
              });
            });
          }

          // Do we trust the sender of this message?  (might be
          // different from what we originally opened, for example).
          // if (event.origin !== "http://example.com")
          //   return;

          // event.source is popup
          // event.data is "hi there yourself!  the secret response is: rheeeeet!"
        }, false);
        // win.onbeforeunload = e => resolve();
      });
      // this.authProvider.login(this.config.auth);
    },
    config(config){
      $.extend(this.config, config);
      if (this.config.components && this.config.components.schemas) {
        $().schemas(this.config.components.schemas);
      }
    },
    // login() {
    //   return this.authProvider.login(...arguments);
    // },
    logout(options){
      // console.log(sessionStorage('aim.id_token'));
      if (this.storage.getItem('aim.id_token')) {
        this.storage.removeItem('aim.id_token');
        this.storage.removeItem('aim.refresh_token');
        this.storage.removeItem('aim.access_token');
        // $.clipboard.reload();
        $.clipboard.reload($().url('https://login.aliconnect.nl/api/oauth').query({
          prompt: 'logout',
          client_id: $().client_id || '',
          redirect_uri: document.location.origin + document.location.pathname,
        }).toString());
      } else {
        const searchParams = new URLSearchParams(document.location.href);
        if (searchParams.get('redirect_uri')) {
          document.location.href = searchParams.get('redirect_uri');
        }
      }
    },
    refreshToken(){
      return console.error('refreshToken');
      if (this.refreshTokenHandle) return;
      console.log($.Client);
      this.refreshTokenHandle = new $.Client('https://login.aliconnect.nl/api/token').post({
        grant_type: 'refresh_token',
        refresh_token: $.his.cookie.refresh_token,
        client_id: $().client_id,
        // 'redirect_uri' => self::$redirect_uri,
        // 'client_secret' => $this->client_secret,
      }).then(e => {
        // console.debug('REFR TOKEN',e);
        this.refreshTokenHandle = null;
        // var token = e.body.access_token;
        // var access = JSON.parse(atob(token.split('.')[1]));
        // var time = new Date().getTime()/1000;
        // var expires_in = Math.round(access.exp - time);
        // console.error('RRRRRRRRRRRRefreshToken', expires_in, access);
        // $.his.cookie = {
        // 	access_token: e.body.access_token
        // };
        // var token = $.auth.access_token = $.his.cookie.access_token || $.his.cookie.id_token;
        // var access = JSON.parse(atob(token.split('.')[1]));
        // var time = new Date().getTime()/1000;
        // var expires_in = Math.round(access.exp - time);
        // console.error('RRRRRRRRRRRRefreshToken', expires_in, access);
        //
        return;
        $.his.cookie = {
          access_token: e.body.access_token
        };
        $.auth.init();
        // $.auth.refreshToken = () => {console.debug('NOOOO');};
        // updateAccessToken();
      });
    },
    token(token, clientSecret){
      if (token){
        const time = new Date().getTime() / 1000;
        const access = JSON.parse(atob(token.split('.')[1]));
        return {
          token: token,
          access: access,
          time: time,
          expires_in: Math.round(access.exp - time),
          isValid: access.exp > time || true,
        }
      }
    },
    trackLocalSession(){
      return;
      clearTimeout(arguments.callee.timeout);
      const cookie = $.his.cookie;
      // console.debug (`trackLocalSession`);
      if (!cookie.id_token && auth.id_token > ''){
        return this.logout();
      } else if (cookie.id_token > '' && !auth.id_token){
        // return client.login();
      }
      arguments.callee.timeout = setTimeout(arguments.callee, $.config.trackLocalSessionTime);
    },
    trackSession(){
      return;
      // console.error (`trackSession`, $.auth.id.iss, arguments.callee.timeout);
      if (arguments.callee.httpRequest) return;
      clearTimeout(arguments.callee.timeout);
      window.removeEventListener('focus', arguments.callee);
      window.addEventListener('focus', arguments.callee);
      // $.auth.id.iss = 'login.aliconnect.nl/api/oauth';
      // alert(1);
      arguments.callee.timeout = setTimeout(arguments.callee, $.config.trackSessionTime);
      arguments.callee.httpRequest = $().url(authorizationUrl)
      .query('request_type', 'check_access_token')
      .headers('Authorization', 'Bearer ' + auth.id_token)
      .get()
      .then(e => {
        console.warn('trackSession', e.target);
        arguments.callee.httpRequest = null;
        // console.debug($.auth.id.nonce, e.target.status, e.target.responseText);
        if (e.target.status !== 200){
          window.removeEventListener('focus', arguments.callee);
          // return $.auth.logout();
        }
      });
    },
    getAccountByUsername(name) {
      console.log(name);
      return this.account;
    },
    acquireTokenSilent(silentRequest) {
      return $.promise('LoginPopup', async (resolve, fail) => {
        resolve({});
      })
    },
    acquireTokenPopup(aimRequest) {
      return this.loginPopup(aimRequest);
    }
  };

  aimauth.InteractionRequiredAuthError = function () {

  }

  aimauth.Client = function Client (config) {
    this.config = config;
    aimClient.clients.push(this);
    config.servers = config.servers || [{url: $.config.url}];
    Array.from(config.servers).forEach(server => aimClient.servers.set(server.url, this));
    // this.url = config.servers[0].url;
    // this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    return this;
    // client(options){
    //   this.get(Client, options ? Object.assign(options,{authProvider: options.authProvider || this.authProvider()}) : null);
    //   return this;
    // },
    // console.error(...arguments);
    // [...arguments].forEach($(this).extend)
    this.config = {
      id: {},
      server: [
        {
          url: window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api',
        }
      ]
    };
    [...arguments].forEach(options => $(this.config).extend(options));
    this.url = this.config.servers[0].url;
    this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    clients.set(this.hostname, this);
    // this.config = config;
    // console.debug(this.authProvider);
    // if (this.access_token = this.authProvider.getAccessToken()){
    // 	this.access = JSON.parse(atob(this.access_token.split('.')[1]));
    // 	this.sub = this.access.sub;
    // 	this.aud = this.access.aud;
    // }
    // $.his.dms = $.his.dms || [];
    // $.his.dms.push(this);
    // $().dms[selector] = this;
    // Object.assign(this, context);
    // this.config = context;
    // console.debug('SERVERS', this.servers);

    // this.id = {};
    // this.servers = this.servers || [];
    // this.server = this.servers[0] || {};
    // this.url = this.server.url || (window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api');
    // const hostname = this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    // $[hostname] = this;
    // console.debug('Client', this.hostname, this);
    // const servers = this.servers || [];
    // this.server = servers[0] || {};
    // console.debug(`Client ${selector} = ${context.info ? context.info.title : ''}`);
  }
  aimauth.Client.prototype = {
    loginUrl() {
      console.error(this.config.client_id);
      return $()
      .url('https://login.aliconnect.nl/')
      .query({
        prompt: 'login',
        response_type: 'code',
        client_id: this.config.client_id,
        redirect_uri: document.location.origin + (this.config.redirect_path || ''),
        // client_id: config.auth.client_id || config.auth.clientId,
        // state: state,
        scope: this.config.scope,//('all'),
        // socket_id: data.socket_id,
      });
    },
    // configGet() {
    //   return $().url(this.url+'/../config.json').get().then(e => {
    //     console.warn('configGet', e.body);
    //     $.extend(this.config, e.body);
    //     // $.config = e.body;
    //   }).catch(console.error);
    // },
    // configUserGet() {
    //   return $().url(this.url+`/../config/${this.authProvider.sub}/config.json`).get().then(e => {
    //     $.extend(this.config, e.body);
    //     // $.extend($.config, JSON.parse(e.target.responseText));
    //     // $($.config).extend(aimClient.api_user = e.body);
    //   }).catch(err => {
    //     // aimClient.api_user = {};
    //   });
    // },
    api(src){
      return $()
      .url(new URL(src.replace(/^\//, ''), this.config.servers[0].url + '/').href)
      .authProvider(this.config.authProvider)
      .body()
    },
    // getApi(){
    //   return $.promise( 'Get API', (resolve,fail) => {
    //     const api = this.api('/').get().then(e => {
    //       if (e.body.components && e.body.components.schemas) {
    //         $().schemas(e.body.components.schemas);
    //       }
    //       // console.warn(e.body);
    //       resolve(e.body);
    //     })
    //   });
    // },



    Get_Aliconnector_Key(){
      copyText = document.body.createElement('INPUT', { value: $.deviceUID });
      copyText.select();
      document.execCommand("Copy");
      document.body.removeChild(copyText);
      alert('Plak (Ctrl+V) de code in het veld "User device UID" van uw aliconnector app');
    },
    addrules(){
      if (this.web && this.web.css && this.web.css.rules){
        for (let [name, value] of Object.entries(this.web.css.rules)){
          new $.css(name, value);
        }
      }
    },
    createLoginFrame(params){
      params = Object.assign(params, {
        response_type: 'code',
        // redirect_uri: document.location.href,
        prompt: 'accept',
        scope: 'name email',
      });
      // params = new URLSearchParams({
      // 	client_id: client_id || $.config.$.client_id,
      // 	response_type: 'code',
      // 	// redirect_uri: document.location.href,
      // 	scope: 'name email',
      // 	state: '12345',
      // 	prompt: 'login',
      // });
      let url = 'https://login.aliconnect.nl?' + new URLSearchParams(params).toString();
      console.debug('LOGIN', url);
      // let login_window = window.open(url, 'login', 'top=0,left=0,width=300,height=300');
      // let loginElement = document.body.createElement('iframe', {src: url, style: 'position:fixed;margin:auto;width:100%;height:100%;top:50px;right:50px;bottom:50px;left:50px;'});
      let loginElement = document.body.createElement('DIV', { style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.5);' }, [
        ['IFRAME', { src: url, style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;width:100%;height:100%;max-width:500px;max-height:500px;border:none;' }]
      ]);
      window.addEventListener('message', e => {
        loginElement.remove();
        $.auth.getLogin();
        // if (callback) callback($.auth.id);
      }, false);
      return;
      // const params = new URLSearchParams({
      // 	client_id: client_id || $.config.$.client_id,
      // 	response_type: 'code',
      // 	redirect_uri: document.location.href,
      // 	scope: 'name email',
      // 	state: '12345',
      // 	prompt: 'login',
      // });
      // document.location.href = 'https://login.aliconnect.nl?' + params.toString();
    },
    mail(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=mail', params, res).send();
    },
    pdf(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=pdf', params, res).send();
    },
    publish(){
      console.debug("PUBLISH");
      new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
        console.debug("API", this.responseText );
        return;
        var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
        var onlineUrl = 'https://' + $.config.$.domain + '.aliconnect.nl';
        console.debug(swaggerUrl, onlineUrl);
        if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
        //else console.debug(swaggerUrl);
        if (confirm("Show online")) window.open(onlineUrl, "om");
        return;
        console.debug(onlineUrl, this.responseText);
        document.location.href = document.location.pathname;
      }).send();
      return;
      var def = {
        paths: {
          item: {
            get: {
              parameters: [
                {name: "id", in: "path", description: "", required: true, schema: { type: "integer", format:"int64"}},
                {name: "child", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "tree", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "master", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "src", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "user", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "refby", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "link", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "select", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "search", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "sync", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "order", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "filter", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "three", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "top", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Accept", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Accept", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Odata-Version", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "aud", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "sub", in: "header", description: "", schema: { type: "integer", format:"int64"}},
              ],
              responses: {
                405: { description: "Invalid input", content: { } }
              },
            },
          }
        }
      };
      var api = JSON.parse(aimapi);
      api.paths = api.paths || {};
      for (var SchemaName in api.components.schemas){
        var schemaName = SchemaName, schema = api.components.schemas[SchemaName];
        (api.tags = api.tags || []).push({name:SchemaName});
        schema.security = schema.security || {
          get: [{ default_auth: ['read:web'] }],
          post: [{ default_auth: ['read:web'] }],
          patch: [{ default_auth: ['read:web'] }],
          delete: [{ default_auth: ['read:web'] }],
        };
        api.paths['/' + schemaName] = api.paths['/' + schemaName] || {
          get: {
            //"tableName": schema.tableName, "idname": schema.idname, "searchNames": schema.searchNames,
            tags: [schemaName],
            Summary: "Get list of " + SchemaName,
            operationId: "item('" + SchemaName + "').find",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.get,
          },
          post: {
            tableName: schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Add a new " + SchemaName,
            operationId: "item('" + SchemaName + "').add",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            requestBody: {
              description: SchemaName + " object that needs to be added to the store",
              content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } }
            },
            security: schema.security.post,
          },
        };
        api.paths['/' + schemaName + "(id)"] = api.paths['/' + schemaName + "(id)"] || {
          get: {
            // tableName: schema.tableName,
            // idname: schema.idname,
            tags: [schemaName],
            Summary: "Find " + SchemaName + " by ID",
            description: "Returns a single " + SchemaName,
            operationId: "item('" + SchemaName + "').get",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: {
              200: { description: "successful operation", content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } } },
              400: { description: "Invalid ID supplied", content: {} },
              404: { description: SchemaName + " not found", content: {} }
            },
            security: schema.security.get,
          },
          post: {
            // tableName: schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Updates a " + SchemaName + " with form data",
            operationId: "item('" + SchemaName + "').post",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            requestBody: {
              content: {
                "application/x-IsPublic-form-urlencoded": {
                  schema: {
                    properties: {
                      name: { type: "string", description: "Updated name of the " + SchemaName },
                      status: { type: "string", description: "Updated status of the " + SchemaName }
                    }
                  }
                }
              }
            },
            security: schema.security.post,
          },
          patch: {
            // tableName: schema.tableName,
            // idname: schema.idname,
            tags: [schemaName],
            Summary: "Updates a " + SchemaName,
            operationId: "item('" + SchemaName + "').patch",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.patch,
          },
          delete: {
            // "tableName": schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Deletes a " + SchemaName,
            operationId: "item('" + SchemaName + "').delete",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.delete,
          }
        }
        //"security, usertasks".split(", ").forEach(function(key){delete(schema[key]);});
        // var properties = {};
        // for (var propertyName in schema.properties){
        // 	var property = properties[propertyName] = {};
        // 	for (var key in ref.properties){
        // 		if (schema.properties[propertyName][key]) property[key] = schema.properties[propertyName][key];
        // 	}
        // }
        //api.components.schemas[SchemaName] = {properties: properties};
      }
      console.debug(api.paths);
      aimapi = JSON.stringify(api, null, 2);
      var js = $.operations ? JSON.stringify($.operations, function(key, value){ return typeof value == "function" ? value.toString() : value }, 4).replace(/\\r\\n/g, '\r\n').replace(/\\t/g, '    ').replace(/"function /g, 'function ').replace(/}"/g, '}') : "";
      //return;
      //console.debug("FN", "$.extend({operations: {\n" + fn.join(", \n") + "\n}});" );
      new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
        console.debug("API", this.responseText );
        new $.HttpRequest($.config.$, 'POST', '/?js', `$.operations = ${js};`, e => {
          console.debug("JS", this.responseText );
          var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
          var onlineUrl = 'https://'+$.config.$.domain+'.aliconnect.nl';
          console.debug(swaggerUrl, onlineUrl);
          if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
          //else console.debug(swaggerUrl);
          window.open(onlineUrl, "om");
          return;
          console.debug(onlineUrl, this.responseText);
          document.location.href = document.location.pathname;
        });
      }).send();
    },
    qrcode(selector){
      if (typeof QRCode === 'undefined'){
        return Object.assign(document.head.createElement('script'), {
          src: 'https://aliconnect.nl/api/js/lib/qrcode.js',
          onload: arguments.callee.bind(this, ...arguments),
        });
      }
      new QRCode(selector, {
        // text: $.config.$.websocket.socket_id,
        text: $.config.$.websocket.socket_id ? 'https://login.aliconnect.nl?s=' + $.config.$.websocket.socket_id : '',
        width: 160,
        height: 160
      });
    },
    randompassword(){
      a = [];
      for (var i = 0; i < 20; i++){
        // a.push(String.fromCharCode(48 + Math.round(74 * Math.random())));
        a.push(String.fromCharCode(33 + Math.round((126-33) * Math.random())));
      }
      return a.join('');
    },
    setUserstate(userstate){
      clearTimeout(this.stateTimeout);
      const config = this.config;
      if (this.access && this.access.sub){
        if (userstate === 'available'){
          this.stateTimeout = setTimeout(() => $.setUserstate('inactive'), 5 * $.config.minMs);
        } else if (userstate === 'inactive'){
          this.stateTimeout = setTimeout(() => $.setUserstate('appear_away'), 5 * $.config.minMs);
        }
        if (this.userstate !== userstate){
          $.send({
            // to: { aud: $.auth.access.aud, sub: $.auth.access.sub },
            sub: this.access.sub,
            userstate: this.userstate = userstate,
          });
        }
      }
    },
    setState(activestate){
      //// console.debug('setactivestate', activestate);
      //var data = { activestate: activestate, accountID: $.client.account.id, userID: $.Account.sub, to: [$.key] };
      //fieldset($.Account.sub, 'state', activestate, true);
      //fieldset($.client.account.id, 'state', activestate, true);
      // Check if current logged in user is still logged in
      if (activestate == 'focus'){
        //if ('auth' in $) $.auth.check_state();
        // src='https://login.aliconnect.nl/api/v1/oauth/token/index.php';
        // src='https://login.aliconnect.nl/$-connect/$-api/v1/oauth/token/index.php';
        // new $.Client({
        // 	src: src, onload: function(e){
        // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
        // 		if (this.status != 200) $.auth.login();
        // 		//// console.debug('api', this.data);
        // 	}
        // });
        // src=$.authurl + 'token/';
        // new $.Client({
        // 	src: src, onload: function(e){
        // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
        // 		if (this.status != 200) $.auth.login();
        // 		//// console.debug('api', this.data);
        // 	}
        // });
        return;
        ws.send({
          //broadcast: true,
          //to: { host: $.Account.aud },
          value: [{ id: $.Account.sub, values: { state: activestate } }, { id: $.client.account.id, values: { state: activestate } }]
        });
      }
      //return;
      //ws.send(data);
      //ws.send({ a: 'set', id: $.client.account.id, name: 'online', value: false });
      //ws.send({ a: 'blur' });
      //clearTimeout(msg.to);
      //new $.Client({
      //    api: 'window/blur/' + aliconnect.deviceUID,
      //    //post: { exec: 'onblur', deviceUID: aliconnect.deviceUID, },
      //    onload: function(){
      //        //// console.debug('onblur done', this.post);
      //    }
      //});
    },
    sms(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=sms', params, res).send();
    },
    then(callback){
      this.callback = callback;
    },
    ws_send_code(socket_id, code){
      $.WebsocketClient.request({
        to: {
          sid: socket_id,
        },
        body: {
          // id_token: $.auth.id_token,
          code: code,
        },
      });
      window.close();
    },
  };
  Object.assign(aimauth.Client, {
    initWithMiddleware() {
      // const options = Object.assign()
      return new this(Object.assign({}, ...arguments));
    },
  })

  module.exports = aimauth;

})()
