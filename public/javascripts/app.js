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
var Application, Layout, RefreshController, StructureController, mediator, routes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StructureController = require('controllers/structure-controller');

RefreshController = require('controllers/refresh-controller');

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
    new StructureController();
    return new RefreshController();
  };

  Application.prototype.initMediator = function() {
    var _this = this;
    mediator.models = {};
    mediator.collections = {};
    mediator.schemas = {};
    mediator.last_query = {};
    mediator.upload_url = 'http://localhost:8080/v1/dodaj-plik';
    mediator.app_key = 'mp';
    mediator.app = '4ba2b78a-5675-42d9-8aab-f65ecf3ce9ba';
    mediator.can_edit = function(is_admin, author_id, user_id) {
      if (is_admin) {
        return true;
      }
      if (author_id === user_id) {
        return true;
      }
      return false;
    };
    mediator.gen_token = function(url) {
      var apphash, apphash_hexed, auth_header, header_string, userhash, userhash_hexed;
      apphash = CryptoJS.HmacSHA256(url, mediator.app_key);
      apphash_hexed = apphash.toString(CryptoJS.enc.Hex);
      userhash = CryptoJS.HmacSHA256(url, mediator.models.user.get('user_pass'));
      userhash_hexed = userhash.toString(CryptoJS.enc.Hex);
      header_string = "" + mediator.app + "," + apphash_hexed + "," + (mediator.models.user.get('username')) + "@" + (mediator.models.user.get('company_name')) + "," + userhash_hexed;
      return auth_header = btoa(header_string);
    };
    return mediator.seal();
  };

  return Application;

})(Chaplin.Application);

});

;require.register("controllers/agent-controller", function(exports, require, module) {
var AgentController, Collection, Controller, EditView, ListView, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/agent-list-view');

EditView = require('views/agent-view');

Collection = require('models/agent-collection');

Model = require('models/agent-model');

mediator = require('mediator');

module.exports = AgentController = (function(_super) {

  __extends(AgentController, _super);

  function AgentController() {
    return AgentController.__super__.constructor.apply(this, arguments);
  }

  AgentController.prototype.list = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in agent list controller');
    mediator.collections.agents = new Collection;
    return mediator.collections.agents.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę agentów ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.agents,
          template: 'agent_list_view',
          filter: 'agent_type',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  AgentController.prototype.add = function(params, route, options) {
    var _this = this;
    return mediator.models.user.fetch({
      success: function() {
        _this.publishEvent('log:info', 'in agentadd controller');
        mediator.models.agent = new Model;
        _this.model = mediator.models.agent;
        return _this.model.fetch({
          beforeSend: function() {
            _this.publishEvent('loading_start');
            return _this.publishEvent('tell_user', 'Odświeżam formularz ...');
          },
          success: function() {
            _this.publishEvent('log:info', "data with " + params + " fetched ok");
            _this.publishEvent('loading_stop');
            _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
            mediator.models.user.update_db();
            _this.schema = localStorage.getObject('agent_schema');
            _this.model.schema = _.clone(_this.schema);
            return _this.view = new EditView({
              form_name: 'agent_form',
              model: _this.model,
              can_edit: _this.can_edit,
              edit_type: 'add',
              region: 'content'
            });
          },
          error: function() {
            _this.publishEvent('loading_stop');
            return _this.publishEvent('server_error');
          }
        });
      }
    });
  };

  AgentController.prototype.show = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in agent show controller');
    return mediator.models.user.fetch({
      success: function() {
        var _ref;
        mediator.models.user.update_db();
        if (!_.isObject((_ref = mediator.collections.agents) != null ? typeof _ref.get === "function" ? _ref.get(params.id) : void 0 : void 0)) {
          _this.publishEvent('log:info', 'in agent show IF');
          mediator.collections.agents = new Collection;
          return mediator.collections.agents.fetch({
            data: params,
            beforeSend: function() {
              return _this.publishEvent('loading_start');
            },
            success: function() {
              _this.publishEvent('log:info', "data with " + params + " fetched ok");
              _this.publishEvent('loading_stop');
              if (!_.isObject(mediator.collections.agents.get(params.id))) {
                _this.publishEvent('tell_user', 'Agent nie został znaleziony');
                Chaplin.utils.redirectTo({
                  url: '/agenci'
                });
              }
              _this.publishEvent('log:info', 'in agent show controller fetch');
              _this.model = mediator.collections.agents.get(params.id);
              _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
              _this.edit_type = '';
              if (mediator.models.user.get('id') === _this.model.get('id')) {
                _this.edit_type = 'add';
              }
              _this.schema = localStorage.getObject('agent_schema');
              _this.model.schema = _.clone(_this.schema);
              return _this.view = new EditView({
                form_name: 'agent_form',
                model: _this.model,
                can_edit: _this.can_edit,
                edit_type: _this.edit_type,
                region: 'content'
              });
            },
            error: function() {
              _this.publishEvent('loading_stop');
              return _this.publishEvent('server_error');
            }
          });
        } else {
          _this.publishEvent('log:info', 'in agent show Else');
          _this.model = mediator.collections.agents.get(params.id);
          _this.edit_type = '';
          if (mediator.models.user.get('id') === _this.model.get('id')) {
            _this.edit_type = 'add';
          }
          _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
          _this.schema = localStorage.getObject('agent_schema');
          _this.model.schema = _.clone(_this.schema);
          return _this.view = new EditView({
            form_name: 'agent_form',
            model: _this.model,
            can_edit: _this.can_edit,
            edit_type: _this.edit_type,
            region: 'content'
          });
        }
      }
    });
  };

  return AgentController;

})(Controller);

});

;require.register("controllers/auth-controller", function(exports, require, module) {
var AuthController, StructureController, mediator, _sync,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    $.mobile.loading('show');
    if (_.isEmpty(mediator.models.user)) {
      mediator.redirectUrl = window.location.pathname;
      return this.redirectTo({
        url: 'login'
      });
    }
  };

  return AuthController;

})(StructureController);

_sync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  var hash, params, url, _ref;
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
    hash = Chaplin.mediator.gen_token(url);
    options.beforeSend = function(xhr) {
      return xhr.setRequestHeader('X-Auth-Token', hash);
    };
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

