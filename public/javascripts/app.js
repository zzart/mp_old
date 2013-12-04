(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
var Application, Layout, StructureController, mediator, routes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StructureController = require('controllers/structure-controller');

Layout = require('views/layout');

mediator = require('mediator');

routes = require('routes');

module.exports = Application = (function(_super) {

  __extends(Application, _super);

  function Application() {
    return Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.title = 'Mobilny Pośrednik';

  Application.prototype.initialize = function() {
    Application.__super__.initialize.apply(this, arguments);
    this.initControllers();
    return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
  };

  Application.prototype.initLayout = function() {
    return this.layout = new Layout({
      title: this.title
    });
  };

  Application.prototype.initControllers = function() {
    return new StructureController();
  };

  Application.prototype.initMediator = function() {
    mediator.models = {};
    mediator.collections = {};
    mediator.schemas = {};
    mediator.app = 'mp';
    mediator.app_key = 'test1';
    return mediator.seal();
  };

  return Application;

})(Chaplin.Application);

});

;require.register("controllers/add-offer-controller", function(exports, require, module) {
var AddOfferController, AddOfferView, Controller, Offer, Schema, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/base/controller');

AddOfferView = require('views/add-offer-view');

Offer = require('models/offer-model');

Schema = require('models/schema-model');

mediator = require('mediator');

module.exports = AddOfferController = (function(_super) {

  __extends(AddOfferController, _super);

  function AddOfferController() {
    return AddOfferController.__super__.constructor.apply(this, arguments);
  }

  AddOfferController.prototype.show = function(params) {
    var _this = this;
    console.log('con: GET params ');
    console.log(params);
    this.view_conf = {
      content: 'add_offer_structure',
      footer: 'add_offer_footer',
      nr_pages: 3
    };
    mediator.t_conf = this.view_conf;
    mediator.publish('view:init');
    this.model = new Offer;
    this.schema_model = new Schema;
    return this.schema_model.fetch({
      data: params,
      success: function() {
        console.log('con: data fetched!!');
        _this.schema_model.schema = _this.schema_model.attributes;
        _this.form = new Backbone.Form({
          model: _this.schema_model
        });
        _this.form.render();
        return _this.view = new AddOfferView({
          model: _this.model,
          form: _this.form
        });
      }
    });
  };

  return AddOfferController;

})(Controller);

});

;require.register("controllers/auth-controller", function(exports, require, module) {
var AuthController, StructureController, gen_token, mediator, _sync,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  _this = this;

StructureController = require('controllers/structure-controller');

mediator = require('mediator');

module.exports = AuthController = (function(_super) {

  __extends(AuthController, _super);

  function AuthController() {
    return AuthController.__super__.constructor.apply(this, arguments);
  }

  AuthController.prototype.beforeAction = function(params, route) {
    var _ref;
    AuthController.__super__.beforeAction.apply(this, arguments);
    this.publishEvent('log:info', 'AuthController#beforeAction()');
    this.publishEvent('log:info', window.location.pathname);
    this.publishEvent('log:info', (_ref = mediator.models.user) != null ? _ref.toJSON() : void 0);
    if (_.isEmpty(mediator.models.user)) {
      mediator.redirectUrl = window.location.pathname;
      return this.redirectTo({
        url: 'login'
      });
    }
  };

  return AuthController;

})(StructureController);

gen_token = function(model, url, password) {
  var apphash, apphash_hexed, auth_header, header_string, userhash, userhash_hexed;
  console.log('url: ', url);
  apphash = CryptoJS.HmacSHA256(url, mediator.app_key);
  apphash_hexed = apphash.toString(CryptoJS.enc.Hex);
  userhash = CryptoJS.HmacSHA256(url, mediator.models.user.get('user_pass'));
  userhash_hexed = userhash.toString(CryptoJS.enc.Hex);
  header_string = "" + mediator.app + "," + apphash_hexed + "," + (mediator.models.user.get('username')) + "," + userhash_hexed;
  return auth_header = btoa(header_string);
};

_sync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  var hash, params, url, _ref;
  console.log('mediator: ', Chaplin.mediator);
  console.log('model: ', model);
  console.log('method: ', method);
  console.log('options: ', options);
  console.log('options data: ', options.data);
  console.log('is new?:', typeof model.isNew === "function" ? model.isNew() : void 0);
  if ((_ref = Chaplin.mediator.models.user) != null ? _ref.get('is_logged') : void 0) {
    if (model.urlRoot) {
      if (model.isNew()) {
        url = model.urlRoot;
      } else {
        url = "" + model.urlRoot + "/" + model.id;
      }
    } else {
      url = model.url;
    }
    if (!_.isEmpty(options.data)) {
      params = $.param(options.data);
      url = "" + url + "?" + params;
    }
    console.log(url);
    hash = gen_token(model, url, Chaplin.mediator.models.user.get('user_pass'));
    options.beforeSend = function(xhr) {
      return xhr.setRequestHeader('X-Auth-Token', hash);
    };
    console.log(method, options, model);
  }
  return _sync.call(this, method, model, options);
};

});

;require.register("controllers/base/controller", function(exports, require, module) {
var Controller,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Controller = (function(_super) {

  __extends(Controller, _super);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  return Controller;

})(Chaplin.Controller);

});

;require.register("controllers/client-add-controller", function(exports, require, module) {
var ClientAddController, ClientAddView, Controller, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ClientAddView = require('views/client-add-view');

Model = require('models/client-model');

mediator = require('mediator');

module.exports = ClientAddController = (function(_super) {

  __extends(ClientAddController, _super);

  function ClientAddController() {
    return ClientAddController.__super__.constructor.apply(this, arguments);
  }

  ClientAddController.prototype.show = function(params, route, options) {
    var schema;
    this.publishEvent('log:info', 'in clientadd controller');
    this.publishEvent('log:debug', params);
    this.publishEvent('log:debug', route);
    this.publishEvent('log:debug', options);
    mediator.models.client = new Model;
    schema = mediator.models.user.get('schemas').client;
    mediator.models.client.schema = schema;
    return this.view = new ClientAddView({
      params: params,
      region: 'content'
    });
  };

  return ClientAddController;

})(Controller);

});

;require.register("controllers/client-controller", function(exports, require, module) {
var ClientAddView, ClientEditView, ClientListController, ClientListView, Collection, Controller, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ClientListView = require('views/client-list-view');

ClientAddView = require('views/client-add-view');

ClientEditView = require('views/client-edit-view');

Collection = require('models/client-collection');

Model = require('models/client-model');

mediator = require('mediator');

module.exports = ClientListController = (function(_super) {

  __extends(ClientListController, _super);

  function ClientListController() {
    return ClientListController.__super__.constructor.apply(this, arguments);
  }

  ClientListController.prototype.list = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in client list controller');
    if (_.isObject(mediator.collections.clients)) {
      return this.view = new ClientListView({
        params: params,
        region: 'content'
      });
    } else {
      mediator.collections.clients = new Collection;
      console.log(mediator.collections.clients);
      return mediator.collections.clients.fetch({
        data: params,
        beforeSend: function() {
          _this.publishEvent('loading_start');
          return _this.publishEvent('tell_user', 'Ładuje listę klentów ...');
        },
        success: function() {
          _this.publishEvent('log:info', "data with " + params + " fetched ok");
          _this.publishEvent('loading_stop');
          return _this.view = new ClientListView({
            params: params,
            region: 'content'
          });
        },
        error: function() {
          _this.publishEvent('loading_stop');
          return _this.publishEvent('server_error');
        }
      });
    }
  };

  ClientListController.prototype.add = function(params, route, options) {
    var schema;
    this.publishEvent('log:info', 'in clientadd controller');
    mediator.models.client = new Model;
    schema = mediator.models.user.get('schemas').client;
    mediator.models.client.schema = schema;
    return this.view = new ClientAddView({
      params: params,
      region: 'content'
    });
  };

  ClientListController.prototype.show = function(params, route, options) {
    this.publishEvent('log:info', 'in client show controller');
    if (!_.isObject(mediator.collections.clients.get(params.id))) {
      this.redirectTo({
        '/klienci': '/klienci'
      });
    }
    return this.view = new ClientEditView({
      params: params,
      region: 'content'
    });
  };

  return ClientListController;

})(Controller);

});

;require.register("controllers/header-controller", function(exports, require, module) {
var Controller, HeaderController, HeaderView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/base/controller');

HeaderView = require('views/header-view');

module.exports = HeaderController = (function(_super) {

  __extends(HeaderController, _super);

  function HeaderController() {
    return HeaderController.__super__.constructor.apply(this, arguments);
  }

  HeaderController.prototype.initialize = function() {
    HeaderController.__super__.initialize.apply(this, arguments);
    return this.view = new HeaderView();
  };

  return HeaderController;

})(Controller);

});

;require.register("controllers/home-controller", function(exports, require, module) {
var Controller, HomeController, HomePageView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

HomePageView = require('views/home-page-view');

module.exports = HomeController = (function(_super) {

  __extends(HomeController, _super);

  function HomeController() {
    return HomeController.__super__.constructor.apply(this, arguments);
  }

  HomeController.prototype.show = function() {
    this.publishEvent('log:info', 'controller:home');
    return this.view = new HomePageView({
      region: 'content'
    });
  };

  return HomeController;

})(Controller);

});

;require.register("controllers/login-controller", function(exports, require, module) {
var LoginController, LoginView, Model, StructureController, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StructureController = require('controllers/structure-controller');

LoginView = require('views/autologin-view');

Model = require('models/login-model');

mediator = require('mediator');

module.exports = LoginController = (function(_super) {

  __extends(LoginController, _super);

  function LoginController() {
    return LoginController.__super__.constructor.apply(this, arguments);
  }

  LoginController.prototype.show = function() {
    this.publishEvent('log:info', 'login controller');
    mediator.models.user = new Model;
    return this.view = new LoginView({
      region: 'login'
    });
  };

  return LoginController;

})(StructureController);

});

;require.register("controllers/offer-list-controller", function(exports, require, module) {
var Collection, Controller, OfferListController, OfferListView, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/structure-controller');

OfferListView = require('views/offer-list-view');

Collection = require('models/offer-list-collection');

mediator = require('mediator');

module.exports = OfferListController = (function(_super) {

  __extends(OfferListController, _super);

  function OfferListController() {
    return OfferListController.__super__.constructor.apply(this, arguments);
  }

  OfferListController.prototype.show = function(params, route, options) {
    var _this = this;
    this.collection = new Collection;
    return this.collection.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje oferty...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new OfferListView({
          collection: _this.collection,
          params: params,
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  return OfferListController;

})(Controller);

});

;require.register("controllers/structure-controller", function(exports, require, module) {
var ConfirmView, Controller, Footer, Header, InfoView, LeftPanelView, StructureController, StructureView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/base/controller');

StructureView = require('views/structure-view');

Footer = require('views/footer-view');

Header = require('views/header-view');

LeftPanelView = require('views/left-panel-view');

InfoView = require('views/info-view');

ConfirmView = require('views/confirm-view');

module.exports = StructureController = (function(_super) {

  __extends(StructureController, _super);

  function StructureController() {
    return StructureController.__super__.constructor.apply(this, arguments);
  }

  StructureController.prototype.beforeAction = function() {
    this.publishEvent('log:info', 'StructureController.beforeAction()');
    this.compose('structure', StructureView);
    this.compose('header', Header, {
      region: 'header'
    });
    this.compose('footer', Footer, {
      region: 'footer'
    });
    this.compose('panel-left', LeftPanelView);
    this.compose('info', InfoView, {
      region: 'info'
    });
    this.compose('confirm', ConfirmView, {
      region: 'confirm'
    });
    this.publishEvent('structureController:render');
    return this.publishEvent('log:info', 'structureController done ----------');
  };

  return StructureController;

})(Controller);

});

;require.register("initialize", function(exports, require, module) {
var Application, routes;

Application = require('application');

routes = require('routes');

$(function() {
  return new Application({
    controllerSuffix: '-controller',
    routes: routes
  });
});

});

;require.register("lib/support", function(exports, require, module) {
var Chaplin, support, utils;

Chaplin = require('chaplin');

utils = require('lib/utils');

support = utils.beget(Chaplin.support);

module.exports = support;

});

;require.register("lib/utils", function(exports, require, module) {
var Chaplin, utils;

Chaplin = require('chaplin');

utils = Chaplin.utils.beget(Chaplin.utils);

module.exports = utils;

});

;require.register("lib/view-helper", function(exports, require, module) {
var mediator;

mediator = require('mediator');

});

;require.register("mediator", function(exports, require, module) {
var mediator;

mediator = module.exports = Chaplin.mediator;

});

;require.register("models/base/collection", function(exports, require, module) {
var Chaplin, Collection, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

Model = require('models/base/model');

module.exports = Collection = (function(_super) {

  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.model = Model;

  return Collection;

})(Chaplin.Collection);

});

;require.register("models/base/model", function(exports, require, module) {
var Chaplin, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

module.exports = Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Chaplin.Model);

});

;require.register("models/client-collection", function(exports, require, module) {
var ClientList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/client-model');

module.exports = ClientList = (function(_super) {

  __extends(ClientList, _super);

  function ClientList() {
    return ClientList.__super__.constructor.apply(this, arguments);
  }

  ClientList.prototype.model = Model;

  ClientList.prototype.url = 'http://localhost:8080/v1/klienci';

  return ClientList;

})(Chaplin.Collection);

});

;require.register("models/client-model", function(exports, require, module) {
var Client, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Client = (function(_super) {

  __extends(Client, _super);

  function Client() {
    return Client.__super__.constructor.apply(this, arguments);
  }

  Client.prototype.urlRoot = 'http://localhost:8080/v1/klienci';

  Client.prototype.schema = {};

  Client.prototype.defaults = {
    is_private: ''
  };

  return Client;

})(Chaplin.Model);

});

;require.register("models/login-model", function(exports, require, module) {
var Login,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Login = (function(_super) {

  __extends(Login, _super);

  function Login() {
    return Login.__super__.constructor.apply(this, arguments);
  }

  Login.prototype.url = 'http://localhost:8080/v1/login';

  return Login;

})(Chaplin.Model);

});

;require.register("models/offer-list-collection", function(exports, require, module) {
var Model, OfferList,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/offer-list-model');

module.exports = OfferList = (function(_super) {

  __extends(OfferList, _super);

  function OfferList() {
    return OfferList.__super__.constructor.apply(this, arguments);
  }

  OfferList.prototype.model = Model;

  OfferList.prototype.url = 'http://localhost:8080/mp/oferty';

  return OfferList;

})(Chaplin.Collection);

});

;require.register("models/offer-list-model", function(exports, require, module) {
var OfferList,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = OfferList = (function(_super) {

  __extends(OfferList, _super);

  function OfferList() {
    return OfferList.__super__.constructor.apply(this, arguments);
  }

  return OfferList;

})(Chaplin.Model);

});

;require.register("models/offer-model", function(exports, require, module) {
var Chaplin, Offer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

module.exports = Offer = (function(_super) {

  __extends(Offer, _super);

  function Offer() {
    return Offer.__super__.constructor.apply(this, arguments);
  }

  return Offer;

})(Chaplin.Model);

});

;require.register("routes", function(exports, require, module) {

module.exports = function(match) {
  match('', 'home#show');
  match('klienci/dodaj', 'client#add');
  match('klienci', 'client#list');
  match('klienci/:id', 'client#show');
  return match('login', 'login#show');
};

});

;require.register("views/add-offer-view", function(exports, require, module) {
var OfferListView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

module.exports = OfferListView = (function(_super) {

  __extends(OfferListView, _super);

  function OfferListView() {
    return OfferListView.__super__.constructor.apply(this, arguments);
  }

  OfferListView.prototype.autoRender = true;

  OfferListView.prototype.container = "[data-role='content']";

  OfferListView.prototype.containerMethod = 'html';

  OfferListView.prototype.initialize = function(options) {
    return OfferListView.__super__.initialize.apply(this, arguments);
  };

  OfferListView.prototype.getTemplateFunction = function() {
    var template,
      _this = this;
    template = function() {
      return _this.options.form.el;
    };
    return this.template = template;
  };

  OfferListView.prototype.render = function() {
    console.log(this.el);
    OfferListView.__super__.render.apply(this, arguments);
    console.log('view: offerlist afterRender()');
    return this.publishEvent('addofferview:render');
  };

  return OfferListView;

})(View);

});

;require.register("views/autologin-view", function(exports, require, module) {
var LoginView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/login');

mediator = require('mediator');

module.exports = LoginView = (function(_super) {

  __extends(LoginView, _super);

  function LoginView() {
    this.attach = __bind(this.attach, this);

    this.login = __bind(this.login, this);

    this.initialize = __bind(this.initialize, this);
    return LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.autoRender = true;

  LoginView.prototype.template = template;

  LoginView.prototype.id = 'login';

  LoginView.prototype.attributes = {
    'data-role': 'popup',
    'data-overlay-theme': 'b',
    'data-theme': 'b',
    'data-dismissible': 'false',
    'style': 'max-width:400px;'
  };

  LoginView.prototype.initialize = function(options) {
    LoginView.__super__.initialize.apply(this, arguments);
    this.model = mediator.models.user;
    this.template = template;
    this.delegate('click', '#login-verification', this.login);
    return this.on('addedToDOM', this.login);
  };

  LoginView.prototype.login = function() {
    var apphash, apphash_hexed, auth_header, header_string, userhash, userhash_hexed,
      _this = this;
    this.publishEvent('log:error', 'autologin------');
    this.user = 'zzart';
    this.pass = 'maddog';
    apphash = CryptoJS.HmacSHA256(this.model.url, mediator.app_key);
    apphash_hexed = apphash.toString(CryptoJS.enc.Hex);
    userhash = CryptoJS.HmacSHA256(this.model.url, this.pass);
    userhash_hexed = userhash.toString(CryptoJS.enc.Hex);
    header_string = "" + mediator.app + "," + apphash_hexed + "," + this.user + "," + userhash_hexed;
    auth_header = btoa(header_string);
    return this.model.fetch({
      headers: {
        'X-Auth-Token': auth_header
      },
      success: function() {
        _this.publishEvent('log:info', 'login SUCCESS');
        _this.model.set({
          is_logged: true
        });
        _this.model.set({
          user_pass: _this.pass
        });
        $('#first-name-placeholder').text(_this.model.get('first_name'));
        return Chaplin.helpers.redirectTo({
          url: ''
        });
      },
      error: function() {
        return _this.publishEvent('log:info', 'login FAILED');
      }
    });
  };

  LoginView.prototype.attach = function() {
    LoginView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: login afterRender()');
  };

  return LoginView;

})(View);

});

;require.register("views/base/collection-view", function(exports, require, module) {
var Chaplin, CollectionView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

View = require('views/base/view');

module.exports = CollectionView = (function(_super) {

  __extends(CollectionView, _super);

  function CollectionView() {
    return CollectionView.__super__.constructor.apply(this, arguments);
  }

  CollectionView.prototype.getTemplateFunction = View.prototype.getTemplateFunction;

  return CollectionView;

})(Chaplin.CollectionView);

});

;require.register("views/base/view", function(exports, require, module) {
var View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/view-helper');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.getTemplateFunction = function() {
    return this.template;
  };

  return View;

})(Chaplin.View);

});