;require.register("controllers/bon-controller", function(exports, require, module) {
var BonController, Controller, Model, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

View = require('views/bon-view');

Model = require('models/bon-model');

mediator = require('mediator');

module.exports = BonController = (function(_super) {

  __extends(BonController, _super);

  function BonController() {
    return BonController.__super__.constructor.apply(this, arguments);
  }

  BonController.prototype.show = function(params, route, options) {
    var _this = this;
    console.log(params, route, options);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
    this.schema = localStorage.getObject('company_schema');
    this.publishEvent('log:info', 'in bon show controller');
    if (_.isObject(mediator.models.bon)) {
      mediator.models.bon.schema = _.clone(this.schema);
      return this.view = new View({
        form_name: 'bon_form',
        model: mediator.models.bon,
        can_edit: this.can_edit,
        region: 'content'
      });
    } else {
      mediator.models.bon = new Model({
        id: params.id
      });
      mediator.models.bon.schema = _.clone(this.schema);
      return mediator.models.bon.fetch({
        beforeSend: function() {
          _this.publishEvent('loading_start');
          return _this.publishEvent('tell_user', 'Ładuje ustawienia biura ...');
        },
        success: function() {
          _this.publishEvent('log:info', "data with " + params + " fetched ok");
          _this.publishEvent('loading_stop');
          return _this.view = new View({
            form_name: 'bon_form',
            model: mediator.models.bon,
            can_edit: _this.can_edit,
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

  return BonController;

})(Controller);

});

;require.register("controllers/branch-controller", function(exports, require, module) {
var BranchController, Collection, Controller, ListView, Model, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/branch-list-view');

View = require('views/branch-view');

Collection = require('models/branch-collection');

Model = require('models/branch-model');

mediator = require('mediator');

module.exports = BranchController = (function(_super) {

  __extends(BranchController, _super);

  function BranchController() {
    return BranchController.__super__.constructor.apply(this, arguments);
  }

  BranchController.prototype.list = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in branch list controller');
    mediator.collections.branches = new Collection;
    return mediator.collections.branches.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę oddziałów ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.branches,
          template: 'branch_list_view',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  BranchController.prototype.add = function(params, route, options) {
    this.publishEvent('log:info', 'in branchadd controller');
    mediator.models.branch = new Model;
    this.model = mediator.models.branch;
    this.schema = localStorage.getObject('branch_schema');
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
    return this.view = new View({
      form_name: 'branch_form',
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  BranchController.prototype.show = function(params, route, options) {
    this.publishEvent('log:info', 'in branch show controller');
    if (!_.isObject(mediator.collections.branches.get(params.id))) {
      this.redirectTo({
        '/oddzialy': '/oddzialy'
      });
    }
    this.model = mediator.collections.branches.get(params.id);
    this.schema = localStorage.getObject('branch_schema');
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), 1, 0);
    return this.view = new View({
      form_name: 'branch_form',
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  return BranchController;

})(Controller);

});

;require.register("controllers/client-controller", function(exports, require, module) {
var ClientListController, ClientView, Collection, Controller, ListView, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/client-list-view');

ClientView = require('views/client-view');

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
    mediator.collections.clients = new Collection;
    return mediator.collections.clients.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę klientów ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.clients,
          template: 'client_list_view',
          filter: 'client_type',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  ClientListController.prototype.add = function(params, route, options) {
    this.publishEvent('log:info', 'in clientadd controller');
    mediator.models.client = new Model;
    this.schema = localStorage.getObject('client_schema');
    this.model = mediator.models.client;
    this.model.schema = _.clone(this.schema);
    return this.view = new ClientView({
      form_name: 'client_form',
      model: this.model,
      can_edit: true,
      edit_type: 'add',
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
    this.schema = localStorage.getObject('client_schema');
    this.model = mediator.collections.clients.get(params.id);
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
    return this.view = new ClientView({
      form_name: 'client_form',
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  return ClientListController;

})(Controller);

});

;require.register("controllers/client-public-controller", function(exports, require, module) {
var ClientPublicController, ClientView, Collection, Controller, ListView, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/client-public-list-view');

Collection = require('models/client-public-collection');

ClientView = require('views/client-public-view');

Model = require('models/client-model');

mediator = require('mediator');

module.exports = ClientPublicController = (function(_super) {

  __extends(ClientPublicController, _super);

  function ClientPublicController() {
    return ClientPublicController.__super__.constructor.apply(this, arguments);
  }

  ClientPublicController.prototype.list = function(params, route, options) {
    var _this = this;
    mediator.collections.clients_public = new Collection;
    return mediator.collections.clients_public.fetch({
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę klientów ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.clients_public,
          template: 'client_public_list_view',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  ClientPublicController.prototype.show = function(params, route, options) {
    this.publishEvent('log:info', 'in client show controller');
    if (!_.isObject(mediator.collections.clients_public.get(params.id))) {
      this.redirectTo({
        '/klienci-wspolni': '/klienci-wspolni'
      });
    }
    this.model = mediator.collections.clients_public.get(params.id);
    this.schema = localStorage.getObject('client_schema');
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
    return this.view = new ClientView({
      form_name: 'client_form',
      model: this.model,
      can_edit: this.can_edit,
      delete_only: true,
      region: 'content'
    });
  };

  return ClientPublicController;

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
var Controller, HomeController, HomePageView, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

HomePageView = require('views/home-page-view');

mediator = require('mediator');

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

;require.register("controllers/iframe-controller", function(exports, require, module) {
var Controller, IFrameController, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

View = require('views/iframe-view');

mediator = require('mediator');

module.exports = IFrameController = (function(_super) {

  __extends(IFrameController, _super);

  function IFrameController() {
    return IFrameController.__super__.constructor.apply(this, arguments);
  }

  IFrameController.prototype.show = function(params) {
    this.publishEvent('log:info', 'controller:home');
    return this.view = new View({
      region: 'content',
      template: params.template
    });
  };

  return IFrameController;

})(Controller);

});

;require.register("controllers/listing-controller", function(exports, require, module) {
var Collection, Controller, ListView, ListingController, Model, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/listing-list-view');

Collection = require('models/listing-collection');

Model = require('models/listing-model');

View = require('views/listing-view');

mediator = require('mediator');

module.exports = ListingController = (function(_super) {

  __extends(ListingController, _super);

  function ListingController() {
    return ListingController.__super__.constructor.apply(this, arguments);
  }

  ListingController.prototype.list = function(params, route, options) {
    var listing_type,
      _this = this;
    this.publishEvent('log:info', "in list property controller" + params + ", " + route + ", " + options);
    mediator.last_query = _.clone(options.query);
    listing_type = options.query.category;
    mediator.collections.listings = new Collection;
    return mediator.collections.listings.fetch({
      data: options.query,
      beforeSend: function() {
        return _this.publishEvent('tell_user', 'Ładuje oferty...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        return _this.view = new ListView({
          collection: mediator.collections.listings,
          template: "" + listing_type + "_list_view",
          filter: 'listing_type',
          region: 'content',
          listing_type: listing_type
        });
      },
      error: function() {
        return _this.publishEvent('server_error');
      }
    });
  };

  ListingController.prototype.add = function(params, route, options) {
    var form, listing_type;
    this.publishEvent('log:info', "in add property controller");
    console.log(params, route, options);
    listing_type = options.query.type;
    form = "" + listing_type + "_form";
    this.schema = localStorage.getObject("" + listing_type + "_schema");
    mediator.models.listing = new Model;
    mediator.models.listing.schema = _.clone(this.schema);
    this.publishEvent('log:info', "init view property controller");
    this.view = new View({
      form_name: form,
      model: mediator.models.listing,
      listing_type: listing_type,
      can_edit: true,
      edit_type: 'add',
      region: 'content'
    });
    return this.publishEvent('log:info', "after init view property controller");
  };

  ListingController.prototype.show = function(params, route, options) {
    var categories, category, form, schema, url;
    this.publishEvent('log:info', 'in listing show controller');
    url = "/oferty?" + ($.param(mediator.last_query));
    if (!_.isObject(mediator.collections.listings.get(params.id))) {
      this.redirectTo({
        url: url
      });
    }
    this.model = mediator.collections.listings.get(params.id);
    categories = _.invert(localStorage.getObject('categories'));
    category = categories[this.model.get('category')];
    form = "" + category + "_form";
    schema = "" + category + "_schema";
    this.schema = localStorage.getObject(schema);
    console.log(categories, this.schema, this.model.get('category'));
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
    return this.view = new View({
      form_name: form,
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  return ListingController;

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

;require.register("controllers/refresh-controller", function(exports, require, module) {
var Controller, Model, RefreshController, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

Model = require('models/refresh-model');

mediator = require('mediator');

module.exports = RefreshController = (function(_super) {

  __extends(RefreshController, _super);

  function RefreshController() {
    this.refresh_dependencies = __bind(this.refresh_dependencies, this);
    return RefreshController.__super__.constructor.apply(this, arguments);
  }

  RefreshController.prototype.initialize = function() {
    this.subscribeEvent('refreshmodel', this.refresh_model);
    this.subscribeEvent('modelchanged', this.refresh_dependencies);
    return window.refresh = this.refresh_model;
  };

  RefreshController.prototype.refresh_model = function(model, callback) {
    var data, params,
      _this = this;
    this.callback = callback;
    data = model.split('/');
    params = {};
    params['model'] = data[0];
    params['type'] = data[1];
    this.model = new Model;
    return this.model.fetch({
      data: params,
      success: function() {
        _this.publishEvent('log:info', "data with " + params.model + params.type + " fetched ok");
        if (_.isObject(_this.model.attributes[params.type]["" + params.model + "_" + params.type])) {
          localStorage.setObject("" + params.model + "_" + params.type, _this.model.attributes[params.type]["" + params.model + "_" + params.type]);
          return typeof _this.callback === "function" ? _this.callback() : void 0;
        }
      },
      error: function() {
        _this.publishEvent('tell_user', 'Brak połączenia z serwerem - formularze nie zostały odświerzone');
        return typeof _this.callback === "function" ? _this.callback() : void 0;
      }
    });
  };

  RefreshController.prototype.refresh_dependencies = function(model) {
    var self;
    self = this;
    return async.series([
      function(callback) {
        return self.refresh_model('flat_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('flat_sell/schema', callback);
      }, function(callback) {
        return self.refresh_model('house_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('house_sell/schema', callback);
      }
    ]);
  };

  return RefreshController;

})(Controller);

});

;require.register("controllers/structure-controller", function(exports, require, module) {
var ConfirmView, Controller, Footer, Header, InfoView, LeftPanelView, ListFooter, NavFooter, StructureController, StructureView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Controller = require('controllers/base/controller');

StructureView = require('views/structure-view');

Header = require('views/header-view');

Footer = require('views/footer-view');

NavFooter = require('views/footer-edit-view');

ListFooter = require('views/footer-list-view');

LeftPanelView = require('views/left-panel-view');

InfoView = require('views/info-view');

ConfirmView = require('views/confirm-view');

module.exports = StructureController = (function(_super) {

  __extends(StructureController, _super);

  function StructureController() {
    return StructureController.__super__.constructor.apply(this, arguments);
  }

  StructureController.prototype.beforeAction = function(params, route) {
    var edit_footer, list_footer, _ref, _ref1;
    this.publishEvent('log:info', 'StructureController start ------------');
    this.compose('structure', StructureView);
    this.compose('header', Header, {
      region: 'header'
    });
    edit_footer = ['listing#add', 'listing#show', 'client#add', 'client#show', 'client-public#show', 'branch#add', 'branch#show', 'agent#add', 'agent#show', 'bon#show'];
    list_footer = ['listing#list', 'client#list', 'client-public#list', 'branch#list', 'agent#list', 'bon#list'];
    if (_ref = route.name, __indexOf.call(edit_footer, _ref) >= 0) {
      this.compose('footer-nav', NavFooter, {
        region: 'footer'
      });
    } else if (_ref1 = route.name, __indexOf.call(list_footer, _ref1) >= 0) {
      this.compose('footer-list', ListFooter, {
        region: 'footer'
      });
    } else {
      this.compose('footer', Footer, {
        region: 'footer'
      });
    }
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
  new Application({
    controllerSuffix: '-controller',
    pushState: false,
    routes: routes
  });
  Storage.prototype.setObject = function(key, value) {
    return this.setItem(key, JSON.stringify(value));
  };
  return Storage.prototype.getObject = function(key) {
    var value;
    value = this.getItem(key);
    return value && JSON.parse(value);
  };
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

;require.register("models/agent-collection", function(exports, require, module) {
var AgentList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/agent-model');

module.exports = AgentList = (function(_super) {

  __extends(AgentList, _super);

  function AgentList() {
    return AgentList.__super__.constructor.apply(this, arguments);
  }

  AgentList.prototype.model = Model;

  AgentList.prototype.url = 'http://localhost:8080/v1/agenci';

  return AgentList;

})(Chaplin.Collection);

});

;require.register("models/agent-model", function(exports, require, module) {
var Agent, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Agent = (function(_super) {

  __extends(Agent, _super);

  function Agent() {
    return Agent.__super__.constructor.apply(this, arguments);
  }

  Agent.prototype.urlRoot = 'http://localhost:8080/v1/agenci';

  Agent.prototype.schema = {};

  Agent.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Agent.prototype.defaults = {
    is_active: '1',
    is_active_func: function() {
      if (this.get('is_active')) {
        return 'tak';
      } else {
        return 'nie';
      }
    },
    is_admin_func: function() {
      if (this.get('is_admin')) {
        return 'tak';
      } else {
        return 'nie';
      }
    },
    agent_type_func: function() {
      switch (this.get('agent_type')) {
        case 0:
          return 'pośrednik';
        case 1:
          return 'admin';
        case 2:
          return 'menadzer';
        case 3:
          return 'IT';
      }
    }
  };

  Agent.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  return Agent;

})(Chaplin.Model);

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

;require.register("models/bon-model", function(exports, require, module) {
var Bon, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Bon = (function(_super) {

  __extends(Bon, _super);

  function Bon() {
    return Bon.__super__.constructor.apply(this, arguments);
  }

  Bon.prototype.urlRoot = 'http://localhost:8080/v1/biura';

  Bon.prototype.schema = {};

  return Bon;

})(Chaplin.Model);

});

;require.register("models/branch-collection", function(exports, require, module) {
var BranchList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/branch-model');

module.exports = BranchList = (function(_super) {

  __extends(BranchList, _super);

  function BranchList() {
    return BranchList.__super__.constructor.apply(this, arguments);
  }

  BranchList.prototype.model = Model;

  BranchList.prototype.url = 'http://localhost:8080/v1/oddzialy';

  return BranchList;

})(Chaplin.Collection);

});

;require.register("models/branch-model", function(exports, require, module) {
var Branch, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Branch = (function(_super) {

  __extends(Branch, _super);

  function Branch() {
    return Branch.__super__.constructor.apply(this, arguments);
  }

  Branch.prototype.urlRoot = 'http://localhost:8080/v1/oddzialy';

  Branch.prototype.schema = {};

  Branch.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Branch.prototype.defaults = {
    is_main_func: function() {
      if (this.get('is_main')) {
        return 'tak';
      } else {
        return 'nie';
      }
    }
  };

  Branch.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  return Branch;

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

  Client.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Client.prototype.defaults = {
    is_private: '',
    client_type_func: function() {
      switch (this.get('client_type')) {
        case 1:
          return 'kupujący';
        case 2:
          return 'sprzedający';
        case 3:
          return 'wynajmujący';
        case 4:
          return 'najemca';
      }
    }
  };

  Client.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  Client.prototype.initialize = function() {
    this.on('change:surname', this.onChange);
    this.on('add', this.onAdd);
    this.on('remove', this.onRemove);
    return this.on('destroy', this.onDestory);
  };

  Client.prototype.onChange = function() {
    return this.publishEvent('modelchanged', 'client');
  };

  Client.prototype.onAdd = function() {
    return console.log('--> model add');
  };

  Client.prototype.onDestroy = function() {
    return this.publishEvent('modelchanged', 'client');
  };

  Client.prototype.onRemove = function() {
    return console.log('--> model remove');
  };

  return Client;

})(Chaplin.Model);

});

;require.register("models/client-public-collection", function(exports, require, module) {
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

  ClientList.prototype.url = 'http://localhost:8080/v1/klienci-wspolni';

  return ClientList;

})(Chaplin.Collection);

});

;require.register("models/listing-collection", function(exports, require, module) {
var ListingList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/listing-model');

module.exports = ListingList = (function(_super) {

  __extends(ListingList, _super);

  function ListingList() {
    return ListingList.__super__.constructor.apply(this, arguments);
  }

  ListingList.prototype.model = Model;

  ListingList.prototype.url = 'http://localhost:8080/v1/oferty';

  return ListingList;

})(Chaplin.Collection);

});

;require.register("models/listing-model", function(exports, require, module) {
var Listing,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Listing = (function(_super) {

  __extends(Listing, _super);

  function Listing() {
    return Listing.__super__.constructor.apply(this, arguments);
  }

  Listing.prototype.urlRoot = 'http://localhost:8080/v1/oferty';

  Listing.prototype.schema = {};

  Listing.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Listing.prototype.defaults = {
    thumbnail_func: function() {
      var img, r, resource;
      resource = this.get('resources');
      if (!_.isEmpty(resource)) {
        r = resource[0];
        if (r.mime_type.split('/')[0] === 'image') {
          img = new Image();
          img.src = 'data:' + r.mime_type + ';base64,' + r.thumbnail;
          return img.outerHTML;
        }
      }
    }
  };

  Listing.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  return Listing;

})(Chaplin.Model);

});

;require.register("models/login-model", function(exports, require, module) {
var Login,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Login = (function(_super) {

  __extends(Login, _super);

  function Login() {
    this.update_db = __bind(this.update_db, this);
    return Login.__super__.constructor.apply(this, arguments);
  }

  Login.prototype.url = 'http://localhost:8080/v1/login';

  Login.prototype.update_db = function() {
    var key, val, _ref, _ref1;
    localStorage.clear();
    _ref = this.get('schemas');
    for (key in _ref) {
      val = _ref[key];
      localStorage.setObject(key, val);
    }
    _ref1 = this.get('forms');
    for (key in _ref1) {
      val = _ref1[key];
      localStorage.setObject(key, val);
    }
    localStorage.setObject('categories', this.get('categories'));
    localStorage.setObject('choices', this.get('choices'));
    return this.set({
      is_logged: true
    });
  };

  return Login;

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

;require.register("models/refresh-model", function(exports, require, module) {
var Refresh, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Refresh = (function(_super) {

  __extends(Refresh, _super);

  function Refresh() {
    return Refresh.__super__.constructor.apply(this, arguments);
  }

  Refresh.prototype.urlRoot = 'http://localhost:8080/v1/refresh';

  return Refresh;

})(Chaplin.Model);

});

;require.register("routes", function(exports, require, module) {

module.exports = function(match) {
  match('', 'home#show');
  match('klienci/dodaj', 'client#add');
  match('klienci', 'client#list');
  match('klienci/:id', 'client#show');
  match('klienci-wspolni', 'client-public#list');
  match('klienci-wspolni/:id', 'client-public#show');
  match('login', 'login#show');
  match('biura/:id', 'bon#show');
  match('oddzialy/dodaj', 'branch#add');
  match('oddzialy', 'branch#list');
  match('oddzialy/:id', 'branch#show');
  match('agenci/dodaj', 'agent#add');
  match('agenci', 'agent#list');
  match('agenci/:id', 'agent#show');
  match('oferty/dodaj', 'listing#add');
  match('oferty', 'listing#list');
  match('oferty/:id', 'listing#show');
  return match('iframe/:template', 'iframe#show');
};

});

;require.register("views/agent-list-view", function(exports, require, module) {
var ListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = ListView = (function(_super) {

  __extends(ListView, _super);

  function ListView() {
    this.attach = __bind(this.attach, this);
    return ListView.__super__.constructor.apply(this, arguments);
  }

  ListView.prototype.initialize = function(options) {
    return ListView.__super__.initialize.apply(this, arguments);
  };

  ListView.prototype.attach = function() {
    ListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: agent list afterRender()');
  };

  return ListView;

})(View);

});

;require.register("views/agent-view", function(exports, require, module) {
var View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    this.attach = __bind(this.attach, this);

    this.delete_action = __bind(this.delete_action, this);

    this.save_action = __bind(this.save_action, this);

    this.initialize = __bind(this.initialize, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.initialize = function(options) {
    View.__super__.initialize.apply(this, arguments);
    return this.publishEvent('log:info', 'edit vewq');
  };

  View.prototype.save_action = function() {
    var _this = this;
    View.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          _this.publishEvent('tell_user', 'Agent zapisany');
          return Chaplin.utils.redirectTo({
            url: '/agenci'
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

  View.prototype.delete_action = function() {
    var _this = this;
    View.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.agents.remove(_this.model);
        _this.publishEvent('tell_user', 'Agent został usunięty');
        return Chaplin.utils.redirectTo({
          url: '/agenci'
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

  View.prototype.attach = function() {
    return View.__super__.attach.apply(this, arguments);
  };

  return View;

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
    this.user = 'admin@novum';
    this.pass = 'admin';
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
          'user_pass': _this.pass
        });
        _this.model.set({
          'company_name': _this.user.split('@')[1]
        });
        _this.model.update_db();
        $('#first-name-placeholder').text(_this.model.get('first_name') || _this.model.get('username'));
        $('#bon-config-link').attr('href', "/biura/" + (_this.model.get('company_id')));
        $('#agent-config-link').attr('href', "/agenci/" + (_this.model.get('id')));
        return Chaplin.utils.redirectTo({
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

;require.register("views/bon-view", function(exports, require, module) {
var BonEditView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = BonEditView = (function(_super) {

  __extends(BonEditView, _super);

  function BonEditView() {
    this.delete_action = __bind(this.delete_action, this);

    this.save_action = __bind(this.save_action, this);

    this.initialize = __bind(this.initialize, this);
    return BonEditView.__super__.constructor.apply(this, arguments);
  }

  BonEditView.prototype.initialize = function(options) {
    return BonEditView.__super__.initialize.apply(this, arguments);
  };

  BonEditView.prototype.save_action = function() {
    var _this = this;
    BonEditView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          return _this.publishEvent('tell_user', 'Dane biura zostały zapisane');
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

  BonEditView.prototype.delete_action = function() {
    var _this = this;
    BonEditView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        return _this.publishEvent('log:info', 'dyspozycja usunięcia konta przyjęta');
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

  return BonEditView;

})(View);

});

;require.register("views/branch-list-view", function(exports, require, module) {
var BranchListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = BranchListView = (function(_super) {

  __extends(BranchListView, _super);

  function BranchListView() {
    this.attach = __bind(this.attach, this);
    return BranchListView.__super__.constructor.apply(this, arguments);
  }

  BranchListView.prototype.initialize = function(options) {
    return BranchListView.__super__.initialize.apply(this, arguments);
  };

  BranchListView.prototype.attach = function() {
    BranchListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: branch-list afterRender()');
  };

  return BranchListView;

})(View);

});

;require.register("views/branch-view", function(exports, require, module) {
var BranchView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = BranchView = (function(_super) {

  __extends(BranchView, _super);

  function BranchView() {
    this.delete_action = __bind(this.delete_action, this);

    this.save_action = __bind(this.save_action, this);

    this.initialize = __bind(this.initialize, this);
    return BranchView.__super__.constructor.apply(this, arguments);
  }

  BranchView.prototype.initialize = function(options) {
    return BranchView.__super__.initialize.apply(this, arguments);
  };

  BranchView.prototype.save_action = function() {
    var _this = this;
    BranchView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          if (mediator.collections.branches != null) {
            mediator.collections.branches.add(_this.model);
          }
          _this.publishEvent('tell_user', 'Oddział zapisany');
          return Chaplin.utils.redirectTo({
            url: '/oddzialy'
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

  BranchView.prototype.delete_action = function() {
    var _this = this;
    BranchView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.branches.remove(_this.model);
        _this.publishEvent('tell_user', 'Oddział został usunięty');
        return Chaplin.utils.redirectTo({
          url: '/oddzialy'
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

  return BranchView;

})(View);

});

;require.register("views/client-list-view", function(exports, require, module) {
var ClientListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = ClientListView = (function(_super) {

  __extends(ClientListView, _super);

  function ClientListView() {
    this.attach = __bind(this.attach, this);
    return ClientListView.__super__.constructor.apply(this, arguments);
  }

  ClientListView.prototype.initialize = function(params) {
    return ClientListView.__super__.initialize.apply(this, arguments);
  };

  ClientListView.prototype.attach = function() {
    ClientListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: client list view afterRender()');
  };

  return ClientListView;

})(View);

});

;require.register("views/client-public-list-view", function(exports, require, module) {
var ClientListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = ClientListView = (function(_super) {

  __extends(ClientListView, _super);

  function ClientListView() {
    this.attach = __bind(this.attach, this);
    return ClientListView.__super__.constructor.apply(this, arguments);
  }

  ClientListView.prototype.initialize = function(options) {
    return ClientListView.__super__.initialize.apply(this, arguments);
  };

  ClientListView.prototype.attach = function() {
    ClientListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: client public list afterRender()');
  };

  return ClientListView;

})(View);

});

;require.register("views/client-public-view", function(exports, require, module) {
var ClientView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = ClientView = (function(_super) {

  __extends(ClientView, _super);

  function ClientView() {
    this.delete_action = __bind(this.delete_action, this);

    this.initialize = __bind(this.initialize, this);
    return ClientView.__super__.constructor.apply(this, arguments);
  }

  ClientView.prototype.initialize = function(options) {
    return ClientView.__super__.initialize.apply(this, arguments);
  };

  ClientView.prototype.delete_action = function() {
    var _this = this;
    ClientView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.clients_public.remove(_this.model);
        _this.publishEvent('tell_user', 'Klient został usunięty');
        return Chaplin.utils.redirectTo({
          url: '/klienci-wspolni'
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

  return ClientView;

})(View);

});

;require.register("views/client-view", function(exports, require, module) {
var ClientAddView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = ClientAddView = (function(_super) {

  __extends(ClientAddView, _super);

  function ClientAddView() {
    this.attach = __bind(this.attach, this);

    this.delete_action = __bind(this.delete_action, this);

    this.refresh_form = __bind(this.refresh_form, this);

    this.save_action = __bind(this.save_action, this);

    this.save_and_add_action = __bind(this.save_and_add_action, this);

    this.initialize = __bind(this.initialize, this);
    return ClientAddView.__super__.constructor.apply(this, arguments);
  }

  ClientAddView.prototype.initialize = function(options) {
    return ClientAddView.__super__.initialize.apply(this, arguments);
  };

  ClientAddView.prototype.save_and_add_action = function() {
    ClientAddView.__super__.save_and_add_action.apply(this, arguments);
    return this.save_action('/klienci/dodaj');
  };

  ClientAddView.prototype.save_action = function(url) {
    var _this = this;
    ClientAddView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          if (mediator.collections.clients != null) {
            mediator.collections.clients.add(_this.model);
          }
          _this.publishEvent('tell_user', 'Klient zapisany');
          return Chaplin.utils.redirectTo({
            url: url != null ? url : '/klienci'
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
    return Chaplin.utils.redirectTo({
      url: '/klienci/dodaj'
    });
  };

  ClientAddView.prototype.delete_action = function() {
    var _this = this;
    ClientAddView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.clients.remove(_this.model);
        _this.publishEvent('tell_user', 'Klient został usunięty');
        return Chaplin.utils.redirectTo({
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

  ClientAddView.prototype.attach = function() {
    ClientAddView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: clientadd afterRender()');
  };

  return ClientAddView;

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

;require.register("views/edit-view", function(exports, require, module) {
var EditView, View, mediator, upload_template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

mediator = require('mediator');

upload_template = require('views/templates/upload');

module.exports = EditView = (function(_super) {

  __extends(EditView, _super);

  function EditView() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.save_action = __bind(this.save_action, this);

    this.get_form = __bind(this.get_form, this);

    this.save_and_add_action = __bind(this.save_and_add_action, this);

    this.save_action = __bind(this.save_action, this);

    this.delete_action = __bind(this.delete_action, this);

    this.form_help = __bind(this.form_help, this);

    this.init_uploader = __bind(this.init_uploader, this);

    this.init_sortable = __bind(this.init_sortable, this);

    this._remove_resources = __bind(this._remove_resources, this);

    this.remove_resources = __bind(this.remove_resources, this);

    this.remove_resources_click = __bind(this.remove_resources_click, this);

    this.refresh_resource = __bind(this.refresh_resource, this);

    this.init_events = __bind(this.init_events, this);

    this.resource_preview = __bind(this.resource_preview, this);

    this.popup_position = __bind(this.popup_position, this);

    this.initialize = __bind(this.initialize, this);
    return EditView.__super__.constructor.apply(this, arguments);
  }

  EditView.prototype.autoRender = true;

  EditView.prototype.containerMethod = "html";

  EditView.prototype.attributes = {
    'data-role': 'content'
  };

  EditView.prototype.id = 'content';

  EditView.prototype.className = 'ui-content';

  EditView.prototype.initialize = function(params) {
    var _ref, _ref1;
    EditView.__super__.initialize.apply(this, arguments);
    this.params = params;
    this.model = this.params.model;
    this.form_name = this.params.form_name;
    this.can_edit = this.params.can_edit;
    this.edit_type = this.params.edit_type;
    this.listing_type = (_ref = this.params.listing_type) != null ? _ref : false;
    this.delete_only = (_ref1 = this.params.delete_only) != null ? _ref1 : false;
    this.publishEvent('log:debug', "form_name:" + this.form_name + ", can_edit:" + this.can_edit + ", listing_type:" + this.listing_type + ", delete_only:" + this.delete_only + " ");
    this.subscribeEvent('delete:clicked', this.delete_action);
    this.subscribeEvent('popupbeforeposition', this.popup_position);
    this.subscribeEvent('save:clicked', this.save_action);
    this.subscribeEvent('save_and_add:clicked', this.save_and_add_action);
    this.delegate('click', 'a.form-help', this.form_help);
    this.delegate('click', '[data-role=\'navbar\']:first li', this.refresh_resource);
    return this.delegate('click', "[name='resources'] li a:first-child", this.resource_preview);
  };

  EditView.prototype.popup_position = function() {
    return console.log('popup position fired');
  };

  EditView.prototype.resource_preview = function(e) {
    var button, element, img, preview, save_button, uuid;
    e.preventDefault();
    uuid = e.target.id;
    preview = e.target.dataset.preview;
    this.publishEvent("log:info", "" + uuid + "," + preview + ", " + e);
    img = new Image();
    if (preview === "true") {
      img.src = "http://localhost:8080/v1/pliki/" + uuid + "/" + (mediator.models.user.get('company_name'));
    } else {
      img.src = "images/file.png";
    }
    button = "<a href='#' data-rel='back' class='ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right'>Zamknij</a>";
    save_button = "<a href='http://localhost:8080/v1/pliki/" + uuid + "/" + (mediator.models.user.get('company_name')) + "?download=true' class='ui-btn ui-btn-inline'>Zapisz na dysku</a>";
    element = "" + button + img.outerHTML + "<br />" + save_button;
    return setTimeout(function() {
      return $('#resource_preview').html(element).popup('open');
    }, 1000);
  };

  EditView.prototype.init_events = function() {
    this.editor = this.form.fields.resources.editor;
    this.editor.on('add', this.refresh_resource);
    return this.delegate('click', '[data-action=\'remove\']', this.remove_resources_click);
  };

  EditView.prototype.refresh_resource = function() {
    var $li, $ul;
    this.publishEvent("log:debug", "refresh_resource");
    $ul = $("#resource_list");
    $li = $("#resource_list li");
    this.publishEvent("log:debug", "marked: " + $ul + $li);
    try {
      $ul.listview("refresh");
      return $ul.trigger("updatelayout");
    } catch (error) {
      return this.publishEvent("log:warn", error);
    }
  };

  EditView.prototype.remove_resources_click = function(e) {
    var self,
      _this = this;
    self = this;
    e.preventDefault();
    this.uuid = e.target.id;
    $("#confirm").popup('open');
    return $("#confirmed").unbind().click(function() {
      return self.remove_resources(_this.uuid);
    });
  };

  EditView.prototype.remove_resources = function(uuid) {
    var self, url,
      _this = this;
    self = this;
    url = "http://localhost:8080/v1/pliki/" + uuid;
    return $.ajax({
      url: url,
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('X-Auth-Token', mediator.gen_token(url));
      },
      type: "DELETE",
      success: function(data, textStatus, jqXHR) {
        var i, items, new_items, _i, _len, _results;
        items = self.form.fields.resources.getValue();
        new_items = [];
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          i = items[_i];
          if (i.uuid === uuid) {
            _results.push(self.form.fields.resources.editor.removeItem(i, items.indexOf(i)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return self.publishEvent("tell_user", jqXHR.responseJSON.title || errorThrown);
      }
    });
  };

  EditView.prototype._remove_resources = function(listEditor, itemEditor, extra) {
    var self, url,
      _this = this;
    self = this;
    url = "http://localhost:8080/v1/pliki/" + itemEditor.value.uuid;
    return $.ajax({
      url: url,
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('X-Auth-Token', mediator.gen_token(url));
      },
      type: "DELETE",
      success: function(data, textStatus, jqXHR) {
        var i, items, new_items, _i, _len, _results;
        items = self.form.fields.resources.getValue();
        new_items = [];
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          i = items[_i];
          if (i.uuid === itemEditor.value.uuid) {
            _results.push(self.form.fields.resources.editor.removeItem(i, items.indexOf(i)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return self.publishEvent("tell_user", jqXHR.responseJSON.title || errorThrown);
      }
    });
  };

  EditView.prototype.init_sortable = function() {
    var self;
    self = this;
    return $("#resource_list").sortable({
      stop: function(event, ui) {
        var i, key, order, pattern, sorted, to_sort, _i, _len, _results;
        key = [];
        sorted = [];
        pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
        $(this).children('li').find('a:first').each(function(i, str) {
          return key.push(str.innerHTML.match(pattern)[0]);
        });
        to_sort = self.form.fields.resources.getValue();
        if (to_sort.length > 0) {
          _results = [];
          for (_i = 0, _len = to_sort.length; _i < _len; _i++) {
            i = to_sort[_i];
            order = key.indexOf(i.uuid) + 1;
            _results.push(i.order = order);
          }
          return _results;
        }
      }
    });
  };

  EditView.prototype.init_uploader = function() {
    var self;
    self = this;
    this.$el.append(upload_template);
    return this.uploader = new qq.FineUploader({
      element: $("#upload")[0],
      request: {
        endpoint: 'http://localhost:8080/v1/pliki',
        customHeaders: {
          'X-Auth-Token': mediator.gen_token('http://localhost:8080/v1/pliki')
        }
      },
      callbacks: {
        onSubmit: function(e) {
          return self.publishEvent('log:info', "download submitted " + e);
        },
        onComplete: function(id, filename, response, xmlhttprequest) {
          var current_val, order;
          if (response.success === true) {
            order = self.form.fields.resources.getValue().length;
            current_val = {
              mime_type: response.mime_type,
              uuid: response.uuid,
              thumbnail: response.thumbnail,
              filename: response.filename,
              size: response.size,
              order: order + 1
            };
            self.form.fields.resources.editor.addItem(current_val, true);
            return self.publishEvent('log:info', "download complete " + arguments);
          } else {
            self.publishEvent('log:info', "download failed " + arguments);
            return self.publishEvent('tell_user', "Plik nie został pomyślnie przesłany na serwer ");
          }
        }
      },
      cors: {
        expected: true
      },
      validation: {
        sizeLimit: 2048000
      }
    });
  };

  EditView.prototype.form_help = function(event) {
    return this.publishEvent('tell_user', event.target.text);
  };

  EditView.prototype.delete_action = function() {
    return this.publishEvent('log:info', 'delete  caught');
  };

  EditView.prototype.save_action = function(url) {
    return this.publishEvent('log:info', 'save_action  caught');
  };

  EditView.prototype.save_and_add_action = function() {
    return this.publishEvent('log:info', 'save_and_add_action  caught');
  };

  EditView.prototype.get_form = function() {
    this.publishEvent('log:info', "form name: " + this.form_name);
    window.model = this.model;
    this.form = new Backbone.Form({
      model: this.model,
      template: _.template(localStorage.getObject(this.form_name))
    });
    window.form = this.form;
    return this.form.render();
  };

  EditView.prototype.save_action = function() {
    return this.publishEvent('log:debug', 'save_action caugth');
  };

  EditView.prototype.render = function() {
    EditView.__super__.render.apply(this, arguments);
    this.publishEvent('log:info', 'view: edit-view beforeRender()');
    if (!this.form_name.match('rent|sell')) {
      this.get_form();
      this.$el.append(this.form.el);
      return this.publishEvent('log:info', 'view: edit-view RenderEnd()');
    }
  };

  EditView.prototype.attach = function() {
    var _ref;
    EditView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: edit-view afterRender()');
    this.publishEvent('disable_buttons', (_ref = this.can_edit) != null ? _ref : False, this.edit_type, this.delete_only);
    if (!this.form_name.match('rent|sell')) {
      if (_.isObject(this.model.schema.resources)) {
        this.init_events();
        this.init_uploader();
        this.init_sortable();
      }
    }
    return this.publishEvent('jqm_refersh:render');
  };

  return EditView;

})(View);

});

;require.register("views/footer-edit-view", function(exports, require, module) {
var FooterView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/footer_edit');

View = require('views/base/view');

module.exports = FooterView = (function(_super) {

  __extends(FooterView, _super);

  function FooterView() {
    this.attach = __bind(this.attach, this);

    this.save_and_add = __bind(this.save_and_add, this);

    this["delete"] = __bind(this["delete"], this);

    this.save = __bind(this.save, this);
    return FooterView.__super__.constructor.apply(this, arguments);
  }

  FooterView.prototype.template = template;

  FooterView.prototype.containerMethod = 'html';

  FooterView.prototype.id = 'footer';

  FooterView.prototype.attributes = {
    'data-role': 'footer',
    'data-position': 'fixed',
    'data-theme': 'b'
  };

  FooterView.prototype.initialize = function() {
    FooterView.__super__.initialize.apply(this, arguments);
    this.delegate('click', '#delete-button', this["delete"]);
    this.delegate('click', '#save-button', this.save);
    return this.delegate('click', '#save-and-add-button', this.save_and_add);
  };

  FooterView.prototype.save = function(event) {
    event.preventDefault();
    return this.publishEvent('save:clicked');
  };

  FooterView.prototype["delete"] = function(event) {
    event.preventDefault();
    return this.publishEvent('delete:clicked');
  };

  FooterView.prototype.save_and_add = function(event) {
    event.preventDefault();
    return this.publishEvent('save_and_add:clicked');
  };

  FooterView.prototype.attach = function() {
    FooterView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'FooterEditView:attach()');
    return this.publishEvent('jqm_footer_refersh:render');
  };

  return FooterView;

})(View);

});

;require.register("views/footer-list-view", function(exports, require, module) {
var FooterView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/footer_list');

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
    'data-position': 'fixed',
    'data-theme': 'b'
  };

  FooterView.prototype.attach = function() {
    FooterView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'FooterView:attach');
    return this.publishEvent('jqm_footer_refersh:render');
  };

  return FooterView;

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
    'data-position': 'fixed',
    'data-theme': 'b'
  };

  FooterView.prototype.attach = function() {
    FooterView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'FooterView:attach');
    return this.publishEvent('jqm_footer_refersh:render');
  };

  return FooterView;

})(View);

});

;require.register("views/header-view", function(exports, require, module) {
var HeaderView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/header_base');

View = require('views/base/view');

mediator = require('mediator');

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
    'data-role': 'header',
    'data-theme': 'b'
  };

  HeaderView.prototype.initialize = function() {
    HeaderView.__super__.initialize.apply(this, arguments);
    return this.delegate('click', '#first-name-placeholder', this.login_screen);
  };

  HeaderView.prototype.login_screen = function() {
    mediator.user = {};
    mediator.controllers = {};
    mediator.models = {};
    return Chaplin.utils.redirectTo({
      url: '/login'
    });
  };

  HeaderView.prototype.attach = function() {
    HeaderView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HeaderView:attach()');
  };

  return HeaderView;

})(View);

});

;require.register("views/home-page-view", function(exports, require, module) {
var HomePageView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/home');

View = require('views/base/view');

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
      title: "na homepage!"
    };
  };

  HomePageView.prototype.attach = function() {
    HomePageView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HomeView: attach()');
  };

  return HomePageView;

})(View);

});

;require.register("views/iframe-view", function(exports, require, module) {
var IFrameView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/iframe');

View = require('views/base/view');

module.exports = IFrameView = (function(_super) {

  __extends(IFrameView, _super);

  function IFrameView() {
    this.attach = __bind(this.attach, this);

    this.getTemplateData = __bind(this.getTemplateData, this);
    return IFrameView.__super__.constructor.apply(this, arguments);
  }

  IFrameView.prototype.autoRender = true;

  IFrameView.prototype.containerMethod = "html";

  IFrameView.prototype.attributes = {
    'data-role': 'content'
  };

  IFrameView.prototype.id = 'content';

  IFrameView.prototype.template = template;

  IFrameView.prototype.className = 'ui-content';

  IFrameView.prototype.initialize = function(options) {
    var dic;
    dic = {
      geodz: {
        url: 'http://mapy.geoportal.gov.pl/imap/?gpmap=gp0&actions=acShowWgPlot',
        title: ''
      },
      kw: {
        url: 'http://ekw.ms.gov.pl/pdcbdkw/pdcbdkw.html',
        title: 'Księgi wieczyste '
      },
      geo: {
        url: 'http://maps.geoportal.gov.pl/webclient/',
        title: ''
      },
      calendar: {
        url: 'https://www.google.com/calendar',
        title: ''
      }
    };
    this.url = dic[options.template]['url'];
    return this.title = dic[options.template]['title'];
  };

  IFrameView.prototype.getTemplateData = function() {
    return {
      title: this.title,
      url: this.url,
      width: $(document.body).width(),
      height: $(document.body).height()
    };
  };

  IFrameView.prototype.attach = function() {
    IFrameView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'IFrameView: attach()');
  };

  return IFrameView;

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
    'data-position-to': 'window',
    'data-arrow': 'true'
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
    this.jqm_table_refresh = __bind(this.jqm_table_refresh, this);

    this.jqm_recreate = __bind(this.jqm_recreate, this);

    this.jqm_footer_refersh = __bind(this.jqm_footer_refersh, this);

    this.jqm_page_refersh = __bind(this.jqm_page_refersh, this);

    this.jqm_refersh_alone = __bind(this.jqm_refersh_alone, this);

    this.jqm_refersh = __bind(this.jqm_refersh, this);

    this.jqm_leftpanel = __bind(this.jqm_leftpanel, this);

    this.jqm_init = __bind(this.jqm_init, this);

    this.log_error = __bind(this.log_error, this);

    this.log_warn = __bind(this.log_warn, this);

    this.log_info = __bind(this.log_info, this);

    this.log_debug = __bind(this.log_debug, this);

    this.disable_buttons = __bind(this.disable_buttons, this);

    this.disable_form = __bind(this.disable_form, this);

    this.server_error = __bind(this.server_error, this);

    this.tell_user = __bind(this.tell_user, this);

    this.schema_change = __bind(this.schema_change, this);

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
      this.subscribeEvent('schema_change', this.schema_change);
      this.subscribeEvent('jqm_refersh:render', this.jqm_refersh);
      this.subscribeEvent('jqm_page_refersh:render', this.jqm_page_refersh);
      this.subscribeEvent('jqm_footer_refersh:render', this.jqm_footer_refersh);
      this.subscribeEvent('loading_start', this.jqm_loading_start);
      this.subscribeEvent('loading_stop', this.jqm_loading_stop);
      this.subscribeEvent('disable_buttons', this.disable_buttons);
      this.subscribeEvent('disable_form', this.disable_form);
      this.subscribeEvent('table_refresh', this.jqm_table_refresh);
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

  Layout.prototype.schema_change = function() {
    this.log.info('****************refreshing schema');
    return mediator.models.user.fetch();
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
    }, 4000);
  };

  Layout.prototype.server_error = function() {
    this.log.debug('server error');
    $('#info').text('Upss, brak kontaktu z serwerem...');
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

  Layout.prototype.disable_form = function(can_edit) {
    this.log.info('form disable caught');
    if (!can_edit) {
      $("form input:radio").checkboxradio('disable');
      $("form :input").textinput({
        disabled: true
      });
      $("form [data-role='slider']").slider({
        disabled: true
      });
      return $("form [data-role='controlgroup'] select").selectmenu("disable");
    }
  };

  Layout.prototype.disable_buttons = function(can_edit, edit_type, delete_only) {
    this.log.info('form buttons disable caught');
    if (edit_type === 'add') {
      $("#delete-button").attr('disabled', true);
    }
    if (!can_edit) {
      $("#delete-button").attr('disabled', true);
      $("#save-button").attr('disabled', true);
      $("#save-and-add-button").attr('disabled', true);
    }
    if (delete_only) {
      $("#save-button").attr('disabled', true);
      return $("#save-and-add-button").attr('disabled', true);
    }
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
    var f1, f2, self;
    self = this;
    f1 = function(callback) {
      return callback();
    };
    f2 = function(callback) {
      return callback();
    };
    f1(function() {
      $("#content-region").enhanceWithin();
      return f2(function() {
        return self.publishEvent('jqm_finished_rendering');
      });
    });
    return $.mobile.loading('hide');
  };

  Layout.prototype.jqm_refersh_alone = function() {
    var f1, f2, f3, self;
    f1 = function(callback) {
      return callback();
    };
    f2 = function(callback) {
      return callback();
    };
    f3 = function(callback) {
      return callback();
    };
    self = this;
    return f1(function() {
      self.jqm_loading_start();
      self.tell_user('loading');
      console.log(1);
      return f2(function() {
        elf.jqm_refersh();
        console.log(2);
        return f3(function() {
          self.jqm_loading_stop();
          return console.log(3);
        });
      });
    });
  };

  Layout.prototype.jqm_page_refersh = function() {
    this.log.info('layout: event jqm_page_refresh caugth');
    $("#page").enhanceWithin();
    return $.mobile.loading('hide');
  };

  Layout.prototype.jqm_footer_refersh = function() {
    this.log.info('layout: event jqm_footer_refresh caugth');
    return $("#footer-region").enhanceWithin();
  };

  Layout.prototype.jqm_recreate = function() {};

  Layout.prototype.jqm_table_refresh = function() {
    this.log.info('layout: jqm_table_refresh ');
    return $("#list-table").table("refresh");
  };

  return Layout;

})(Chaplin.Layout);

});

;require.register("views/left-panel-view", function(exports, require, module) {
var LeftPanelView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/left-panel');

mediator = require('mediator');

module.exports = LeftPanelView = (function(_super) {

  __extends(LeftPanelView, _super);

  function LeftPanelView() {
    this.attach = __bind(this.attach, this);

    this.panel_close = __bind(this.panel_close, this);

    this.panel_beforeclose = __bind(this.panel_beforeclose, this);

    this.panel_open = __bind(this.panel_open, this);

    this.panel_beforeopen = __bind(this.panel_beforeopen, this);
    return LeftPanelView.__super__.constructor.apply(this, arguments);
  }

  LeftPanelView.prototype.attributes = {
    'data-role': 'panel',
    'data-position': 'left',
    'data-theme': 'b'
  };

  LeftPanelView.prototype.id = 'left-panel';

  LeftPanelView.prototype.containerMethod = 'append';

  LeftPanelView.prototype.container = 'body';

  LeftPanelView.prototype.template = template;

  LeftPanelView.prototype.initialize = function() {
    LeftPanelView.__super__.initialize.apply(this, arguments);
    this.delegate('panelbeforeopen', this.panel_beforeopen);
    this.delegate('panelbeforeclose', this.panel_beforeclose);
    this.delegate('panelopen', this.panel_open);
    return this.delegate('panelclose', this.panel_close);
  };

  LeftPanelView.prototype.panel_beforeopen = function() {
    this.publishEvent('log:info', 'before panel open');
    $("#header").unwrap();
    $("#content").unwrap();
    return $("#footer").unwrap();
  };

  LeftPanelView.prototype.panel_open = function() {
    this.publishEvent('log:info', 'panel open');
    $("#header").wrap("<div id='header-region'></div>");
    $("#content").wrap("<div id='content-region'></div>");
    $("#footer").wrap("<div id='footer-region'></div>");
    return this.publishEvent('jqm_refresh:render');
  };

  LeftPanelView.prototype.panel_beforeclose = function() {
    return this.publishEvent('log:info', 'panel before close');
  };

  LeftPanelView.prototype.panel_close = function() {
    this.publishEvent('log:info', 'panel close');
    return this.publishEvent('jqm_refresh:render');
  };

  LeftPanelView.prototype.attach = function() {
    LeftPanelView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'LeftPanelView: attach()');
  };

  return LeftPanelView;

})(View);

});

;require.register("views/list-view", function(exports, require, module) {
var ListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

mediator = require('mediator');

module.exports = ListView = (function(_super) {

  __extends(ListView, _super);

  function ListView() {
    this.attach = __bind(this.attach, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.refresh_action = __bind(this.refresh_action, this);

    this.filter_action = __bind(this.filter_action, this);

    this.select_action = __bind(this.select_action, this);

    this.select_all_action = __bind(this.select_all_action, this);
    return ListView.__super__.constructor.apply(this, arguments);
  }

  ListView.prototype.autoRender = true;

  ListView.prototype.containerMethod = "html";

  ListView.prototype.attributes = {
    'data-role': 'content'
  };

  ListView.prototype.id = 'content';

  ListView.prototype.className = 'ui-content';

  ListView.prototype.initialize = function(params) {
    ListView.__super__.initialize.apply(this, arguments);
    this.params = params;
    this.filter = this.params.filter;
    this.collection_hard = this.params.collection;
    this.collection = _.clone(this.params.collection);
    this.template = require("views/templates/" + this.params.template);
    this.delegate('change', '#select-action', this.select_action);
    this.delegate('change', '#all', this.select_all_action);
    this.delegate('click', '#refresh', this.refresh_action);
    this.delegate('change', '#select-filter', this.filter_action);
    return this.publishEvent('log:debug', this.params);
  };

  ListView.prototype.select_all_action = function() {
    var selected;
    selected = $('#list-table>thead input:checkbox ').prop('checked');
    return $('#list-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh");
  };

  ListView.prototype.select_action = function(event) {
    var clean_after_action, selected, self,
      _this = this;
    selected = $('#list-table>tbody input:checked ');
    console.log(selected);
    self = this;
    clean_after_action = function(selected) {
      $('#list-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh");
      $("#select-action :selected").removeAttr('selected');
      selected = null;
    };
    this.publishEvent('log:info', "performing action " + event.target.value + " for offers " + selected);
    if (selected.length > 0) {
      if (event.target.value === 'usun') {
        $("#confirm").popup('open');
        return $("#confirmed").unbind().click(function() {
          var i, model, _i, _len,
            _this = this;
          for (_i = 0, _len = selected.length; _i < _len; _i++) {
            i = selected[_i];
            model = self.collection_hard.get($(i).attr('id'));
            model.destroy({
              wait: true,
              success: function(event) {
                Chaplin.EventBroker.publishEvent('log:info', "Element usunięty id" + (model.get('id')));
                self.collection_hard.remove(model);
                self.render();
                return Chaplin.EventBroker.publishEvent('tell_user', 'Element został usunięty');
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

  ListView.prototype.filter_action = function(event) {
    var list_of_models;
    this.publishEvent('log:debug', event.target.value);
    this.publishEvent('log:debug', this.filter);
    this.filter_obj = {};
    this.filter_obj[this.filter] = parseInt(event.target.value);
    if (_.isEmpty(event.target.value)) {
      this.collection = _.clone(this.collection_hard);
    } else {
      list_of_models = this.collection_hard.where(this.filter_obj);
      this.collection.reset(list_of_models);
    }
    return this.render();
  };

  ListView.prototype.refresh_action = function(event) {
    var _this = this;
    event.preventDefault();
    this.publishEvent('log:debug', 'refresh');
    return this.collection_hard.fetch({
      success: function() {
        _this.publishEvent('tell_user', 'Odświeżam listę elementów');
        _this.collection = _.clone(_this.collection_hard);
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

  ListView.prototype.getTemplateData = function() {
    return {
      collection: this.collection.toJSON()
    };
  };

  ListView.prototype.attach = function() {
    ListView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: list-view afterRender()');
    if (this.collection.length > 1) {
      $("#list-table").tablesorter({
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
    this.publishEvent('jqm_refersh:render');
    return this.publishEvent('table_refresh');
  };

  return ListView;

})(View);

});

;require.register("views/listing-list-view", function(exports, require, module) {
var ListingListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = ListingListView = (function(_super) {

  __extends(ListingListView, _super);

  function ListingListView() {
    this.attach = __bind(this.attach, this);
    return ListingListView.__super__.constructor.apply(this, arguments);
  }

  ListingListView.prototype.initialize = function(params) {
    return ListingListView.__super__.initialize.apply(this, arguments);
  };

  ListingListView.prototype.attach = function() {
    ListingListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: listing list view afterRender()');
  };

  return ListingListView;

})(View);

});

;require.register("views/listing-tab-view", function(exports, require, module) {
var View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

mediator = require('mediator');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.initialize = __bind(this.initialize, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.autoRender = true;

  View.prototype.className = 'ui-content';

  View.prototype.initialize = function(options) {
    this.template = options.template;
    return this.id = options.id;
  };

  View.prototype.render = function() {
    View.__super__.render.apply(this, arguments);
    this.publishEvent('log:info', 'tabview: tab-view render()');
    return this.$el.append(this.template);
  };

  View.prototype.attach = function() {
    $(this.container).find('form div:first').append(this.$el);
    return this.publishEvent('log:info', 'tabview: tab-view afterAttach()');
  };

  return View;

})(View);

});

;require.register("views/listing-view", function(exports, require, module) {
var AddView, TabView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

View = require('views/edit-view');

TabView = require('views/listing-tab-view');

mediator = require('mediator');

module.exports = AddView = (function(_super) {

  __extends(AddView, _super);

  function AddView() {
    this.attach = __bind(this.attach, this);

    this.render_subview = __bind(this.render_subview, this);

    this.render = __bind(this.render, this);

    this.init_openstreet = __bind(this.init_openstreet, this);

    this.delete_action = __bind(this.delete_action, this);

    this.save_action = __bind(this.save_action, this);

    this.rerender_form = __bind(this.rerender_form, this);

    this.change_tab = __bind(this.change_tab, this);

    this.initialize = __bind(this.initialize, this);
    return AddView.__super__.constructor.apply(this, arguments);
  }

  AddView.prototype.initialize = function(params) {
    AddView.__super__.initialize.apply(this, arguments);
    this.delegate('filterablebeforefilter', '#autocomplete', _.debounce(this.address_search, 1500));
    this.delegate('click', '.address_suggestion', this.fill_address);
    this.delegate('click', "[data-role='navbar'] a", this.change_tab);
    this.delegate('change', "[name='category']", this.rerender_form);
    this.delegate('click', "#copy_address", this.copy_address);
    this.rendered_tabs = [];
    return this.categories = localStorage.getObject('categories');
  };

  AddView.prototype.change_tab = function(e) {
    var tab_id;
    e.preventDefault();
    this.publishEvent('log:info', "change tab " + e.target.attributes.href.value[1]);
    tab_id = "tab_" + e.target.attributes.href.value[5];
    return this.render_subview(tab_id);
  };

  AddView.prototype.rerender_form = function(e) {
    var cat, current_category_id, current_form_name, selected_id;
    selected_id = parseInt(e.target.value);
    current_form_name = this.form_name.substring(0, this.form_name.length - 5);
    current_category_id = this.categories[current_form_name];
    if (current_category_id !== selected_id) {
      cat = _.invert(this.categories);
      this.form_name = "" + cat[selected_id] + "_form";
      this.model.schema = localStorage.getObject("" + cat[selected_id] + "_schema");
      this.rendered_tabs = [];
      $("#content").empty();
      this.render();
      return this.render_subview();
    }
  };

  AddView.prototype.save_action = function(url) {
    var _this = this;
    AddView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          ({
            wait: true
          });
          if (mediator.collections.listings != null) {
            mediator.collections.listings.add(_this.model);
          }
          _this.publishEvent('tell_user', 'Rekord zapisany');
          return Chaplin.utils.redirectTo({
            url: url != null ? url : "/oferty?" + ($.param(mediator.last_query))
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

  AddView.prototype.delete_action = function() {
    var _this = this;
    AddView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.listings.remove(_this.model);
        _this.publishEvent('tell_user', 'Rekord został usunięty');
        return Chaplin.utils.redirectTo({
          url: typeof url !== "undefined" && url !== null ? url : "/oferty?" + ($.param(mediator.last_query))
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

  AddView.prototype.copy_address = function(event) {
    this.publishEvent('log:info', 'copy address event');
    event.preventDefault();
    $("[name='internet_postcode']").val($("[name='postcode']").val());
    $("[name='internet_street']").val($("[name='street']").val());
    $("[name='internet_town']").val($("[name='town']").val());
    $("[name='internet_province']").val($("[name='province']").val());
    $("[name='internet_town_district']").val($("[name='town_district']").val());
    $("[name='internet_lat']").val($("[name='lat']").val());
    $("[name='internet_lon']").val($("[name='lon']").val());
    $("[name='internet_borough']").val($("[name='borough']").val());
    return $("[name='internet_county']").val($("[name='county']").val());
  };

  AddView.prototype.address_reset = function() {
    this.publishEvent('log:info', 'address reset');
    $("[name='internet_postcode']").val('');
    $("[name='postcode']").val('');
    $("[name='internet_street']").val('');
    $("[name='street']").val('');
    $("[name='internet_town']").val('');
    $("[name='town']").val('');
    $("[name='internet_province']").val('');
    $("[name='province']").val('');
    $("[name='internet_town_district']").val('');
    $("[name='town_district']").val('');
    $("[name='internet_lat']").val('');
    $("[name='lat']").val('');
    $("[name='internet_lon']").val('');
    $("[name='lon']").val('');
    $("[name='internet_borough']").val('');
    $("[name='borough']").val('');
    $("[name='internet_county']").val('');
    return $("[name='county']").val('');
  };

  AddView.prototype.fill_address = function(event) {
    var $ul, borough, county, full_name, item, newPx, obj, openlayers_projection, position, projection, zoom, _i, _len;
    this.publishEvent('log:info', 'fill address event');
    this.address_reset();
    obj = this.response[event.target.value];
    $("[name='postcode']").val(obj.address.postcode);
    $("[name='street']").val(obj.address.road || obj.address.pedestrian);
    $("[name='town']").val(obj.address.city);
    $("[name='province']").val(obj.address.state);
    $("[name='town_district']").val(obj.address.city_district);
    $("[name='lat']").val(obj.lat);
    $("[name='lon']").val(obj.lon);
    full_name = obj.display_name.split(',');
    for (_i = 0, _len = full_name.length; _i < _len; _i++) {
      item = full_name[_i];
      if (item.indexOf('powiat') > -1) {
        county = item;
      } else if (item.indexOf('gmina') > -1) {
        borough = item;
      }
    }
    $("[name='borough']").val(borough || '');
    $("[name='county']").val(county || '');
    $ul = $('ul#autocomplete.ui-listview');
    $('ul#autocomplete.ui-listview > li').remove();
    $ul.listview("refresh");
    projection = new OpenLayers.Projection("EPSG:4326");
    openlayers_projection = new OpenLayers.Projection("EPSG:900913");
    position = new OpenLayers.LonLat(obj.lon, obj.lat).transform(projection, openlayers_projection);
    newPx = this.map.getLayerPxFromLonLat(position);
    this.marker.moveTo(newPx);
    zoom = 14;
    return this.map.setCenter(position, zoom);
  };

  AddView.prototype.address_search = function(e, data) {
    var $input, $ul, html, self, value;
    self = this;
    $ul = $('ul#autocomplete.ui-listview');
    $input = $(data.input);
    value = $input.val();
    html = "";
    $ul.html("");
    window.ul = $ul;
    if (value && value.length > 2) {
      $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
      $ul.listview("refresh");
      return $.ajax({
        url: "http://nominatim.openstreetmap.org/search",
        dataType: 'json',
        crossDomain: true,
        data: {
          q: $input.val(),
          addressdetails: 1,
          format: 'json',
          'accept-language': 'pl',
          countrycodes: 'pl'
        },
        success: function(response, type, rbody) {
          var i, obj, _i, _len;
          self.publishEvent('log:debug', "response from address server " + (JSON.stringify(response)));
          self.response = response;
          i = 0;
          for (_i = 0, _len = response.length; _i < _len; _i++) {
            obj = response[_i];
            html += "<li class='address_suggestion' value=" + i + ">" + obj.display_name + "</li>";
            i++;
          }
          $ul.html(html);
          $ul.listview("refresh");
          return $ul.trigger("updatelayout");
        },
        error: function(error) {
          self.publishEvent('log:error', "no response from address server " + error);
          return self.publishEvent('tell_user', 'Nie można połączyć się z serwerem adresowym');
        }
      });
    }
  };

  AddView.prototype.init_openstreet = function() {
    this.publishEvent('log:info', 'init openstreet map');
    return this.openstreet();
  };

  AddView.prototype.openstreet = function() {
    var icon, lat, layer, lon, lonLat, map, marker, markers, offset, openlayers_projection, projection, size, vlayer, zoom;
    this.publishEvent('log:debug', 'opentstreet called');
    OpenLayers.ImgPath = 'img/';
    $("#openmap").css('height', '400px');
    projection = new OpenLayers.Projection("EPSG:4326");
    openlayers_projection = new OpenLayers.Projection("EPSG:900913");
    lat = 52.05;
    lon = 19.55;
    zoom = 7;
    layer = new OpenLayers.Layer.OSM();
    markers = new OpenLayers.Layer.Markers("Markers", {
      projection: projection,
      displayProjection: projection
    });
    vlayer = new OpenLayers.Layer.Vector("Editable", {
      projection: projection,
      displayProjection: projection
    });
    map = new OpenLayers.Map("openmap", {
      controls: [new OpenLayers.Control.PanZoom(), new OpenLayers.Control.EditingToolbar(vlayer)],
      units: 'km',
      projection: projection,
      displayProjection: projection
    });
    map.addLayers([layer, vlayer, markers]);
    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.OverviewMap());
    map.addControl(new OpenLayers.Control.Attribution());
    lonLat = new OpenLayers.LonLat(lon, lat).transform(projection, map.getProjectionObject());
    map.setCenter(lonLat, zoom);
    size = new OpenLayers.Size(21, 25);
    offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
    marker = new OpenLayers.Marker(new OpenLayers.LonLat(0, 0).transform(projection), icon);
    markers.addMarker(marker);
    map.events.register("click", map, function(e) {
      var new_position, opx;
      opx = map.getLayerPxFromViewPortPx(e.xy);
      lonLat = map.getLonLatFromPixel(e.xy);
      marker.map = map;
      marker.moveTo(opx);
      new_position = marker.lonlat.transform(openlayers_projection, projection);
      $("[name='lat']").val(new_position.lat);
      return $("[name='lon']").val(new_position.lon);
    });
    this.map = map;
    return this.marker = marker;
  };

  AddView.prototype.render = function() {
    var $bt, base_template;
    AddView.__super__.render.apply(this, arguments);
    this.get_form();
    base_template = this.form.template();
    $bt = $(base_template);
    $bt.find('.ui-grid-a').remove();
    window.bt = $bt;
    this.$el.append($bt);
    return this.publishEvent('log:info', 'view: edit-view RenderEnd()');
  };

  AddView.prototype.render_subview = function(tab_id) {
    var $temp, current_category_id, current_form_name;
    if (tab_id == null) {
      tab_id = 'tab_1';
    }
    this.publishEvent('log:info', "render sub_view " + tab_id);
    if (__indexOf.call(this.rendered_tabs, tab_id) < 0) {
      $temp = $(this.form.el).find("#" + tab_id);
      console.log('---> ', this.form.el, $temp, tab_id);
      window.form = this.form;
      this.subview(tab_id, new TabView({
        container: this.el,
        template: $temp,
        id: tab_id
      }));
      this.subview(tab_id).render();
      if (tab_id === 'tab_2') {
        this.init_openstreet();
      }
      if (tab_id === 'tab_6') {
        this.init_events();
        this.init_uploader();
        this.init_sortable();
      }
      if (tab_id === 'tab_1') {
        current_form_name = this.form_name.substring(0, this.form_name.length - 5);
        current_category_id = this.categories[current_form_name];
        $("[name='category']").val(current_category_id);
      }
      this.publishEvent('jqm_refersh:render');
      return this.rendered_tabs.push(tab_id);
    }
  };

  AddView.prototype.attach = function() {
    AddView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', "listing-add attach");
    return this.render_subview();
  };

  return AddView;

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
      $('#page').enhanceWithin();
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
          'user_pass': _this.pass
        });
        _this.model.set({
          'company_name': _this.user.split('@')[1]
        });
        _this.model.update_db();
        $('#first-name-placeholder').text(_this.model.get('first_name') || _this.model.get('username'));
        $('#bon-config-link').attr('href', "/biura/" + (_this.model.get('company_id')));
        $('#agent-config-link').attr('href', "/agenci/" + (_this.model.get('id')));
        $('#login').popup('close');
        return Chaplin.utils.redirectTo({
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
    this.publishEvent('log:info', 'view: login afterRender()');
    return LoginView.__super__.attach.apply(this, arguments);
  };

  return LoginView;

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

;require.register("views/templates/agent_form", function(exports, require, module) {
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
    
      __out.push('  <form>\n  <div class=\'ui-grid-a\'>\n  <div class=\'ui-block-a\'>\n  <h4>');
    
      __out.push(__sanitize(this.heading));
    
      __out.push('</h4>\n  <div data-fields="first_name"> </div>\n  <div data-fields="surname"> </div>\n  <div data-fields="username"> </div>\n  <div data-fields="password"> </div>\n  <div data-fields="email"> </div>\n  <div data-fields="licence_number"> </div>\n  <div data-fields="phone_primary"> </div>\n  <div data-fields="phone_secondary"> </div>\n  <div data-fields="gg"> </div>\n  <div data-fields="skype"> </div>\n</div>\n  <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n  <h4>Ustawienia</h4>\n  <div data-fields="branch"> </div>\n  <div data-fields="agent_type"> </div>\n  <div data-fields="agent_boss"> </div>\n  ');
    
      if (this.is_admin) {
        __out.push('\n  <div data-fields="is_active"> </div>\n  <div data-fields="is_admin"> </div>\n  ');
      }
    
      __out.push('\n  <div id=\'avatar\'>\n  <a class="ui-btn">dodaj awatar</a>\n  </div>\n  ');
    
      if (this.can_edit) {
        __out.push('\n    ');
        if (this.mode === 'add') {
          __out.push('\n        <a id=\'agent-add-refresh\' class="ui-btn ui-btn-inline ui-icon-recycle ui-btn-icon-right">Wyczyść</a>\n        <a id="agent-add-save" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Zapisz</a>\n    ');
        }
        __out.push('\n    ');
        if (this.mode === 'edit') {
          __out.push('\n        <a id="agent-edit-update" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Uaktualnij</a>\n        ');
          if (this.is_admin) {
            __out.push('\n            <a id="agent-edit-delete" class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-right">Skasuj</a>\n        ');
          }
          __out.push('\n    ');
        }
        __out.push('\n  ');
      }
    
      __out.push('\n</div>\n</div>\n  </form>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/agent_list_view", function(exports, require, module) {
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
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n                <a href=\'/agenci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                </select>\n                <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n                <select name="select-filter" id="select-filter">\n                    <option selected disabled>Filtr</option>\n                    <option value="">Wszyscy</option>\n                    <option value="1">Pośrednik</option>\n                    <option value="2">Administrator nieruchomości</option>\n                    <option value="3">Menadzer</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="agent-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th width="2%"> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th>Oddział&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Login&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Aktywny&nbsp;&nbsp;</th>\n         <th data-priority="6">Admin&nbsp;&nbsp;</th>\n         <th data-priority="6">Typ&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td width="2%"> <label> <input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true"  type="checkbox"> </label> </td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['id']));
        __out.push('</a></td>\n         <td>');
        __out.push(__sanitize(item['branch']));
        __out.push('</td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['first_name']));
        __out.push('</a></td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['surname']));
        __out.push('</a></td>\n         <td>');
        __out.push(__sanitize(item['username']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['email']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['phone']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['is_active_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['is_admin_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent_type_func']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n\n\n');
    
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
    
      __out.push('        <!-- this is REGIONS ONLY -->\n        <div id=\'header-region\' >\n        </div><!-- header -->\n\n        <div id=\'content-region\'>\n        </div><!-- content -->\n\n        <div id=\'footer-region\' >\n        </div><!-- footer -->\n\n\n        <div id="info-region">\n        </div><!-- info-region -->\n        <div id="login-region">\n        </div><!-- info-region -->\n\n        <div id="confirm-region">\n        </div><!-- info-region -->\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/bon_edit_form", function(exports, require, module) {
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
    
      __out.push('  <form>\n  <h4>');
    
      __out.push(__sanitize(this.heading));
    
      __out.push('</h4>\n  <div data-fields="name"> </div>\n  <div data-fields="website"> </div>\n  <div data-fields="province"> </div>\n  <div data-fields="town"> </div>\n  <div data-fields="street"> </div>\n  <div data-fields="postcode"> </div>\n  <div data-fields="nip"> </div>\n  <div data-fields="regon"> </div>\n  <div data-fields="email"> </div>\n  <div data-fields="phone"> </div>\n  ');
    
      if (this.can_edit) {
        __out.push('\n    ');
        if (this.mode === 'edit') {
          __out.push('\n        <a id="bon-edit-update" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Uaktualnij</a>\n        <a id="bon-edit-delete" class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-right">Usuń konto!</a>\n    ');
        }
        __out.push('\n  ');
      }
    
      __out.push('\n  </form>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/branch_form", function(exports, require, module) {
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
    
      __out.push('  <div class=\'ui-grid-a\'>\n  <div class=\'ui-block-a\'>\n  <form>\n  <h4>');
    
      __out.push(__sanitize(this.heading));
    
      __out.push('</h4>\n  <div data-fields="name"> </div>\n  <div data-fields="slug"> </div>\n  <div data-fields="email"> </div>\n  <div data-fields="phone"> </div>\n  <div data-fields="fax"> </div>\n  <div data-fields="nip"> </div>\n  <div data-fields="regon"> </div>\n</div>\n<div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n  <div data-fields="website"> </div>\n  <div data-fields="province"> </div>\n  <div data-fields="town"> </div>\n  <div data-fields="street"> </div>\n  <div data-fields="postcode"> </div>\n  <div data-fields="is_main"> </div>\n  ');
    
      if (this.is_admin) {
        __out.push('\n    ');
        if (this.mode === 'add') {
          __out.push('\n    <a id="branch-add-refresh" href=\'/oddzialy/dodaj\' class="ui-btn ui-btn-inline ui-icon-recycle ui-btn-icon-right">Wyczyść</a>\n    <a id="branch-add-save" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Dodaj</a>\n    ');
        }
        __out.push('\n    ');
        if (this.mode === 'edit') {
          __out.push('\n    <a id="branch-edit-update" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Uaktualnij</a>\n    <a id="branch-edit-delete" class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-right">Skasuj</a>\n    ');
        }
        __out.push('\n  ');
      }
    
      __out.push('\n  </form>\n</div>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/branch_list_view", function(exports, require, module) {
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
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n                <a href=\'/oddzialy/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj  ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th data-priority="2">Agent&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwa&nbsp;&nbsp;</th>\n         <th data-priority="2">Identyfikator&nbsp;&nbsp;</th>\n         <th data-priority="2">WWW&nbsp;&nbsp;</th>\n         <th data-priority="5">Tel&nbsp;&nbsp;</th>\n         <th data-priority="4">Email&nbsp;&nbsp;</th>\n         <th data-priority="6">Miasto&nbsp;&nbsp;</th>\n         <th data-priority="6">Nip&nbsp;&nbsp;</th>\n         <th data-priority="6">Główny&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n       <tr>\n         <td> <label> <input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true"  type="checkbox"> </label> </td>\n         <td>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent']));
        __out.push('</td>\n         <td><a href=\'/oddzialy/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['name']));
        __out.push('</a></td>\n         <td><a href=\'/oddzialy/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['slug']));
        __out.push('</a></td>\n         <td>');
        __out.push(__sanitize(item['website']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['phone']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['email']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['town']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['nip']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['is_main_func']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n\n\n');
    
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
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n                <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                    <option value="drukuj" disabled>Drukuj</option>\n                    <option value="eksport" disabled>Eksport do pliku</option>\n                </select>\n                <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n                <select name="select-filter" id="select-filter">\n                    <option selected disabled>Filtr</option>\n                    <option value="">Wszyscy</option>\n                    <option value="1">Kupujący</option>\n                    <option value="2">Sprzedający</option>\n                    <option value="3">Najemca</option>\n                    <option value="4">Wynajmujący</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Firma&nbsp;&nbsp;</th>\n         <th data-priority="6">Adres&nbsp;&nbsp;</th>\n         <th data-priority="6">Budżet&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td><label><input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true" type="checkbox"></label></td>\n         <td>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent']));
        __out.push('</td>\n         <td><a href=\'/klienci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['first_name']));
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

;require.register("views/templates/client_public_list_view", function(exports, require, module) {
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
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n                <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                    <option value="drukuj" disabled>Drukuj</option>\n                    <option value="eksport" disabled>Eksport do pliku</option>\n                </select>\n                <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n                <select name="select-filter" id="select-filter">\n                    <option selected disabled>Filtr</option>\n                    <option value="">Wszyscy</option>\n                    <option value="1">Kupujący</option>\n                    <option value="2">Sprzedający</option>\n                    <option value="3">Najemca</option>\n                    <option value="4">Wynajmujący</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Firma&nbsp;&nbsp;</th>\n         <th data-priority="6">Adres&nbsp;&nbsp;</th>\n         <th data-priority="6">Budżet&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
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
        __out.push('</td>\n         <td><a href=\'/klienci-wspolni/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['first_name']));
        __out.push('</a></td>\n         <td><a href=\'/klienci-wspolni/');
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

;require.register("views/templates/flat_rent_list_view", function(exports, require, module) {
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
    
      __out.push('<div class="ui-grid-a">\n\t<div class="ui-block-a">\n        <form>\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n                <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                    <option value="drukuj" disabled>Drukuj</option>\n                    <option value="eksport" disabled>Eksport do pliku</option>\n                </select>\n                <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n                <select name="select-filter" id="select-filter">\n                    <option selected disabled>Filtr</option>\n                    <option value="">Wszyscy</option>\n                    <option value="1">Kupujący</option>\n                    <option value="2">Sprzedający</option>\n                    <option value="3">Najemca</option>\n                    <option value="4">Wynajmujący</option>\n                </select>\n            </fieldset>\n        </form>\n    </div>\n\n\t<div class="ui-block-b">\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Szukaj ofert ... " />\n\t</div>\n</div><!-- /grid-b -->\n\n<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th>ID</th>\n         <th>Zdjęcie&nbsp;&nbsp;</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Lokalizacja&nbsp;&nbsp;</th>\n         <th data-priority="2">Klient&nbsp;&nbsp;</th>\n         <th data-priority="2">Cena&nbsp;&nbsp;</th>\n         <th data-priority="4">Pok.&nbsp;&nbsp;</th>\n         <th data-priority="5">Pow. całkowita&nbsp;&nbsp;</th>\n         <th data-priority="6">Data wprowadzenia&nbsp;&nbsp;</th>\n         <th data-priority="6">Rok budowy&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td><label><input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true" type="checkbox"></label></td>\n         <td>');
        __out.push(item['thumbnail_func']);
        __out.push('</td>\n         <td><a href=\'/oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent']));
        __out.push('</td>\n         <td><a href=\'/oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['town']));
        __out.push(',');
        __out.push(__sanitize(item['street']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['client']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['cena']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['ilosc_pokoi']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['powierzchnia_calkowita']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['date_created']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['rok_budowy']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n\n\n');
    
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

;require.register("views/templates/footer_edit", function(exports, require, module) {
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
    
      __out.push(' <div data-role="navbar">\n        <ul>\n            <li><button id="delete-button" class="ui-btn ui-btn-icon-top ui-icon-delete">Usuń</button></li>\n            <li><button id="save-button" class="ui-btn ui-btn-icon-top ui-icon-check" >Zapisz</button></li>\n            <li><button id="save-and-add-button" class="ui-btn ui-btn-icon-top ui-icon-forward">Zapisz i dodaj następny</button></li>\n        </ul>\n    </div><!-- /navbar -->\n');
    
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

;require.register("views/templates/footer_list", function(exports, require, module) {
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
    
      __out.push('    <a href=\'#left-panel\' data-icon=\'grid\' data-theme="b">Menu</a>\n    <h1>Mobilny Pośrednik</h1>\n\n    <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">\n        <button data-rel="popup" data-transition="pop" data-iconpos="notext" id=\'info-btn\' data-position-to="origin" class="ui-btn ui-btn-b ui-btn-inline ui-icon-info ui-btn-icon-notext">Icon only</button>\n        <button id=\'first-name-placeholder\' class="ui-btn ui-btn-b ui-btn-icon-right ui-icon-power"></button>\n    </div>\n');
    
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

;require.register("views/templates/iframe", function(exports, require, module) {
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
    
      __out.push('<h4>');
    
      __out.push(__sanitize(this.title));
    
      __out.push('</h4>\n<iframe src="');
    
      __out.push(__sanitize(this.url));
    
      __out.push('" width=\'');
    
      __out.push(__sanitize(this.width));
    
      __out.push('px\' height=\'');
    
      __out.push(__sanitize(this.height));
    
      __out.push('px\'></iframe>\n');
    
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
    
      __out.push('<!-- ##################################  PANEL -->\n\n\t\t\t\t\t<ul data-role="listview" >\n\t\t\t\t\t\t<li data-icon="delete" > <a href="#header" data-rel="close">Zamknij menu</a> </li>\n\t\t\t\t\t\t<li data-icon="home" > <a href="/" >Początek</a> </li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="eye" data-expanded-icon="arrow-d">\n                    <h4>Przeglądaj oferty</h4>\n                    <ul data-role="listview" >\n                        <li><a href="/oferty?category=flat_rent"    >Mieszkania Wynajem</a></li>\n                        <li><a href="/oferty?category=flat_sell"    >Mieszkania Sprzedaż</a></li>\n                        <li><a href="/oferty?category=house_rent"    >Domy Wynajem</a></li>\n                        <li><a href="/oferty?category=house_sell"    >Domy Sprzedaż</a></li>\n                        <li><a href="/oferty?category=land_rent"    >Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty?category=land_sell"    >Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty?category=commercial_rent"    >Lokale Wynajem</a></li>\n                        <li><a href="/oferty?category=commercial_sell"    >Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty?category=warehose_rent"    >Lokale użytkowe Wynajem</a></li>\n                        <li><a href="/oferty?category=warehouse_sell"   >Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="/oferty?category=object_rent"   >Obiekty Wynajem</a></li>\n                        <li><a href="/oferty?category=object_sell"   >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n                <div data-role="collapsible" data-inset="false"  data-collapsed-icon="plus" data-expanded-icon="arrow-d">\n                    <h4>Dodaj ofertę</h4>\n                    <ul data-role="listview">\n                        <li><a href="/oferty/dodaj?type=flat_rent"    >Mieszkania Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=flat_sell"    >Mieszkania Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=house_rent"    >Domy Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=house_sell"    >Domy Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=land_rent"    >Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty/dodaj?type=land_sell"    >Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=commercial_rent"    >Lokale Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=commercial_sell"    >Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=warehose_rent"    >Lokale użytkowe Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=warehouse_sell"   >Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=object_rent"   >Obiekty Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=object_sell"   >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="tag" data-expanded-icon="arrow-d">\n                    <h3>Etykiety</h3>\n                    <ul data-role="listview" >\n                        <li ><a href="" >Dodaj Etykietę</a></li>\n                        <li><a href="/oferty?status=4" >Robocze<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=3" >Archiwalne<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=1" >Nieaktywna<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=5" >Sprzedana<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=6" >Wynajęta<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=7" >Umowa przedstępna<span class=\'ui-li-count\'>34</span></a> </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="phone" data-expanded-icon="arrow-d">\n                    <h3>Kontrahenci</h3>\n                    <ul data-role="listview" >\n                        <li ><a href="/klienci/dodaj" >Dodaj Kontrahenta</a></li>\n                        <li ><a href="/klienci" >Moi</a></li>\n                        <li ><a href="/klienci-wspolni" >Wspólni</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="gear" data-expanded-icon="arrow-d">\n                    <h3>Ustawienia</h3>\n                    <ul data-role="listview" >\n                        <li ><a id=\'bon-config-link\' href="" >Dane Biura Nieruchomości</a></li>\n                        <li ><a id=\'agent-config-link\' href="" >Dane Profilu</a></li>\n                        <li ><a href="/agenci" >Agenci</a></li>\n                        <li ><a href="/oddzialy" >Oddziały</a></li>\n                        <li ><a href="" >Logo</a></li>\n                        <li ><a href="" >Watermark</a></li>\n                        <li ><a href="" >Importy</a></li>\n                        <li ><a href="" >Eksporty</a></li>\n                        <li><a href="" >Portale zewnętrzne</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="search" data-expanded-icon="arrow-d">\n                    <h3>Wyszukiwania</h3>\n                    <ul data-role="listview">\n                        <li><a href="" >Wyszukiwanie Zaawansowane</a></li>\n                        <li data-role=\'list-divider\' >Portale Zewnętrzne </li>\n                        <li><a href="" >Gumtree</a></li>\n                        <li><a href="" >aleGratka</a></li>\n                        <li><a href="" >Tablica</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="location" data-expanded-icon="arrow-d">\n                    <h3>Narzędzia</h3>\n                    <ul data-role="listview" >\n                        <li><a href="/iframe/kw" >Księgi wieczyste</a></li>\n                        <li><a href="/iframe/geo" >Geoportal</a></li>\n                        <li><a href="/iframe/geodz">Wyszukaj działkę</a></li>\n                        <li><a href="/iframe/calendar">Kalendarz</a></li>\n                        <li><a href="http://planmieszkania.pl/" target="_blank">Plan mieszkania</a></li>\n                        <!--\n                        <li><a href="http://ekw.ms.gov.pl/pdcbdkw/pdcbdkw.html" target="_blank" >Księgi wieczyste</a></li>\n                        <li><a href="http://maps.geoportal.gov.pl/webclient/" target="_blank" >Geoportal</a></li>\n                        <li><a href="http://mapy.geoportal.gov.pl/imap/?gpmap=gp0&actions=acShowWgPlot" target="_blank" >Wyszukaj działkę</a></li>\n                        -->\n                        <li><a href="http://www.nieruchomosci.222.pl/kalkulator_oplat.html" >Kalkulator kosztów</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n\n<!-- ##################################  PANEL -->\n');
    
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

;require.register("views/templates/property_form", function(exports, require, module) {
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
    
      __out.push('<form>\n   \t<div data-role="tabs">\n\t\t\t<div data-role="navbar">\n\t\t\t\t<ul>\n\t\t\t      <li><a  href="#tab1"  data-ajax="false">Oferta</a></li>\n\t\t\t      <li><a  href="#tab2"  data-ajax="false">Nieruchomość</a></li>\n\t\t\t      <li><a  href="#tab3"  data-ajax="false">Pomieszczenia</a></li>\n\t\t\t      <li><a  href="#tab4"  data-ajax="false">Adres</a></li>\n\t\t\t      <li><a  href="#tab5"  data-ajax="false">Pozostałe</a></li>\n\t\t\t      <li><a  href="#tab6"  data-ajax="false">Zdjęcia</a></li>\n\t\t\t    </ul>\n\t\t\t</div>\n\n            <div id="tab1" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                        <div data-fields="tytul"></div>\n                        <div data-fields="dodatkowy_id"></div>\n                        <div data-fields="powierzchnia_calkowita"></div>\n                        <div data-fields="opis"></div>\n                        <div data-fields="opis_angielski"></div>\n                        <div data-fields="opis_prywatny"></div>\n                        <div data-fields="opis_skrocony"></div>\n                        <div data-fields="prowizja"></div>\n                        <div data-fields="rynek"></div>\n                        <div data-fields="rodzaj_wlasnosci"></div>\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                        <div data-fields="termin_wydania"></div>\n                        <div data-fields="stan_mieszkania"></div>\n                        <div data-fields="czynsz"></div>\n                        <div data-fields="liczba_pokoi"></div>\n                        <div data-fields="klucze"></div>\n                        <div data-fields="cena"></div>\n                        <div data-fields="data_aktualizacji"></div>\n                        <div data-fields="data_wprowadzenia"></div>\n                        <div data-fields="typ_kaucji"></div>\n                        <div data-fields="bez_prowizji"></div>\n                        <div data-fields="rynek_pierwotny"></div>\n                        <div data-fields="inwestycja"></div>\n                        <div data-fields="wylacznosc"></div>\n                        <div data-fields="podstawa_nabycia"></div>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n\n            <div id="tab2" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                        <div data-fields="piwnica"></div>\n                        <div data-fields="rodzaj_budynku"></div>\n                        <div data-fields="material_budynku"></div>\n                        <div data-fields="garaz"></div>\n                        <div data-fields="udogodnienia"></div>\n                        <div data-fields="balkon"></div>\n                        <div data-fields="parking"></div>\n                        <div data-fields="wyposazenie"></div>\n                        <div data-fields="media"></div>\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                        <div data-fields="ilosc_poziomow"></div>\n                        <div data-fields="pietro"></div>\n                        <div data-fields="rok_budowy"></div>\n                        <div data-fields="liczba_pieter"></div>\n                        <div data-fields="przeznaczenie"></div>\n                        <div data-fields="okna"></div>\n                        <div data-fields="ogrzewanie"></div>\n                        <div data-fields="ogrodek"></div>\n                        <div data-fields="komorka"></div>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n\n            <div id="tab3" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                        <div data-fields="liczba_lazienek"></div>\n                        <div data-fields="powierzchnia_wc"></div>\n                        <div data-fields="powierzchnia_piwnicy"></div>\n                        <div data-fields="powierzchnia_balkonu"></div>\n                        <div data-fields="powierzchnia_uzytkowa"></div>\n                        <div data-fields="dwupoziomowe"></div>\n                        <div data-fields="ekspozycja_okien"></div>\n                        <div data-fields="podlogi"></div>\n                        <div data-fields="umeblowanie"></div>\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                        <div data-fields="stan_instalacji"></div>\n                        <div data-fields="sciany_lazienek"></div>\n                        <div data-fields="wyposazenie_kuchni"></div>\n                        <div data-fields="goraca_woda"></div>\n                        <div data-fields="stan_lazienek"></div>\n                        <div data-fields="lazienka"></div>\n                        <div data-fields="powierzchnia_lazienek"></div>\n                        <div data-fields="powierzchnia_kuchni"></div>\n                        <div data-fields="kuchnia"></div>\n                        <div data-fields="liczba_wc"></div>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n\n            <div id="tab4" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                    adres\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n\n            <div id="tab5" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                        <div data-fields="typ_kaucji"></div>\n                        <div data-fields="komunikacja"></div>\n                        <div data-fields="video"></div>\n                        <div data-fields="odleglosc_od_jeziora"></div>\n                        <div data-fields="odleglosc_od_szkoly"></div>\n                        <div data-fields="tereny_rekreacyjne"></div>\n                        <div data-fields="odleglosc_od_centrum"></div>\n                        <div data-fields="odleglosc_od_miasta"></div>\n                        <div data-fields="odleglosc_od_stacji"></div>\n                        <div data-fields="data_podpisania_umowy"></div>\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                        <div data-fields="odleglosc_od_szosy"></div>\n                        <div data-fields="w_poblizu"></div>\n                        <div data-fields="glosnosc"></div>\n                        <div data-fields="uklad_mieszkania"></div>\n                        <div data-fields="zabezpieczenia"></div>\n                        <div data-fields="odleglosc_od_przedszkola"></div>\n                        <div data-fields="dodatkowe_oplaty"></div>\n                        <div data-fields="rodzaj_mieszkania"></div>\n                        <div data-fields="odleglosc_od_przystanku"></div>\n                        <div data-fields="powierzchnia_biurowa"></div>\n                        <div data-fields="adres_wewnetrzny"></div>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n\n            <div id="tab6" class="ui-content">\n                <div class=\'ui-grid-a\'>\n                    <div class=\'ui-block-a\'>\n                    zdjęcia\n                    </div><!-- block-a -->\n                    <div class=\'ui-block-b ui-content\' style=\'padding-left:10px\'>\n                    </div><!-- block-b -->\n                    </div><!-- grid-a -->\n            </div><!-- tab -->\n</div>\n\n\n\n  ');
    
      if (this.is_admin) {
        __out.push('\n    ');
        if (this.mode === 'add') {
          __out.push('\n    <a id="branch-add-refresh" href=\'/oddzialy/dodaj\' class="ui-btn ui-btn-inline ui-icon-recycle ui-btn-icon-right">Wyczyść</a>\n    <a id="branch-add-save" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Dodaj</a>\n    ');
        }
        __out.push('\n    ');
        if (this.mode === 'edit') {
          __out.push('\n    <a id="branch-edit-update" class="ui-btn ui-btn-inline ui-icon-check ui-btn-b ui-btn-icon-right" type=\'submit\'>Uaktualnij</a>\n    <a id="branch-edit-delete" class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-right">Skasuj</a>\n    ');
        }
        __out.push('\n  ');
      }
    
      __out.push('\n\n</form>\n\n\n\n\n\n\n\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/upload", function(exports, require, module) {
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
    
      __out.push('<script type="text/template" id="qq-template">\n<div class="qq-uploader-selector qq-uploader">\n            <div class="qq-upload-drop-area-selector qq-upload-drop-area" qq-hide-dropzone>\n                <span>Wrzuć pliki na serwer</span>\n            </div>\n            <div class="qq-upload-button-selector qq-upload-button">\n                <a class=\'ui-btn ui-btn-b\'>Dodaj pliki</a>\n            </div>\n            <span class="qq-drop-processing-selector qq-drop-processing">\n                <span>Przetwarzam pliki...</span>\n                <span class="qq-drop-processing-spinner-selector qq-drop-processing-spinner"></span>\n            </span>\n            <ul class="qq-upload-list-selector qq-upload-list" data-role=\'listview\' data-inset=\'true\'>\n\n                <li>\n                  <div class="qq-progress-bar-container-selector">\n                      <div class="qq-progress-bar-selector qq-progress-bar"></div>\n                  </div>\n                  <span class="qq-upload-spinner-selector qq-upload-spinner"></span>\n                    <img class="qq-thumbnail-selector" qq-max-size="100" qq-server-scale>\n                  <span class="qq-edit-filename-icon-selector qq-edit-filename-icon"></span>\n                  <span class="qq-upload-file-selector qq-upload-file"></span>\n                  <input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text">\n                  <span class="qq-upload-size-selector qq-upload-size"></span>\n                  <a class="qq-upload-cancel-selector qq-upload-cancel" href="#">Zaniechaj</a>\n                  <a class="qq-upload-retry-selector qq-upload-retry" href="#">Spróbuj ponownie</a>\n                  <a class="qq-upload-delete-selector qq-upload-delete" href="#">Usuń</a>\n                  <span class="qq-upload-status-text-selector qq-upload-status-text"></span>\n                </li>\n            </ul>\n</div>\n</script>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;
//# sourceMappingURL=app.js.map