;require.register("views/client-add-view", function(exports, require, module) {
var ClientAddView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/client_add_form');

mediator = require('mediator');

module.exports = ClientAddView = (function(_super) {

  __extends(ClientAddView, _super);

  function ClientAddView() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.refresh_form = __bind(this.refresh_form, this);

    this.save_form = __bind(this.save_form, this);

    this.initialize = __bind(this.initialize, this);
    return ClientAddView.__super__.constructor.apply(this, arguments);
  }

  ClientAddView.prototype.autoRender = true;

  ClientAddView.prototype.containerMethod = "html";

  ClientAddView.prototype.attributes = {
    'data-role': 'content'
  };

  ClientAddView.prototype.id = 'content';

  ClientAddView.prototype.className = 'ui-content';

  ClientAddView.prototype.initialize = function(options) {
    ClientAddView.__super__.initialize.apply(this, arguments);
    this.params = options.params;
    this.model = mediator.models.client;
    this.template_form = template;
    this.delegate('click', 'a#client-add-refresh', this.refresh_form);
    this.delegate('click', 'a#client-add-save', this.save_form);
    this.form = new Backbone.Form({
      model: this.model,
      template: this.template_form,
      templateData: {
        heading: 'Dodaj kontrahenta'
      }
    });
    return this.form.render();
  };

  ClientAddView.prototype.save_form = function() {
    var _this = this;
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          if (mediator.collections.clients != null) {
            mediator.collections.clients.add(_this.model);
          }
          _this.publishEvent('tell_user', 'Klient dodany');
          return Chaplin.helpers.redirectTo({
            url: '/klienci'
          });
        },
        error: function(model, response, options) {
          if (response.responseJSON != null) {
            return Chaplin.EventBroker.publishEvent('tell_user', response.responseJSON['title']);
          } else {
            return Chaplin.EventBroker.publishEvent('tell_user', 'Brak kontaktu z serwerem');
          }
        }
      });
    } else {
      return this.publishEvent('tell_user', 'Błąd w formularzu!');
    }
  };

  ClientAddView.prototype.refresh_form = function() {
    return Chaplin.helpers.redirectTo({
      url: '/klienci/dodaj'
    });
  };

  ClientAddView.prototype.render = function() {
    ClientAddView.__super__.render.apply(this, arguments);
    return this.$el.append(this.form.el);
  };

  ClientAddView.prototype.attach = function() {
    ClientAddView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: clientadd afterRender()');
    return this.publishEvent('clientaddview:render');
  };

  return ClientAddView;

})(View);

});

;require.register("views/client-edit-view", function(exports, require, module) {
var ClientEditView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/client_edit_form');

mediator = require('mediator');

module.exports = ClientEditView = (function(_super) {

  __extends(ClientEditView, _super);

  function ClientEditView() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.delete_client = __bind(this.delete_client, this);

    this.save_form = __bind(this.save_form, this);

    this.initialize = __bind(this.initialize, this);
    return ClientEditView.__super__.constructor.apply(this, arguments);
  }

  ClientEditView.prototype.autoRender = true;

  ClientEditView.prototype.containerMethod = "html";

  ClientEditView.prototype.attributes = {
    'data-role': 'content'
  };

  ClientEditView.prototype.id = 'content';

  ClientEditView.prototype.className = 'ui-content';

  ClientEditView.prototype.initialize = function(options) {
    ClientEditView.__super__.initialize.apply(this, arguments);
    this.params = options.params;
    this.publishEvent('log:info', console.log(this.params));
    this.model = mediator.collections.clients.get(this.params.id);
    this.model.schema = mediator.models.user.get('schemas').client;
    this.template_form = template;
    this.delegate('click', 'a#client-edit-delete', this.delete_client);
    this.delegate('click', 'a#client-edit-update', this.save_form);
    this.form = new Backbone.Form({
      model: this.model,
      template: this.template_form,
      templateData: {
        heading: 'Dodaj kontrahenta'
      }
    });
    return this.form.render();
  };

  ClientEditView.prototype.save_form = function() {
    var _this = this;
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          _this.publishEvent('tell_user', 'Klient zaktualizowany');
          return Chaplin.helpers.redirectTo({
            url: '/klienci'
          });
        },
        error: function(model, response, options) {
          if (response.responseJSON != null) {
            return Chaplin.EventBroker.publishEvent('tell_user', response.responseJSON['title']);
          } else {
            return Chaplin.EventBroker.publishEvent('tell_user', 'Brak kontaktu z serwerem');
          }
        }
      });
    } else {
      return this.publishEvent('tell_user', 'Błąd w formularzu!');
    }
  };

  ClientEditView.prototype.delete_client = function() {
    var _this = this;
    return this.model.destroy({
      success: function(event) {
        mediator.collections.clients.remove(_this.model);
        _this.publishEvent('tell_user', 'Klient został usunięty');
        return Chaplin.helpers.redirectTo({
          url: '/klienci'
        });
      },
      error: function(model, response, options) {
        if (response.responseJSON != null) {
          return Chaplin.EventBroker.publishEvent('tell_user', response.responseJSON['title']);
        } else {
          return Chaplin.EventBroker.publishEvent('tell_user', 'Brak kontaktu z serwerem');
        }
      }
    });
  };

  ClientEditView.prototype.render = function() {
    ClientEditView.__super__.render.apply(this, arguments);
    this.publishEvent('log:info', '5');
    this.$el.append(this.form.el);
    return this.publishEvent('log:info', '22');
  };

  ClientEditView.prototype.attach = function() {
    ClientEditView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', '6');
    this.publishEvent('log:info', 'view: clientadd afterRender()');
    return this.publishEvent('clientaddview:render');
  };

  return ClientEditView;

})(View);

});

;require.register("views/client-list-view", function(exports, require, module) {
var ClientListView, View, list_view, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

list_view = require('views/templates/client_list_view');

mediator = require('mediator');

module.exports = ClientListView = (function(_super) {

  __extends(ClientListView, _super);

  function ClientListView() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.refresh_offers = __bind(this.refresh_offers, this);

    this.change_query = __bind(this.change_query, this);

    this.action = __bind(this.action, this);

    this.select_all = __bind(this.select_all, this);
    return ClientListView.__super__.constructor.apply(this, arguments);
  }

  ClientListView.prototype.autoRender = true;

  ClientListView.prototype.containerMethod = "html";

  ClientListView.prototype.attributes = {
    'data-role': 'content'
  };

  ClientListView.prototype.id = 'content';

  ClientListView.prototype.className = 'ui-content';

  ClientListView.prototype.initialize = function(options) {
    ClientListView.__super__.initialize.apply(this, arguments);
    this.collection = _.clone(mediator.collections.clients);
    this.params = options.params;
    this.template = list_view;
    this.last_check_view = 'list_view';
    this.last_check_query = 'user';
    this.delegate('change', '#select-action', this.action);
    this.delegate('change', '#select-filter', this.change_query);
    this.delegate('change', '#all', this.select_all);
    this.delegate('click', '#refresh', this.refresh_offers);
    return window.collection = this.collection;
  };

  ClientListView.prototype.select_all = function() {
    var selected;
    selected = $('#client-table>thead input:checkbox ').prop('checked');
    return $('#client-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh");
  };

  ClientListView.prototype.action = function(event) {
    var clean_after_action, selected,
      _this = this;
    selected = $('#client-table>tbody input:checked ');
    clean_after_action = function(selected) {
      $('#client-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh");
      $("#select-action :selected").removeAttr('selected');
      selected = null;
      _this.render();
    };
    this.publishEvent('log:info', "performing action " + event.target.value + " for offers " + selected);
    if (selected.length > 0) {
      if (event.target.value === 'usun') {
        $("#confirm").popup('open');
        return $("#confirmed").click(function() {
          var i, model, _i, _len,
            _this = this;
          for (_i = 0, _len = selected.length; _i < _len; _i++) {
            i = selected[_i];
            model = mediator.collections.clients.get($(i).attr('id'));
            model.destroy({
              success: function(event) {
                Chaplin.EventBroker.publishEvent('log:info', "klient usunięty id" + (model.get('id')));
                mediator.collections.clients.remove(model);
                return Chaplin.EventBroker.publishEvent('tell_user', 'Klient został usunięty');
              },
              error: function(model, response, options) {
                if (response.responseJSON != null) {
                  return Chaplin.EventBroker.publishEvent('tell_user', response.responseJSON['title']);
                } else {
                  return Chaplin.EventBroker.publishEvent('tell_user', 'Brak kontaktu z serwerem');
                }
              }
            });
          }
          $(this).off('click');
          return clean_after_action(selected);
        });
      }
    } else {
      this.publishEvent('tell_user', 'Musisz zaznaczyć przynajmniej jeden element ;)');
      return clean_after_action(selected);
    }
  };

  ClientListView.prototype.change_query = function(event) {
    var list_of_models;
    this.publishEvent('log:debug', event.target.value);
    if (_.isEmpty(event.target.value)) {
      this.collection = _.clone(mediator.collections.clients);
    } else {
      list_of_models = mediator.collections.clients.where({
        'client_type': parseInt(event.target.value)
      });
      this.collection.reset(list_of_models);
    }
    return this.render();
  };

  ClientListView.prototype.refresh_offers = function(event) {
    var _this = this;
    event.preventDefault();
    this.publishEvent('log:debug', 'refresh');
    return mediator.collections.clients.fetch({
      success: function() {
        _this.publishEvent('tell_user', 'Odświeżam listę kontaktów');
        _this.collection = _.clone(mediator.collections.clients);
        return _this.render();
      },
      error: function(model, response, options) {
        if (response.responseJSON != null) {
          return Chaplin.EventBroker.publishEvent('tell_user', response.responseJSON['title']);
        } else {
          return Chaplin.EventBroker.publishEvent('tell_user', 'Brak kontaktu z serwerem');
        }
      }
    });
  };

  ClientListView.prototype.getTemplateData = function() {
    return {
      client: this.collection.toJSON()
    };
  };

  ClientListView.prototype.render = function() {
    return ClientListView.__super__.render.apply(this, arguments);
  };

  ClientListView.prototype.attach = function() {
    ClientListView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: offerlist afterRender()');
    if (this.collection.length > 1) {
      $("#client-table").tablesorter({
        sortList: [[4, 0]],
        headers: {
          0: {
            'sorter': false
          },
          1: {
            'sorter': false
          }
        }
      });
    }
    return this.publishEvent('clientlistview:render');
  };

  return ClientListView;

})(View);

});

;require.register("views/confirm-view", function(exports, require, module) {
var ConfirmView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/confirm');

View = require('views/base/view');

module.exports = ConfirmView = (function(_super) {

  __extends(ConfirmView, _super);

  function ConfirmView() {
    this.attach = __bind(this.attach, this);
    return ConfirmView.__super__.constructor.apply(this, arguments);
  }

  ConfirmView.prototype.template = template;

  ConfirmView.prototype.containerMethod = 'html';

  ConfirmView.prototype.id = 'confirm';

  ConfirmView.prototype.attributes = {
    'data-role': 'popup',
    'data-dismissible': 'false',
    'data-theme': 'b'
  };

  ConfirmView.prototype.attach = function() {
    ConfirmView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:confirm', 'HeaderView:attach()');
  };

  return ConfirmView;

})(View);

});

;require.register("views/footer-view", function(exports, require, module) {
var FooterView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/footer_base');

View = require('views/base/view');

module.exports = FooterView = (function(_super) {

  __extends(FooterView, _super);

  function FooterView() {
    this.attach = __bind(this.attach, this);
    return FooterView.__super__.constructor.apply(this, arguments);
  }

  FooterView.prototype.template = template;

  FooterView.prototype.containerMethod = 'html';

  FooterView.prototype.id = 'footer';

  FooterView.prototype.attributes = {
    'data-role': 'footer',
    'data-position': 'fixed'
  };

  FooterView.prototype.attach = function() {
    FooterView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'FooterView:attach()');
  };

  return FooterView;

})(View);

});

;require.register("views/header-view", function(exports, require, module) {
var HeaderView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/header_base');

View = require('views/base/view');

module.exports = HeaderView = (function(_super) {

  __extends(HeaderView, _super);

  function HeaderView() {
    this.attach = __bind(this.attach, this);
    return HeaderView.__super__.constructor.apply(this, arguments);
  }

  HeaderView.prototype.template = template;

  HeaderView.prototype.containerMethod = 'html';

  HeaderView.prototype.id = 'header';

  HeaderView.prototype.attributes = {
    'data-role': 'header'
  };

  HeaderView.prototype.attach = function() {
    HeaderView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HeaderView:attach()');
  };

  return HeaderView;

})(View);

});

;require.register("views/home-page-view", function(exports, require, module) {
var HomePageView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/home');

View = require('views/base/view');

mediator = require('mediator');

module.exports = HomePageView = (function(_super) {

  __extends(HomePageView, _super);

  function HomePageView() {
    this.attach = __bind(this.attach, this);

    this.getTemplateData = __bind(this.getTemplateData, this);
    return HomePageView.__super__.constructor.apply(this, arguments);
  }

  HomePageView.prototype.autoRender = true;

  HomePageView.prototype.containerMethod = "html";

  HomePageView.prototype.attributes = {
    'data-role': 'content'
  };

  HomePageView.prototype.id = 'content';

  HomePageView.prototype.template = template;

  HomePageView.prototype.className = 'ui-content';

  HomePageView.prototype.getTemplateData = function() {
    return {
      title: 'na homepage!'
    };
  };

  HomePageView.prototype.attach = function() {
    HomePageView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HomeView: attach()');
  };

  return HomePageView;

})(View);

});

;require.register("views/info-view", function(exports, require, module) {
var InfoView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/info');

View = require('views/base/view');

module.exports = InfoView = (function(_super) {

  __extends(InfoView, _super);

  function InfoView() {
    this.attach = __bind(this.attach, this);
    return InfoView.__super__.constructor.apply(this, arguments);
  }

  InfoView.prototype.template = template;

  InfoView.prototype.containerMethod = 'html';

  InfoView.prototype.id = 'info';

  InfoView.prototype.attributes = {
    'data-role': 'popup',
    'data-theme': 'b',
    'data-position-to': 'window'
  };

  InfoView.prototype.className = 'ui-content';

  InfoView.prototype.attach = function() {
    InfoView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HeaderView:attach()');
  };

  return InfoView;

})(View);

});

;require.register("views/layout", function(exports, require, module) {
var Layout, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Layout = (function(_super) {

  __extends(Layout, _super);

  function Layout() {
    this.jqm_recreate = __bind(this.jqm_recreate, this);

    this.jqm_refersh = __bind(this.jqm_refersh, this);

    this.jqm_leftpanel = __bind(this.jqm_leftpanel, this);

    this.jqm_init = __bind(this.jqm_init, this);

    this.log_error = __bind(this.log_error, this);

    this.log_warn = __bind(this.log_warn, this);

    this.log_info = __bind(this.log_info, this);

    this.log_debug = __bind(this.log_debug, this);

    this.server_error = __bind(this.server_error, this);

    this.tell_user = __bind(this.tell_user, this);

    this.jqm_loading_stop = __bind(this.jqm_loading_stop, this);

    this.jqm_loading_start = __bind(this.jqm_loading_start, this);
    return Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.initialize = function() {
    var jqm;
    Layout.__super__.initialize.apply(this, arguments);
    this.log = log4javascript.getDefaultLogger();
    this.log.info('layout init');
    jqm = true;
    if (jqm) {
      this.subscribeEvent('structureController:render', this.jqm_init);
      this.subscribeEvent('leftpanel:render', this.jqm_leftpanel);
      this.subscribeEvent('offerlistview:render', this.jqm_refersh);
      this.subscribeEvent('clientlistview:render', this.jqm_refersh);
      this.subscribeEvent('clientaddview:render', this.jqm_refersh);
      this.subscribeEvent('loading_start', this.jqm_loading_start);
      this.subscribeEvent('loading_stop', this.jqm_loading_stop);
      this.subscribeEvent('server_error', this.server_error);
      this.subscribeEvent('tell_user', this.tell_user);
    }
    this.subscribeEvent('log:debug', this.log_debug);
    this.subscribeEvent('log:info', this.log_info);
    this.subscribeEvent('log:warn', this.log_warn);
    return this.subscribeEvent('log:error', this.log_error);
  };

  Layout.prototype.jqm_loading_start = function() {
    return $.mobile.loading('show');
  };

  Layout.prototype.jqm_loading_stop = function() {
    return $.mobile.loading('hide');
  };

  Layout.prototype.tell_user = function(information) {
    $('#info').text(information);
    setTimeout(function() {
      return $('#info').popup('open', {
        positionTo: "#info-btn",
        transition: "fade"
      });
    }, 100);
    return setTimeout(function() {
      return $("#info").popup("close");
    }, 3000);
  };

  Layout.prototype.server_error = function() {
    this.log.debug('server error');
    $('#info').text('Ups, brak kontaktu z serwerem...');
    setTimeout(function() {
      return $('#info').popup('open', {
        positionTo: "#info-btn",
        transition: "fade"
      });
    }, 100);
    return setTimeout(function() {
      return $("#info").popup("close");
    }, 3000);
  };

  Layout.prototype.log_debug = function(option) {
    return this.log.debug(option);
  };

  Layout.prototype.log_info = function(option) {
    return this.log.info(option);
  };

  Layout.prototype.log_warn = function(option) {
    return this.log.warn(option);
  };

  Layout.prototype.log_error = function(option) {
    return this.log.error(option);
  };

  Layout.prototype.jqm_init = function() {
    this.log.info('layout: event jqm_init caugth');
    return $(function() {
      $.mobile.initializePage();
      $.mobile.loading('hide');
      $("#left-panel").panel();
      $("body > [data-role='panel'] [data-role='listview']").listview();
      $("body > [data-role='panel'] [data-role='collapsible']").collapsible();
      return $("#info").popup({
        history: false
      });
    });
  };

  Layout.prototype.jqm_leftpanel = function() {
    return this.log.info('layout: event jqm_menurender caugth');
  };

  Layout.prototype.jqm_refersh = function() {
    this.log.info('layout: event jqm_refresh caugth');
    return $("#content").enhanceWithin();
  };

  Layout.prototype.jqm_recreate = function() {};

  return Layout;

})(Chaplin.Layout);

});

;require.register("views/left-panel-view", function(exports, require, module) {
var LeftPanelView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/left-panel');

module.exports = LeftPanelView = (function(_super) {

  __extends(LeftPanelView, _super);

  function LeftPanelView() {
    this.attach = __bind(this.attach, this);
    return LeftPanelView.__super__.constructor.apply(this, arguments);
  }

  LeftPanelView.prototype.attributes = {
    'data-role': 'panel',
    'data-position': 'left',
    'data-display': 'push',
    'data-theme': 'a'
  };

  LeftPanelView.prototype.id = 'left-panel';

  LeftPanelView.prototype.containerMethod = 'append';

  LeftPanelView.prototype.container = 'body';

  LeftPanelView.prototype.template = template;

  LeftPanelView.prototype.attach = function() {
    LeftPanelView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'LeftPanelView: attach()');
  };

  return LeftPanelView;

})(View);

});

;require.register("views/login-view", function(exports, require, module) {
var LoginView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/login');

mediator = require('mediator');

module.exports = LoginView = (function(_super) {

  __extends(LoginView, _super);

  function LoginView() {
    this.attach = __bind(this.attach, this);

    this.login = __bind(this.login, this);

    this.open_dialog = __bind(this.open_dialog, this);

    this.initialize = __bind(this.initialize, this);
    return LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.autoRender = true;

  LoginView.prototype.template = template;

  LoginView.prototype.id = 'login';

  LoginView.prototype.attributes = {
    'data-role': 'popup',
    'data-overlay-theme': 'b',
    'data-theme': 'b',
    'data-dismissible': 'false',
    'style': 'max-width:400px;'
  };

  LoginView.prototype.initialize = function(options) {
    LoginView.__super__.initialize.apply(this, arguments);
    this.model = mediator.models.user;
    this.template = template;
    this.delegate('click', '#login-verification', this.login);
    return this.on('addedToDOM', this.open_dialog);
  };

  LoginView.prototype.open_dialog = function() {
    this.publishEvent('log:info', 'opening login popup');
    return $(function() {
      $('#login').popup('open');
      return $("input#user").focus();
    });
  };

  LoginView.prototype.login = function(event) {
    var apphash, apphash_hexed, auth_header, header_string, userhash, userhash_hexed,
      _this = this;
    event.preventDefault();
    this.publishEvent('log:info', 'login attempt');
    this.user = $('input#user').val();
    this.pass = $('input#pass').val();
    apphash = CryptoJS.HmacSHA256(this.model.url, mediator.app_key);
    apphash_hexed = apphash.toString(CryptoJS.enc.Hex);
    userhash = CryptoJS.HmacSHA256(this.model.url, this.pass);
    userhash_hexed = userhash.toString(CryptoJS.enc.Hex);
    header_string = "" + mediator.app + "," + apphash_hexed + "," + this.user + "," + userhash_hexed;
    auth_header = btoa(header_string);
    return this.model.fetch({
      headers: {
        'X-Auth-Token': auth_header
      },
      success: function() {
        _this.publishEvent('log:info', 'login SUCCESS');
        _this.model.set({
          is_logged: true
        });
        _this.model.set({
          user_pass: _this.pass
        });
        $('#first-name-placeholder').text(_this.model.get('first_name'));
        $('#login').popup('close');
        return Chaplin.helpers.redirectTo({
          url: ''
        });
      },
      error: function(model, response, options) {
        if (response.responseJSON != null) {
          $('.login-error').text(response.responseJSON['title']);
        } else {
          $('.login-error').text('Brak kontaktu z serwerem');
        }
        return _this.publishEvent('log:info', 'login FAILED');
      }
    });
  };

  LoginView.prototype.attach = function() {
    LoginView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: login afterRender()');
  };

  return LoginView;

})(View);

});

;require.register("views/offer-list-view", function(exports, require, module) {
var OfferListView, View, list_view,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

list_view = require('views/templates/list_view');

module.exports = OfferListView = (function(_super) {

  __extends(OfferListView, _super);

  function OfferListView() {
    this.attach = __bind(this.attach, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.refresh_offers = __bind(this.refresh_offers, this);

    this.change_query = __bind(this.change_query, this);

    this.action = __bind(this.action, this);

    this.select_all = __bind(this.select_all, this);
    return OfferListView.__super__.constructor.apply(this, arguments);
  }

  OfferListView.prototype.autoRender = true;

  OfferListView.prototype.container = "[data-role='content']";

  OfferListView.prototype.containerMethod = 'html';

  OfferListView.prototype.initialize = function(options) {
    OfferListView.__super__.initialize.apply(this, arguments);
    this.params = options.params;
    this.template = list_view;
    this.last_check_view = 'list_view';
    this.last_check_query = 'user';
    this.delegate('change', '#select-action', this.action);
    this.delegate('change', '#select-filter', this.change_query);
    this.delegate('change', '#all', this.select_all);
    return this.delegate('click', '#refresh', this.refresh_offers);
  };

  OfferListView.prototype.select_all = function() {
    var selected;
    selected = $('#table-list>thead input:checkbox ').prop('checked');
    return $('#table-list>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh");
  };

  OfferListView.prototype.action = function(event) {
    var selected;
    selected = $('#table-list>tbody input:checked ');
    this.publishEvent('log:info', "performing action " + event.target.value + " for offers " + selected);
    return $('#table-list>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh");
  };

  OfferListView.prototype.change_query = function(event) {
    var _this = this;
    this.publishEvent('log:debug', event);
    this.params['filter'] = event.target.value;
    return this.collection.fetch({
      data: this.params,
      success: function() {
        _this.publishEvent('log:debug', _this.params);
        _this.publishEvent('loading_stop');
        _this.render();
        _this.last_check_query = event.target.id;
        return _this.refresh_radios();
      },
      beforeSend: function() {
        return _this.publishEvent('loading_start');
      }
    });
  };

  OfferListView.prototype.refresh_offers = function(event) {
    var _this = this;
    event.preventDefault();
    this.publishEvent('log:debug', this.params);
    return this.collection.fetch({
      data: this.params,
      success: function() {
        _this.publishEvent('loading_stop');
        _this.render();
        return _this.last_check_query = event.target.id;
      },
      beforeSend: function() {
        return _this.publishEvent('loading_start');
      }
    });
  };

  OfferListView.prototype.getTemplateData = function() {
    return {
      oferta: this.collection.toJSON()
    };
  };

  OfferListView.prototype.attach = function() {
    OfferListView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: offerlist afterRender()');
    $("#table-list").tablesorter({
      sortList: [[11, 0]],
      headers: {
        0: {
          'sorter': false
        },
        1: {
          'sorter': false
        }
      }
    });
    return this.publishEvent('offerlistview:render');
  };

  return OfferListView;

})(View);

});

;require.register("views/structure-view", function(exports, require, module) {
var FooterView, StructureView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/base_structure');

mediator = require('mediator');

FooterView = require('views/footer-view');

module.exports = StructureView = (function(_super) {

  __extends(StructureView, _super);

  function StructureView() {
    this.attach = __bind(this.attach, this);
    return StructureView.__super__.constructor.apply(this, arguments);
  }

  StructureView.prototype.container = "body";

  StructureView.prototype.containerMethod = 'html';

  StructureView.prototype.id = 'page';

  StructureView.prototype.attributes = {
    'data-role': 'page'
  };

  StructureView.prototype.template = template;

  StructureView.prototype.regions = {
    'page': '#page-region',
    'content': '#content-region',
    'footer': '#footer-region',
    'header': '#header-region',
    'info': '#info-region',
    'login': '#login-region',
    'confirm': '#confirm-region'
  };

  StructureView.prototype.attach = function() {
    StructureView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'structureView: attach()');
  };

  return StructureView;

})(View);

});

;require.register("views/templates/add_offer", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<h1>dodaj oferte</h1>\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/add_offer_footer", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('  <div data-role="navbar" data-iconpos="left">\n            <ul>\n        <li><a href="#" class="ui-btn-active" data-role="button" data-icon="grid">Dane oferty</a></li>\n        <li><a href="#oferta_zdjecia" data-role="button" data-icon="edit" >Zdjęcia oferty</a></li>\n        <li><a href="#oferta_notatki" data-role="button" data-icon="edit" >Ustawienia oferty</a></li>\n        <li><a href="#oferta_ustawienia" data-role="button" data-icon="edit">Informacje wewnętrzne</a></li>\n            </ul>\n          </div><!-- /navbar -->\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/base_structure", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('        <!-- this is REGIONS ONLY -->\n        <div id=\'header-region\'>\n        </div><!-- header -->\n\n        <div id=\'content-region\'>\n        </div><!-- content -->\n\n        <div id=\'footer-region\'>\n        </div><!-- footer -->\n\n\n        <div id="info-region">\n        </div><!-- info-region -->\n        <div id="login-region">\n        </div><!-- info-region -->\n\n        <div id="confirm-region">\n        </div><!-- info-region -->\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/client_add_form", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('  <div class=\'ui-grid-a\'>\n  <div class=\'ui-block-a\'>\n  <form>\n  <h4>Dodaj kontrahenta</h4>\n  <div data-fields="name"> </div>\n  <div data-fields="surname"> </div>\n  <div data-fields="email"> </div>\n  <div data-fields="phone"> </div>\n  <div data-fields="client_type"> </div>\n  <div data-fields="address"> </div>\n  <div data-fields="pesel"> </div>\n  <div data-fields="id_card"> </div>\n  <div data-fields="bank_account"> </div>\n  <h4>Informacje o firmie</h4>\n  <div data-fields="company_name"> </div>\n  <div data-fields="nip"> </div>\n</div>\n  <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n  <h4>Szczegóły</h4>\n  <div data-fields="notes"> </div>\n  <div data-fields="requirements"> </div>\n  <div data-fields="budget"> </div>\n  <div data-fields="provision"> </div>\n  <div data-fields="provision_p"> </div>\n  <h4>Dodatkowe</h4>\n  <div data-fields="is_private"> </div>\n  <div data-fields="date"> </div>\n  <a href=\'/klienci/dodaj\' class="ui-btn ui-btn-inline ui-icon-recycle ui-btn-icon-right">Wyczyść</a>\n  <a id="client-add-save" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Zapisz</a>\n  </form>\n</div>\n\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/client_edit_form", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('  <div class=\'ui-grid-a\'>\n  <div class=\'ui-block-a\'>\n  <form>\n  <h4>Dodaj kontrahenta</h4>\n  <div data-fields="name"> </div>\n  <div data-fields="surname"> </div>\n  <div data-fields="email"> </div>\n  <div data-fields="phone"> </div>\n  <div data-fields="client_type"> </div>\n  <div data-fields="address"> </div>\n  <div data-fields="pesel"> </div>\n  <div data-fields="id_card"> </div>\n  <div data-fields="bank_account"> </div>\n  <h4>Informacje o firmie</h4>\n  <div data-fields="company_name"> </div>\n  <div data-fields="nip"> </div>\n</div>\n  <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n  <h4>Szczegóły</h4>\n  <div data-fields="notes"> </div>\n  <div data-fields="requirements"> </div>\n  <div data-fields="budget"> </div>\n  <div data-fields="provision"> </div>\n  <div data-fields="provision_p"> </div>\n  <h4>Dodatkowe</h4>\n  <div data-fields="is_private"> </div>\n  <div data-fields="date"> </div>\n  <a id="client-edit-update" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Uaktualnij</a>\n  <a id="client-edit-delete" class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-right">Skasuj</a>\n  </form>\n\n</div>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/client_list_view", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      var item, _i, _len, _ref;
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal">\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n                <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                    <option value="drukuj" disabled>Drukuj</option>\n                    <option value="eksport" disabled>Eksport do pliku</option>\n                </select>\n                <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n                <select name="select-filter" id="select-filter">\n                    <option selected disabled>Filtr</option>\n                    <option value="">Wszyscy</option>\n                    <option value="1">Kupujący</option>\n                    <option value="2">Sprzedający</option>\n                    <option value="3">Najemca</option>\n                    <option value="4">Wynajmujący</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="client-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny">\n     <thead>\n       <tr>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Firma&nbsp;&nbsp;</th>\n         <th data-priority="6">Adres&nbsp;&nbsp;</th>\n         <th data-priority="6">Budżet&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.client;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td> <label> <input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true"  type="checkbox"> </label> </td>\n         <td>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent']));
        __out.push('</td>\n         <td><a href=\'/klienci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['name']));
        __out.push('</a></td>\n         <td><a href=\'/klienci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['surname']));
        __out.push('</a></td>\n         <td>');
        __out.push(__sanitize(item['email']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['phone']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['company_name']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['address']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['budget']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/confirm", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('    <div data-role="header" data-theme="a">\n    <h1>Potwierdz usuwanie</h1>\n    </div>\n    <div role="main" class="ui-content">\n        <h3 class="ui-title">Napewno chcesz usunąć te elementy?</h3>\n    <p>Ta akcja jest nieodwracalna.</p>\n        <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Powrót</a>\n        <a href="#" id=\'confirmed\' class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Potwierdz</a>\n    </div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/footer_base", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<h4>Projekt i wykonanie <a href=\'pixey.pl\'>Pixey.pl</a> &copy;</h4>\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/footer_empty", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/header_base", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('    <a href=\'#left-panel\' data-icon=\'grid\' data-theme="b">Menu</a>\n    <h1>Mobilny Pośrednik</h1>\n    <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">\n        <a href="#info" data-rel="popup" data-transition="pop" data-iconpos="notext" id=\'info-btn\' data-position-to="origin" class="ui-btn ui-btn-b ui-btn-inline ui-icon-info ui-btn-icon-notext">Icon only</a>\n        <a href="#" id=\'first-name-placeholder\' class="ui-btn ui-btn-b ui-btn-icon-right ui-icon-user"></a>\n    </div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/home", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<h1>Witamy ');
    
      __out.push(__sanitize(this.title));
    
      __out.push(' </h1>\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/info", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<p>Hi im info popup</p>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/left-panel", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<!-- ##################################  PANEL -->\n\n\t\t\t\t\t<ul data-role="listview" >\n\t\t\t\t\t\t<li data-icon="delete" > <a href="#header" data-rel="close">Zamknij menu</a> </li>\n\t\t\t\t\t\t<li data-icon="home" > <a href="/" >Początek</a> </li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h4>Przeglądaj oferty</h4>\n                    <ul data-role="listview" >\n                        <li><a href="/oferty/robocze" >Robocze<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/archiwalne" >Archiwalne<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/mieszkania/wynajem" >Mieszkania Wynajem<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/mieszkania/sprzedaz" >Mieszkania Sprzedaż<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/domy/wynajem" >Domy Wynajem</a></li>\n                        <li><a href="/oferty/domy/sprzedaz" >Domy Sprzedaż</a></li>\n                        <li><a href="/oferty/grunty/wynajem" >Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty/grunty/sprzedaz" >Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty/lokale/wynajem" >Lokale Wynajem</a></li>\n                        <li><a href="/oferty/lokale/sprzedaz" >Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty/lokale?/" >Lokale użytkowe Wynajem</a></li>\n                        <li><a href="/oferty/lokale?/" >Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="/oferty/obiekty/wynajem" >Obiekty Wynajem</a></li>\n                        <li><a href="/oferty/obiekty/sprzedaz" >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n                <div data-role="collapsible" data-inset="false"  data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h4>Dodaj ofertę</h4>\n                    <ul data-role="listview">\n                        <li><a href="dodaj_oferte?sch=1"    >Mieszkania Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=2"    >Mieszkania Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=3"    >Domy Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=4"    >Domy Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=5"    >Grunty Dzierżawa</a></li>\n                        <li><a href="dodaj_oferte?sch=6"    >Grunty Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=7"    >Lokale Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=8"    >Lokale Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=9"    >Lokale użytkowe Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=10"   >Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=11"   >Obiekty Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=12"   >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h3>Etykiety</h3>\n                    <ul data-role="listview" >\n                        <li data-icon="tag"><a href="" >Oferty robocze</a></li>\n                    </ul>\n                </div>\n\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h3>Ustawienia</h3>\n                    <ul data-role="listview" >\n                        <li data-icon="plus"><a href="" >Dodaj Etykietę</a></li>\n                        <li data-icon="alert"><a href="" >Zmień Hasło</a></li>\n                        <li data-icon="user"><a href="" >Dane Profilu</a></li>\n                        <li data-icon="star"><a href="" >Dane Biura Nieruchomości</a></li>\n                        <li data-icon="heart"><a href="" >Logo</a></li>\n                        <li data-icon="camera"><a href="" >Watermark</a></li>\n                        <li data-icon="back"><a href="" >Importy</a></li>\n                        <li data-icon="forward"><a href="" >Eksporty</a></li>\n                        <li><a href="" >Portale zewnętrzne</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h3>Wyszukiwania</h3>\n                    <ul data-role="listview">\n                        <li><a href="" >Wyszukiwanie Zaawansowane</a></li>\n                        <li data-role=\'list-divider\' >Portale Zewnętrzne </li>\n                        <li><a href="" >Gumtree</a></li>\n                        <li><a href="" >aleGratka</a></li>\n                        <li><a href="" >Tablica</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h3>Kontrahenci</h3>\n                    <ul data-role="listview" >\n                        <li data-icon="edit"><a href="/klienci/dodaj" >Dodaj Kontrahenta</a></li>\n                        <li data-icon="phone"><a href="/klienci" >Moi</a></li>\n                        <li data-icon="lock"><a href="/klienci/wspolni" >Wspólni</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                    <h3>Narzędzia</h3>\n                    <ul data-role="listview" >\n                        <li><a href="http://ekw.ms.gov.pl/pdcbdkw/pdcbdkw.html" target="_blank" >Księgi wieczyste</a></li>\n                        <li><a href="http://maps.geoportal.gov.pl/webclient/" target="_blank" >Geoportal</a></li>\n                        <li><a href="http://mapy.geoportal.gov.pl/imap/?gpmap=gp0&actions=acShowWgPlot" target="_blank" >Wyszukaj działkę</a></li>\n                        <li><a href="/kw" >Księgi wieczyste</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n\n<!-- ##################################  PANEL -->\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/list_view", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      var item, _i, _len, _ref;
    
      __out.push('<div class="ui-grid-b">\n\t<div class="ui-block-a">\n <form>\n    <fieldset data-role="controlgroup" data-type="horizontal">\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option value="">Akcja</option>\n            <option value="1">Drukuj</option>\n            <option value="2">Kopiuj</option>\n            <option value="3">Do roboczych</option>\n            <option value="4">Do archiwalnych</option>\n            <option value="5">Usuń</option>\n            <option value="6">Eksport do pliku</option>\n            <option value="7">Wyślij klientowi</option>\n        </select>\n        <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="select-filter" id="select-filter">\n            <option value="">Filtr</option>\n            <option value="user">Moje</option>\n            <option value="bon">Agencji</option>\n            <option>Etykiety ----</option>\n            <option value="">Zielona</option>\n        </select>\n    </fieldset>\n</form>\n\t</div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\n\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="table-list" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny">\n     <thead>\n       <tr>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th data-priority="6">Zdjęcie&nbsp;&nbsp;</th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Klient&nbsp;&nbsp;</th>\n         <th data-priority="2">Transakcja&nbsp;&nbsp;</th>\n         <th data-priority="2"><abbr title="Powierzchnia w m2">Pow.m2&nbsp;&nbsp;</abbr></th>\n         <th data-priority="3">Pokoje&nbsp;&nbsp;</th>\n         <th data-priority="3"><abbr title="Województwo">Woj.&nbsp;&nbsp;</abbr></th>\n         <th data-priority="4">Miejsce&nbsp;&nbsp;</th>\n         <th data-priority="5">Ulica&nbsp;&nbsp;</th>\n         <th data-priority="6">Cena&nbsp;&nbsp;</th>\n         <th data-priority="6"><abbr title="Ostatnia aktualizacja">Aktual.&nbsp;&nbsp;</abbr></th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.oferta;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td> <label> <input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true"  type="checkbox"> </label> </td>\n         <td><img src="images/test.jpg" /></td>\n         <td>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent_nazwisko']));
        __out.push('</td>\n         <td></td>\n         <td>');
        __out.push(__sanitize(item['typ_transakcji']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['powierzchnia_calkowita']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['liczba_pokoi']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['adres_otrzymany_wojewodztwo']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['adres_otrzymany_miasto']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['adres_otrzymany_ulica']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['cena']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['data_aktualizacji']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/login", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('    <div data-role="header" data-theme="a">\n    <h1>Logowianie</h1>\n    </div>\n    <div role="main" class="ui-content">\n    <p class=\'login-error\'></p>\n    <form>\n            <input name="user" id="user" placeholder="Użytkownik" value="" type="text">\n            <input name="pass" id="pass" placeholder="Hasło" value="" type="password">\n            <button id="login-verification" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" >Zaloguj</button>\n    </div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/offerlist", function(exports, require, module) {
module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      var i, item, _i, _len;
    
      __out.push('<div class="ui-grid-b">\n\t<div class="ui-block-a">\n\n                <div data-role="fieldcontain">\n                    <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">\n                            <input type="radio" name="radio-choice1" id="list_view_a" value="on" checked="checked" />\n                            <label for="list_view_a">Lista</label>\n                            <input type="radio" name="radio-choice1" id="list_view_b" value="off" />\n                            <label for="list_view_b">Siatka</label>\n                            <input type="radio" name="radio-choice1" id="list_view_c" value="other" />\n                            <label for="list_view_c">Galeria</label>\n                    </fieldset>\n                </div>\n\n\n\t</div>\n\t<div class="ui-block-b">\n\n                <div data-role="fieldcontain">\n                    <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">\n                            <label for="user">Moje</label>\n                            <input type="radio" name="radio-choice2" id="user" value="user" checked="checked" />\n                            <label for="agency">Agencji</label>\n                            <input type="radio" name="radio-choice2" id="agency" value="agency" />\n                            <label for="all">Wszystke</label>\n                            <input type="radio" name="radio-choice2" id="all" value="other" />\n                    </fieldset>\n                </div>\n\n\t</div>\n\t<div class="ui-block-c">\n\n        <div data-role="fieldcontain">\n\t\t\t\t<label for="select-choice-a" class="select">Oddział:</label>\n\t\t\t\t<select name="select-choice-a" id="select-choice-a" >\n\t\t\t\t\t<option>Oddział:</option>\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t</select>\n        </div>\n\n\n\t</div>\n</div><!-- /grid-b -->\n\n         <ul data-role="listview" data-filter="true" data-filter-placeholder="Szukaj ofert ..." >\n      ');
    
      for (i = _i = 0, _len = this.length; _i < _len; i = ++_i) {
        item = this[i];
        __out.push('\n\t\t\t<li><a href="#');
        __out.push(__sanitize(item.oferta['id']));
        __out.push('">\n\t\t\t\t<img src="images/test.jpg" />\n        <h3>');
        __out.push(__sanitize(item.oferta['id']));
        __out.push(' <strong>');
        __out.push(__sanitize(item.oferta['typ']['kategoria']));
        __out.push('</strong> / ');
        __out.push(__sanitize(item.oferta['typ']['typ_transakcji']));
        __out.push('</h3>\n        <p>');
        __out.push(__sanitize(item.oferta['adres']['wojewodztwo']));
        __out.push(' ');
        __out.push(__sanitize(item.oferta['adres']['miasto']));
        __out.push(' ');
        __out.push(__sanitize(item.oferta['adres']['ulica']));
        __out.push('</p>\n        <p class="ui-li-aside"><strong>');
        __out.push(__sanitize(item.oferta['atrybuty']['cena']));
        __out.push('</strong></p>\n\t\t\t<span class="ui-li-count">');
        __out.push(__sanitize(item.oferta['atrybuty']['data_aktualizacji']));
        __out.push('</span>\n\t\t\t</a>\n\t\t\t</li>\n      ');
      }
    
      __out.push('\n\t\t</ul>\n\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;
//# sourceMappingURL=app.js.map