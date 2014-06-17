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
var Application, Layout, RefreshController, SingleRefreshController, StructureController, mediator, routes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StructureController = require('controllers/structure-controller');

RefreshController = require('controllers/refresh-controller');

SingleRefreshController = require('controllers/single-refresh-controller');

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
    new RefreshController();
    return new SingleRefreshController();
  };

  Application.prototype.initMediator = function() {
    var _this = this;
    mediator.models = {};
    mediator.collections = {};
    mediator.schemas = {};
    mediator.last_query = {};
    mediator.info = [];
    mediator.viewed = [];
    mediator.server_url = 'http://localhost:8080/';
    mediator.upload_url = "" + mediator.server_url + "v1/pliki";
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
          region: 'content',
          controller: 'agent_controller'
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
    console.log(params, route, options);
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
              _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), _this.model.get('id'), mediator.models.user.get('id'));
              console.log('-------', _this.can_edit);
              console.log(mediator.models.user.get('is_admin'), _this.model.get('id'), mediator.models.user.get('id'));
              _this.edit_type = '';
              if (mediator.models.user.get('id') === _this.model.get('id')) {
                _this.edit_type = 'add';
              }
              _this.schema = localStorage.getObject('agent_schema');
              _this.model.schema = _.clone(_this.schema);
              _this.publishEvent('tell_viewed', _this.model.get_url());
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
          console.log(mediator.models.user.get('is_admin'), _this.model.get('id'), mediator.models.user.get('id'));
          _this.edit_type = '';
          if (mediator.models.user.get('id') === _this.model.get('id')) {
            _this.edit_type = 'add';
          }
          _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), _this.model.get('id'), mediator.models.user.get('id'));
          _this.schema = localStorage.getObject('agent_schema');
          _this.model.schema = _.clone(_this.schema);
          _this.publishEvent('tell_viewed', _this.model.get_url());
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
  var hash, params, request, url, _ref;
  $.mobile.loading('show');
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
  request = _sync.call(this, method, model, options);
  request.done(function(msg) {
    return $.mobile.loading('hide');
  });
  return request.fail(function(jqXHR, textStatus) {
    console.log(jqXHR, textStatus);
    $.mobile.loading('hide');
    return this.publishEvent('tell_user', "Błąd " + jqXHR + ", " + textStatus);
  });
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
          region: 'content',
          controller: 'branch_controller'
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
    this.publishEvent('tell_viewed', this.model.get_url());
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
    this.publishEvent('tell_viewed', this.model.get_url());
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

;require.register("controllers/export-controller", function(exports, require, module) {
var Collection, Controller, ExportController, ListView, Model, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/export-list-view');

View = require('views/export-view');

Collection = require('models/export-collection');

Model = require('models/export-model');

mediator = require('mediator');

module.exports = ExportController = (function(_super) {

  __extends(ExportController, _super);

  function ExportController() {
    return ExportController.__super__.constructor.apply(this, arguments);
  }

  ExportController.prototype.list = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in client list controller');
    mediator.collections.exports = new Collection;
    return mediator.collections.exports.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę eksportów ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.exports,
          template: 'export_list_view',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  ExportController.prototype.add = function(params, route, options) {
    this.publishEvent('log:info', 'in export controller');
    mediator.models["export"] = new Model;
    this.schema = localStorage.getObject('export_schema');
    this.model = mediator.models["export"];
    this.model.schema = _.clone(this.schema);
    return this.view = new View({
      form_name: 'export_form',
      model: this.model,
      can_edit: true,
      edit_type: 'add',
      region: 'content'
    });
  };

  ExportController.prototype.show = function(params, route, options) {
    this.publishEvent('log:info', 'in export show controller');
    if (!_.isObject(mediator.collections.exports.get(params.id))) {
      this.redirectTo({
        '/eksporty': '/eksporty'
      });
    }
    this.schema = localStorage.getObject('export_schema');
    this.model = mediator.collections.exports.get(params.id);
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
    this.publishEvent('tell_viewed', this.model.get_url());
    return this.view = new View({
      form_name: 'export_form',
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  return ExportController;

})(Controller);

});

;require.register("controllers/graphic-controller", function(exports, require, module) {
var Collection, Controller, GraphicController, ListView, Model, View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

ListView = require('views/graphic-list-view');

View = require('views/graphic-view');

Collection = require('models/graphic-collection');

Model = require('models/graphic-model');

mediator = require('mediator');

module.exports = GraphicController = (function(_super) {

  __extends(GraphicController, _super);

  function GraphicController() {
    return GraphicController.__super__.constructor.apply(this, arguments);
  }

  GraphicController.prototype.list = function(params, route, options) {
    var _this = this;
    this.publishEvent('log:info', 'in client list controller');
    mediator.collections.graphics = new Collection;
    return mediator.collections.graphics.fetch({
      data: params,
      beforeSend: function() {
        _this.publishEvent('loading_start');
        return _this.publishEvent('tell_user', 'Ładuje listę grafik ...');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new ListView({
          collection: mediator.collections.graphics,
          template: 'graphic_list_view',
          region: 'content'
        });
      },
      error: function() {
        _this.publishEvent('loading_stop');
        return _this.publishEvent('server_error');
      }
    });
  };

  GraphicController.prototype.add = function(params, route, options) {
    this.publishEvent('log:info', 'in graphic controller');
    mediator.models.graphic = new Model;
    this.schema = localStorage.getObject('graphic_schema');
    this.model = mediator.models.graphic;
    this.model.schema = _.clone(this.schema);
    return this.view = new View({
      form_name: 'graphic_form',
      model: this.model,
      can_edit: true,
      edit_type: 'add',
      region: 'content'
    });
  };

  GraphicController.prototype.show = function(params, route, options) {
    this.publishEvent('log:info', 'in graphic show controller');
    if (!_.isObject(mediator.collections.graphics.get(params.id))) {
      this.redirectTo({
        '/grafiki': '/grafiki'
      });
    }
    this.schema = localStorage.getObject('graphic_schema');
    this.model = mediator.collections.graphics.get(params.id);
    this.model.schema = _.clone(this.schema);
    this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
    this.publishEvent('tell_viewed', this.model.get_url());
    return this.view = new View({
      form_name: 'graphic_form',
      model: this.model,
      can_edit: this.can_edit,
      region: 'content'
    });
  };

  return GraphicController;

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
    mediator.collections.listings.query_add(options.query);
    return mediator.collections.listings.fetch({
      data: mediator.collections.listings.query,
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        return _this.view = new ListView({
          collection: mediator.collections.listings,
          template: "listing_list_view",
          filter: 'status',
          region: 'content',
          listing_type: listing_type,
          controller: 'listing_controller'
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
    var categories, category, form, schema, url, _ref,
      _this = this;
    this.publishEvent('log:info', 'in listing show controller');
    url = "/oferty?" + ($.param(mediator.last_query));
    if (_.isObject((_ref = mediator.collections.listings) != null ? _ref.get(params.id) : void 0)) {
      this.model = mediator.collections.listings.get(params.id);
      categories = _.invert(localStorage.getObject('categories'));
      category = categories[this.model.get('category')];
      form = "" + category + "_form";
      schema = "" + category + "_schema";
      this.schema = localStorage.getObject(schema);
      this.model.schema = _.clone(this.schema);
      this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), this.model.get('agent'), mediator.models.user.get('id'));
      this.publishEvent('tell_viewed', this.model.get_url());
      return this.view = new View({
        form_name: form,
        model: this.model,
        can_edit: this.can_edit,
        region: 'content'
      });
    } else {
      mediator.models.listing = new Model;
      this.model = mediator.models.listing;
      this.model.set('id', params.id);
      return this.model.fetch({
        success: function() {
          _this.publishEvent('log:info', "data with " + params + " fetched ok");
          categories = _.invert(localStorage.getObject('categories'));
          category = categories[_this.model.get('category')];
          form = "" + category + "_form";
          schema = "" + category + "_schema";
          _this.schema = localStorage.getObject(schema);
          _this.model.schema = _.clone(_this.schema);
          _this.can_edit = mediator.can_edit(mediator.models.user.get('is_admin'), _this.model.get('agent'), mediator.models.user.get('id'));
          _this.publishEvent('tell_viewed', _this.model.get_url());
          return _this.view = new View({
            form_name: form,
            model: _this.model,
            can_edit: _this.can_edit,
            region: 'content'
          });
        },
        error: function() {
          return _this.publishEvent('server_error');
        }
      });
    }
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
    return this.subscribeEvent('modelchanged', this.refresh_dependencies);
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
        _this.publishEvent('log:info', "data with " + params.model + "_" + params.type + " fetched ok");
        console.log(_this.model.attributes, _this.model.attributes[params.type]);
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
      }, function(callback) {
        return self.refresh_model('land_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('land_sell/schema', callback);
      }, function(callback) {
        return self.refresh_model('object_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('object_sell/schema', callback);
      }, function(callback) {
        return self.refresh_model('warehouse_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('warehouse_sell/schema', callback);
      }, function(callback) {
        return self.refresh_model('commercial_rent/schema', callback);
      }, function(callback) {
        return self.refresh_model('commercial_sell/schema', callback);
      }
    ]);
  };

  return RefreshController;

})(Controller);

});

;require.register("controllers/single-refresh-controller", function(exports, require, module) {
var Controller, Model, SingleRefreshController, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/auth-controller');

Model = require('models/refresh-model');

mediator = require('mediator');

module.exports = SingleRefreshController = (function(_super) {

  __extends(SingleRefreshController, _super);

  function SingleRefreshController() {
    this.refresh_localstorage = __bind(this.refresh_localstorage, this);
    return SingleRefreshController.__super__.constructor.apply(this, arguments);
  }

  SingleRefreshController.prototype.initialize = function() {
    return this.subscribeEvent('refresh_localstorage', this.refresh_localstorage);
  };

  SingleRefreshController.prototype.refresh_localstorage = function(model) {
    var params,
      _this = this;
    params = {};
    params['model'] = model;
    params['type'] = 'data';
    this.model = new Model;
    return this.model.fetch({
      data: params,
      success: function() {
        _this.publishEvent('log:info', "data with " + params.model + " " + params.type + " fetched ok");
        if (_.isObject(_this.model.attributes[params.model])) {
          return localStorage.setObject("" + params.model, _this.model.attributes[params.model]);
        }
      },
      error: function() {
        return _this.publishEvent('tell_user', 'Brak połączenia z serwerem - dane nie zostały odświerzone');
      }
    });
  };

  return SingleRefreshController;

})(Controller);

});

;require.register("controllers/structure-controller", function(exports, require, module) {
var ConfirmView, Controller, Footer, Header, InfoView, LeftPanelView, ListFooter, NavFooter, PopGenericView, StructureController, StructureView, ViewedView,
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

ViewedView = require('views/viewed-view');

PopGenericView = require('views/popgeneric-view');

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
    edit_footer = ['listing#add', 'listing#show', 'client#add', 'client#show', 'client-public#show', 'branch#add', 'branch#show', 'agent#add', 'agent#show', 'bon#show', 'graphic#add', 'graphic#show', 'export#add', 'export#show'];
    list_footer = ['listing#list', 'client#list', 'client-public#list', 'branch#list', 'agent#list', 'bon#list', 'graphic#list', 'export#list'];
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
    this.compose('viewed', ViewedView, {
      region: 'viewed'
    });
    this.compose('confirm', ConfirmView, {
      region: 'confirm'
    });
    this.compose('popgeneric', PopGenericView, {
      region: 'popgeneric'
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
          return 'admin. nieruch.';
        case 2:
          return 'menadzer';
        case 3:
          return 'IT';
      }
    },
    branch_func: function() {
      if (this.get('branch')) {
        return localStorage.getObject('branches')["" + (this.get('branch'))];
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

  Agent.prototype.module_name = ['agent', 'agenci'];

  Agent.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
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

  Bon.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Bon.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  Bon.prototype.module_name = ['biuro', 'biura'];

  Bon.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
  };

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

  Branch.prototype.module_name = ['oddział', 'oddzialy'];

  Branch.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
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
    var self;
    this.publishEvent('log:info', "--> " + this.module_name[0] + " changed");
    self = this;
    return _.delay(function() {
      self.publishEvent('modelchanged', 'client');
      return self.publishEvent('refresh_localstorage', 'clients');
    }, 30);
  };

  Client.prototype.onAdd = function() {
    return this.publishEvent('log:info', "--> " + this.module_name[0] + " add");
  };

  Client.prototype.onDestroy = function() {
    this.publishEvent('log:info', "--> " + this.module_name[0] + " destroyed");
    return this.publishEvent('modelchanged', 'client');
  };

  Client.prototype.onRemove = function() {
    return this.publishEvent('log:info', "--> " + this.module_name[0] + " removed");
  };

  Client.prototype.module_name = ['klient', 'klienci'];

  Client.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
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

;require.register("models/export-collection", function(exports, require, module) {
var ExportList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/export-model');

module.exports = ExportList = (function(_super) {

  __extends(ExportList, _super);

  function ExportList() {
    return ExportList.__super__.constructor.apply(this, arguments);
  }

  ExportList.prototype.model = Model;

  ExportList.prototype.url = 'http://localhost:8080/v1/eksporty';

  return ExportList;

})(Chaplin.Collection);

});

;require.register("models/export-model", function(exports, require, module) {
var Export, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Export = (function(_super) {

  __extends(Export, _super);

  function Export() {
    return Export.__super__.constructor.apply(this, arguments);
  }

  Export.prototype.urlRoot = 'http://localhost:8080/v1/eksporty';

  Export.prototype.schema = {};

  Export.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Export.prototype.defaults = {
    is_active: '1',
    is_active_func: function() {
      if (this.get('is_active')) {
        return 'tak';
      } else {
        return 'nie';
      }
    },
    branch_func: function() {
      if (this.get('branch')) {
        return localStorage.getObject('branches')["" + (this.get('branch'))];
      }
    },
    date_created_func: function() {
      var _base;
      return typeof (_base = this.get('date_created')).substr === "function" ? _base.substr(0, 10) : void 0;
    },
    next_export_func: function() {
      switch (parseInt(this.get('next_export'))) {
        case 0:
          return 'Pełny';
        case 1:
          return 'Przyrostowy';
      }
    }
  };

  Export.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  Export.prototype.module_name = ['eksport', 'eksporty'];

  Export.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
  };

  Export.prototype.initialize = function() {
    this.on('change:name', this.onChange);
    this.on('add', this.onAdd);
    this.on('remove', this.onRemove);
    return this.on('destroy', this.onDestory);
  };

  Export.prototype.onChange = function() {
    var self;
    this.publishEvent('log:info', "--> " + this.module_name[0] + " changed");
    self = this;
    return _.delay(function() {
      return self.publishEvent('modelchanged', 'client');
    }, 30);
  };

  Export.prototype.onAdd = function() {
    return this.publishEvent('log:info', "--> " + this.module_name[0] + " add");
  };

  Export.prototype.onDestroy = function() {
    this.publishEvent('log:info', "--> " + this.module_name[0] + " destroyed");
    return this.publishEvent('modelchanged', 'client');
  };

  Export.prototype.onRemove = function() {
    return this.publishEvent('log:info', "--> " + this.module_name[0] + " removed");
  };

  return Export;

})(Chaplin.Model);

});

;require.register("models/graphic-collection", function(exports, require, module) {
var GraphicList, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/graphic-model');

module.exports = GraphicList = (function(_super) {

  __extends(GraphicList, _super);

  function GraphicList() {
    return GraphicList.__super__.constructor.apply(this, arguments);
  }

  GraphicList.prototype.model = Model;

  GraphicList.prototype.url = 'http://localhost:8080/v1/grafiki';

  return GraphicList;

})(Chaplin.Collection);

});

;require.register("models/graphic-model", function(exports, require, module) {
var Graphic, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('mediator');

module.exports = Graphic = (function(_super) {

  __extends(Graphic, _super);

  function Graphic() {
    return Graphic.__super__.constructor.apply(this, arguments);
  }

  Graphic.prototype.urlRoot = 'http://localhost:8080/v1/grafiki';

  Graphic.prototype.schema = {};

  Graphic.prototype.get = function(attr) {
    var value;
    value = Backbone.Model.prototype.get.call(this, attr);
    if (_.isFunction(value)) {
      return value.call(this);
    } else {
      return value;
    }
  };

  Graphic.prototype.defaults = {
    is_active: '1',
    opacity: '100',
    is_active_func: function() {
      if (this.get('is_active')) {
        return 'tak';
      } else {
        return 'nie';
      }
    },
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
    },
    branch_func: function() {
      if (this.get('branch')) {
        return localStorage.getObject('branches')["" + (this.get('branch'))];
      }
    },
    image_type_func: function() {
      switch (parseInt(this.get('image_type'))) {
        case 0:
          return 'logo';
        case 1:
          return 'znak wodny';
      }
    },
    position_func: function() {
      switch (parseInt(this.get('position'))) {
        case 0:
          return 'lewy górny';
        case 1:
          return 'prawy górny';
        case 2:
          return 'lewy dolny';
        case 3:
          return 'prawy dolny';
      }
    }
  };

  Graphic.prototype.toJSON = function() {
    var data, json;
    data = {};
    json = Backbone.Model.prototype.toJSON.call(this);
    _.each(json, function(value, key) {
      return data[key] = this.get(key);
    }, this);
    return data;
  };

  Graphic.prototype.module_name = ['grafika', 'grafiki'];

  Graphic.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
  };

  return Graphic;

})(Chaplin.Model);

});

;require.register("models/listing-collection", function(exports, require, module) {
var ListingList, Model, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/listing-model');

mediator = require('mediator');

module.exports = ListingList = (function(_super) {

  __extends(ListingList, _super);

  function ListingList() {
    return ListingList.__super__.constructor.apply(this, arguments);
  }

  ListingList.prototype.initialize = function() {
    this.query = {};
    return this.query_add(this.query_defaults());
  };

  ListingList.prototype.model = Model;

  ListingList.prototype.url = 'http://localhost:8080/v1/oferty';

  ListingList.prototype.query_defaults = function() {
    return {
      branch: mediator.models.user.get('branch_id'),
      agent: mediator.models.user.get('id'),
      status: 1
    };
  };

  ListingList.prototype.query_add = function(new_obj) {
    return _.extend(this.query, new_obj);
  };

  ListingList.prototype.query_remove = function(key) {
    return this.query = _.omit(this.query, key);
  };

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
    },
    date_created_func: function() {
      var _base;
      return typeof (_base = this.get('date_created')).substr === "function" ? _base.substr(0, 10) : void 0;
    },
    date_modyfied_func: function() {
      var _base;
      return typeof (_base = this.get('date_modyfied')).substr === "function" ? _base.substr(0, 10) : void 0;
    },
    date_updated_func: function() {
      var _base;
      return typeof (_base = this.get('date_updated')).substr === "function" ? _base.substr(0, 10) : void 0;
    },
    waluta_func: function() {
      return localStorage.getObject('choices')["" + (this.get('waluta'))];
    },
    agent_func: function() {
      return localStorage.getObject('agents')["" + (this.get('agent'))];
    },
    client_func: function() {
      return localStorage.getObject('clients')["" + (this.get('client'))];
    },
    rynek_func: function() {
      return localStorage.getObject('choices')["" + (this.get('rynek'))];
    },
    wylacznosc_func: function() {
      if (this.get('wylacznosc')) {
        return 'tak';
      } else {
        return 'nie';
      }
    },
    category_func: function() {
      return localStorage.getObject('categories_full')["" + (this.get('category'))];
    },
    status_func: function() {
      switch (this.get('status')) {
        case 0:
          return 'nieaktywna';
        case 1:
          return 'aktywna';
        case 2:
          return 'archiwalna';
        case 3:
          return 'robocza';
        case 4:
          return 'sprzedana';
        case 5:
          return 'wynajęta';
        case 6:
          return 'umowa przedwstępna';
        case 7:
          return 'usunięta';
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

  Listing.prototype.module_name = ['oferta', 'oferty'];

  Listing.prototype.get_url = function() {
    return "<a href=\'/" + this.module_name[1] + "/" + (this.get('id')) + "\'>" + (this.module_name[0].toUpperCase()) + " #" + (this.get('id')) + "</a>";
  };

  Listing.prototype.initialize = function() {
    this.on('change:agent', this.onChangeAgent);
    this.on('add', this.onAdd);
    this.on('remove', this.onRemove);
    return this.on('destroy', this.onDestory);
  };

  Listing.prototype.onChangeAgent = function(model, attribute) {
    if (!_.isUndefined(model.previous('agent'))) {
      console.log('--> model changed', model, attribute);
      return model.save();
    }
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
    localStorage.setObject('categories_full', this.get('categories_full'));
    localStorage.setObject('choices', this.get('choices'));
    localStorage.setObject('agents', this.get('agents'));
    localStorage.setObject('branches', this.get('branches'));
    localStorage.setObject('clients', this.get('clients'));
    localStorage.setObject('account', this.get('account'));
    localStorage.setObject('latest', this.get('latest'));
    localStorage.setObject('latest_modyfied', this.get('latest_modyfied'));
    localStorage.setObject('update_needed', this.get('update_needed'));
    localStorage.setObject('portals', this.get('portals'));
    return this.set({
      is_logged: true
    });
  };

  return Login;

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
  match('iframe/:template', 'iframe#show');
  match('grafiki', 'graphic#list');
  match('grafiki/dodaj', 'graphic#add');
  match('grafiki/:id', 'graphic#show');
  match('eksporty', 'export#list');
  match('eksporty/dodaj', 'export#add');
  return match('eksporty/:id', 'export#show');
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

    this.back_action = __bind(this.back_action, this);

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
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
          if (_this.model.id === mediator.models.user.get('id') && (_this.model.get(['username']) !== mediator.models.user.get('username') || _this.model.get(['password']) !== mediator.models.user.get('user_pass'))) {
            _this.publishEvent("log:info", "password/username changed relogin required");
            mediator.models.user.clear();
            return Chaplin.utils.redirectTo({
              url: '/login'
            });
          } else {
            return Chaplin.utils.redirectTo({
              url: '/agenci'
            });
          }
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
        _this.publishEvent('tell_user', "Rekord został usunięty");
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

  View.prototype.back_action = function() {
    View.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/agenci'
    });
  };

  View.prototype.attach = function() {
    View.__super__.attach.apply(this, arguments);
    if (mediator.models.user.get('is_admin') === false) {
      return $("[data-fields='is_admin'] select").slider('disable');
    }
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
        _this.publishEvent('tell_user', "Logowanie zakończone.");
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
var View, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/view-helper');

mediator = require('mediator');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.getTemplateFunction = function() {
    return this.template;
  };

  View.prototype.mp_request = function(model, url, type, msg_success, msg_fail) {
    var self,
      _this = this;
    self = this;
    return $.ajax({
      url: url,
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('X-Auth-Token', mediator.gen_token(url));
      },
      type: type,
      success: function(data, textStatus, jqXHR) {
        return self.publishEvent("tell_user", msg_success);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return self.publishEvent("tell_user", msg_fail || jqXHR.responseText || errorThrown);
      }
    });
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
    this.attach = __bind(this.attach, this);

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
          return _this.publishEvent('tell_user', "Dane biura zostały zmienione " + (_this.model.get_url()) + " zapisany");
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
        return _this.publishEvent('log:info', 'Dyspozycja usunięcia konta przyjęta. Skontaktujemy się z państwem w celu potwierdzenia.');
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

  BonEditView.prototype.attach = function() {
    var _ref;
    BonEditView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: bon-view afterRender()');
    return this.publishEvent('disable_buttons', (_ref = this.can_edit) != null ? _ref : false, this.edit_type, false, true);
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
    this.back_action = __bind(this.back_action, this);

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
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
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
        _this.publishEvent('tell_user', 'Rekord został usunięty');
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

  BranchView.prototype.back_action = function() {
    BranchView.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/oddzialy'
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
    this.back_action = __bind(this.back_action, this);

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
        _this.publishEvent('tell_user', 'Rekord został usunięty');
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

  ClientView.prototype.back_action = function() {
    ClientView.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/klienci-wspolni'
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
    this.back_action = __bind(this.back_action, this);

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
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
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
        _this.publishEvent('tell_user', 'Rekord został usunięty');
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

  ClientAddView.prototype.back_action = function() {
    ClientAddView.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/klienci'
    });
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

    this.back_action = __bind(this.back_action, this);

    this.save_action = __bind(this.save_action, this);

    this.delete_action = __bind(this.delete_action, this);

    this.form_help = __bind(this.form_help, this);

    this.init_uploader = __bind(this.init_uploader, this);

    this.init_sortable = __bind(this.init_sortable, this);

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
    this.upload_multiple = true;
    this.publishEvent('log:debug', "form_name:" + this.form_name + ", can_edit:" + this.can_edit + ", listing_type:" + this.listing_type + ", delete_only:" + this.delete_only + " ");
    this.subscribeEvent('delete:clicked', this.delete_action);
    this.subscribeEvent('popupbeforeposition', this.popup_position);
    this.subscribeEvent('save:clicked', this.save_action);
    this.subscribeEvent('back:clicked', this.back_action);
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
      img.src = "" + mediator.upload_url + "/" + uuid + "/" + (mediator.models.user.get('company_name'));
    } else {
      img.src = "images/file.png";
    }
    button = "<a href='#' data-rel='back' class='ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right'>Zamknij</a>";
    save_button = "<a href='" + mediator.upload_url + "/" + uuid + "/" + (mediator.models.user.get('company_name')) + "?download=true' class='ui-btn ui-btn-inline'>Zapisz na dysku</a>";
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
      $ul.trigger("updatelayout");
    } catch (error) {
      this.publishEvent("log:warn", error);
    }
    this.publishEvent("log:info", "resources empty: " + (_.isEmpty(this.form.fields.resources.editor.getValue())));
    if (this.upload_multiple === false && !_.isEmpty(this.form.fields.resources.editor.getValue())) {
      this.publishEvent("log:info", "one upload allowed  - removing button ");
      $("#upload a:first").addClass('ui-state-disabled');
      return $("#upload input").css('display', 'none');
    } else {
      this.publishEvent("log:info", "upload allowed  - reseting button");
      $("#upload a:first").removeClass('ui-state-disabled');
      return $("#upload input").css('display', 'inline');
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
    url = "" + mediator.upload_url + "/" + uuid;
    return $.ajax({
      url: url,
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('X-Auth-Token', mediator.gen_token(url));
      },
      type: "DELETE",
      success: function(data, textStatus, jqXHR) {
        var i, items, new_items, _i, _len;
        items = self.form.fields.resources.getValue();
        new_items = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          i = items[_i];
          if (i.uuid === uuid) {
            self.form.fields.resources.editor.removeItem(i, items.indexOf(i));
          }
        }
        return self.refresh_resource();
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
      multiple: self.upload_multiple,
      request: {
        endpoint: "" + mediator.upload_url,
        customHeaders: {
          'X-Auth-Token': mediator.gen_token("" + mediator.upload_url)
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

  EditView.prototype.back_action = function(event) {
    return this.publishEvent('log:info', 'back_action  caught');
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
    this.publishEvent('disable_buttons', (_ref = this.can_edit) != null ? _ref : false, this.edit_type, this.delete_only);
    if (!this.form_name.match('rent|sell')) {
      if (_.isObject(this.model.schema.resources)) {
        this.publishEvent('log:info', 'view: attach initate uploader , sortable, events ');
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

;require.register("views/export-list-view", function(exports, require, module) {
var ExportListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = ExportListView = (function(_super) {

  __extends(ExportListView, _super);

  function ExportListView() {
    this.attach = __bind(this.attach, this);

    this.delete_all_for_export = __bind(this.delete_all_for_export, this);

    this.select_all_for_export = __bind(this.select_all_for_export, this);

    this.set_full_export = __bind(this.set_full_export, this);
    return ExportListView.__super__.constructor.apply(this, arguments);
  }

  ExportListView.prototype.initialize = function(params) {
    ExportListView.__super__.initialize.apply(this, arguments);
    this.delegate('click', "#set_full_export", this.set_full_export);
    this.delegate('click', "#select_all_for_export", this.select_all_for_export);
    this.delegate('click', "#delete_all_for_export", this.delete_all_for_export);
    return this.module_name = 'ExportListView';
  };

  ExportListView.prototype.set_full_export = function(e) {
    var url;
    e.preventDefault();
    this.model = this.collection_hard.get(e.target.dataset["export"]);
    url = "" + this.model.urlRoot + "/" + e.target.dataset["export"] + "/pelny";
    return this.mp_request(this.model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały zaznaczone');
  };

  ExportListView.prototype.select_all_for_export = function(e) {
    var url;
    this.publishEvent('log:info', "" + this.module_name + " select_all_for_export id:" + e.target.id + " data:" + e.target.dataset["export"]);
    e.preventDefault();
    this.model = this.collection_hard.get(e.target.dataset["export"]);
    url = "" + this.model.urlRoot + "/" + e.target.dataset["export"] + "/zaznacz";
    return this.mp_request(this.model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały zaznaczone');
  };

  ExportListView.prototype.delete_all_for_export = function(e) {
    var url;
    this.publishEvent('log:info', "" + this.module_name + " delete_all_for_export id:" + e.target.id + " data:" + e.target.dataset["export"]);
    e.preventDefault();
    this.model = this.collection_hard.get(e.target.dataset["export"]);
    url = "" + this.model.urlRoot + "/" + e.target.dataset["export"] + "/odznacz";
    return this.mp_request(this.model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały odznaczone');
  };

  ExportListView.prototype.attach = function() {
    ExportListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', "" + this.module_name + " afterRender()");
  };

  return ExportListView;

})(View);

});

;require.register("views/export-view", function(exports, require, module) {
var ExportView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = ExportView = (function(_super) {

  __extends(ExportView, _super);

  function ExportView() {
    this.attach = __bind(this.attach, this);

    this.back_action = __bind(this.back_action, this);

    this.delete_action = __bind(this.delete_action, this);

    this.refresh_form = __bind(this.refresh_form, this);

    this.save_action = __bind(this.save_action, this);

    this.set_export = __bind(this.set_export, this);

    this.initialize = __bind(this.initialize, this);
    return ExportView.__super__.constructor.apply(this, arguments);
  }

  ExportView.prototype.initialize = function(options) {
    ExportView.__super__.initialize.apply(this, arguments);
    return this.delegate('change', "#export_select", this.set_export);
  };

  ExportView.prototype.set_export = function(e) {
    var i, input, portal, portals, _i, _len, _ref;
    this.publishEvent('log:info', "set_export called with " + e.target.value);
    portals = localStorage.getObject('portals');
    portal = portals[e.target.value];
    if (portal) {
      $("[name='name']").val(portal['name']);
      $("[name='address_ftp']").val(portal['address_ftp']);
      $("[name='login']").val(portal['login']);
      $("[name='password']").val(portal['password']);
      $("[name='folder_ftp']").val(portal['folder_ftp']);
      $("[name='code_offline']").val(portal['code_offline']);
      input = $("[name='format_type'] input")[portal['format_type']];
      _ref = $("[name='format_type'] input");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        $(i).prop("checked", false).checkboxradio("refresh");
      }
      return $(input).prop("checked", true).checkboxradio("refresh");
    }
  };

  ExportView.prototype.save_action = function(url) {
    var _this = this;
    ExportView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          if (mediator.collections.exports != null) {
            mediator.collections.exports.add(_this.model);
          }
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
          return Chaplin.utils.redirectTo({
            url: url != null ? url : '/eksporty'
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

  ExportView.prototype.refresh_form = function() {
    return Chaplin.utils.redirectTo({
      url: '/eksporty/dodaj'
    });
  };

  ExportView.prototype.delete_action = function() {
    var _this = this;
    ExportView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.exports.remove(_this.model);
        _this.publishEvent('tell_user', "Rekord został usunięty");
        return Chaplin.utils.redirectTo({
          url: '/eksporty'
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

  ExportView.prototype.back_action = function() {
    ExportView.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/eksporty'
    });
  };

  ExportView.prototype.attach = function() {
    ExportView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: export afterRender()');
  };

  return ExportView;

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

    this.back = __bind(this.back, this);

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
    return this.delegate('click', '#back-button', this.back);
  };

  FooterView.prototype.save = function(event) {
    event.preventDefault();
    return this.publishEvent('save:clicked');
  };

  FooterView.prototype["delete"] = function(event) {
    event.preventDefault();
    return this.publishEvent('delete:clicked');
  };

  FooterView.prototype.back = function(event) {
    event.preventDefault();
    return this.publishEvent('back:clicked');
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
    var new_el;
    FooterView.__super__.attach.apply(this, arguments);
    new_el = _.clone(this.el);
    _.delay(function() {
      $("#footer-region").html('').append(new_el.outerHTML);
      return $("#footer-region").enhanceWithin();
    }, 30);
    this.publishEvent('log:info', 'FooterView:attach');
    return this.publishEvent('jqm_footer_refersh:render');
  };

  return FooterView;

})(View);

});

;require.register("views/graphic-list-view", function(exports, require, module) {
var GraphicListView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/list-view');

mediator = require('mediator');

module.exports = GraphicListView = (function(_super) {

  __extends(GraphicListView, _super);

  function GraphicListView() {
    this.attach = __bind(this.attach, this);
    return GraphicListView.__super__.constructor.apply(this, arguments);
  }

  GraphicListView.prototype.initialize = function(params) {
    return GraphicListView.__super__.initialize.apply(this, arguments);
  };

  GraphicListView.prototype.attach = function() {
    GraphicListView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'view: client list view afterRender()');
  };

  return GraphicListView;

})(View);

});

;require.register("views/graphic-view", function(exports, require, module) {
var GraphicView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/edit-view');

mediator = require('mediator');

module.exports = GraphicView = (function(_super) {

  __extends(GraphicView, _super);

  function GraphicView() {
    this.attach = __bind(this.attach, this);

    this.back_action = __bind(this.back_action, this);

    this.delete_action = __bind(this.delete_action, this);

    this.refresh_form = __bind(this.refresh_form, this);

    this.save_action = __bind(this.save_action, this);

    this.initialize = __bind(this.initialize, this);
    return GraphicView.__super__.constructor.apply(this, arguments);
  }

  GraphicView.prototype.initialize = function(options) {
    GraphicView.__super__.initialize.apply(this, arguments);
    return this.upload_multiple = false;
  };

  GraphicView.prototype.save_action = function(url) {
    var _this = this;
    GraphicView.__super__.save_action.apply(this, arguments);
    this.publishEvent('log:info', 'commmit form');
    if (_.isUndefined(this.form.commit({
      validate: true
    }))) {
      return this.model.save({}, {
        success: function(event) {
          if (mediator.collections.graphics != null) {
            mediator.collections.graphics.add(_this.model);
          }
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
          return Chaplin.utils.redirectTo({
            url: url != null ? url : '/grafiki'
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

  GraphicView.prototype.refresh_form = function() {
    return Chaplin.utils.redirectTo({
      url: '/grafiki/dodaj'
    });
  };

  GraphicView.prototype.delete_action = function() {
    var _this = this;
    GraphicView.__super__.delete_action.apply(this, arguments);
    return this.model.destroy({
      success: function(event) {
        mediator.collections.graphics.remove(_this.model);
        _this.publishEvent('tell_user', "Rekord został usunięty");
        return Chaplin.utils.redirectTo({
          url: '/grafiki'
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

  GraphicView.prototype.back_action = function() {
    GraphicView.__super__.back_action.apply(this, arguments);
    return Chaplin.utils.redirectTo({
      url: '/grafiki'
    });
  };

  GraphicView.prototype.attach = function() {
    GraphicView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: graphic afterRender()');
    return _.delay(this.refresh_resource, 10);
  };

  return GraphicView;

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

    this.getTemplateData = __bind(this.getTemplateData, this);
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
    this.delegate('click', '#first-name-placeholder', this.login_screen);
    this.delegate('click', '#info-btn', this.info_screen);
    this.delegate('click', '#viewed-btn', this.viewed_screen);
    return this.delegate('click', '#account-status-btn', this.account_status);
  };

  HeaderView.prototype.login_screen = function() {
    mediator.user = {};
    mediator.controllers = {};
    mediator.models = {};
    return Chaplin.utils.redirectTo({
      url: '/login'
    });
  };

  HeaderView.prototype.account_status = function() {
    var as, val;
    as = localStorage.getObject('account');
    val = "<h4>Konto</h4><p>Liczba ofert: <b>" + as.total_listings + "</b><br />Przestrzeń dysku: <b>" + as.disk_usage + "</b><br />Status konta: <b>" + as.status + "</b></p>";
    $('#info').html(val);
    return $('#info').popup('open', {
      positionTo: "#account-status-btn",
      transition: "fade"
    });
  };

  HeaderView.prototype.info_screen = function() {
    var $ul, i, str, val, _i, _len, _ref;
    str = "";
    _ref = _.last(mediator.info, 10);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      str = "" + str + "<li>" + i + "</li>";
    }
    val = "<h4>Info</h4><ul>" + str + "</ul>";
    $('#info').html(val);
    $ul = $("#info");
    try {
      $ul.enhanceWithin();
    } catch (error) {
      this.publishEvent("log:warn", error);
    }
    return $('#info').popup('open', {
      positionTo: "#info-btn",
      transition: "fade"
    });
  };

  HeaderView.prototype.viewed_screen = function() {
    var $ul, i, str, val, _i, _len, _ref;
    str = "";
    _ref = _.last(_.uniq(mediator.viewed), 20);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      str = "" + str + "<li>" + i + "</li>";
    }
    val = "<h4>Ostatio oglądane</h4><br /> <ul data-role='listview' >" + str + "</ul>";
    $('#viewed').html(val);
    $ul = $("#viewed");
    try {
      $ul.enhanceWithin();
    } catch (error) {
      this.publishEvent("log:warn", error);
    }
    return $('#viewed').popup('open', {
      positionTo: "#viewed-btn",
      transition: "fade"
    });
  };

  HeaderView.prototype.getTemplateData = function() {
    return {
      disk_usage: localStorage.getItem('disk_usage')
    };
  };

  HeaderView.prototype.attach = function() {
    HeaderView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HeaderView:attach()');
  };

  return HeaderView;

})(View);

});

;require.register("views/home-page-view", function(exports, require, module) {
var Collection, HomePageView, View, mediator, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/home');

View = require('views/base/view');

Collection = require('models/listing-collection');

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
    var listings1, listings2, listings3;
    listings1 = new Collection;
    listings2 = new Collection;
    listings3 = new Collection;
    listings1.set(JSON.parse(localStorage.getObject('latest')));
    listings2.set(JSON.parse(localStorage.getObject('latest_modyfied')));
    listings3.set(JSON.parse(localStorage.getObject('update_needed')));
    return {
      latest: listings1.toJSON(),
      latest_modyfied: listings2.toJSON(),
      update_needed: listings3.toJSON()
    };
  };

  HomePageView.prototype.attach = function() {
    HomePageView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'HomeView: attach()');
    return this.publishEvent('jqm_refersh:render');
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

    this.tell_viewed = __bind(this.tell_viewed, this);

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
      this.subscribeEvent('tell_viewed', this.tell_viewed);
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

  Layout.prototype.tell_viewed = function(information) {
    return mediator.viewed.push(information);
  };

  Layout.prototype.tell_user = function(information) {
    $('#info').html(information);
    mediator.info.push(information);
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

  Layout.prototype.disable_buttons = function(can_edit, edit_type, delete_only, no_back) {
    this.log.info('form buttons disable caught');
    if (edit_type === 'add') {
      $("#delete-button").attr('disabled', true);
    }
    if (!can_edit) {
      $("#delete-button").attr('disabled', true);
      $("#save-button").attr('disabled', true);
    }
    if (delete_only) {
      $("#save-button").attr('disabled', true);
    }
    if (no_back) {
      return $("#back-button").attr('disabled', true);
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
    this.log.debug('layout: event jqm_refresh caugth');
    self = this;
    f1 = function(callback) {
      return callback();
    };
    f2 = function(callback) {
      return callback();
    };
    return f1(function() {
      $("#content-region").enhanceWithin();
      return f2(function() {
        self.publishEvent('jqm_finished_rendering');
        return self.log.debug('jqm_refresh finished');
      });
    });
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

;require.register("views/list-items-view", function(exports, require, module) {
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

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.initialize = __bind(this.initialize, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.autoRender = true;

  View.prototype.id = 'view-list';

  View.prototype.initialize = function(options) {
    this.template = options.template;
    return this.collection = options.collection;
  };

  View.prototype.getTemplateData = function() {
    return {
      collection: this.collection.toJSON(),
      agents: localStorage.getObject('agents'),
      clients: localStorage.getObject('clients'),
      branches: localStorage.getObject('branches')
    };
  };

  View.prototype.render = function() {
    View.__super__.render.apply(this, arguments);
    return this.publishEvent('log:info', 'subview: sub-view render()');
  };

  View.prototype.attach = function() {
    $('#view-list').remove();
    $('#view-menu').after(this.$el);
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
    return this.publishEvent('log:info', 'subview afterAttach()');
  };

  return View;

})(View);

});

;require.register("views/list-view-collection", function(exports, require, module) {
var CollectionView, ListView, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CollectionView = require('views/base/collection-view');

mediator = require('mediator');

module.exports = ListView = (function(_super) {

  __extends(ListView, _super);

  function ListView() {
    this.attach = __bind(this.attach, this);

    this.render = __bind(this.render, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.selects_refresh = __bind(this.selects_refresh, this);

    this.refresh_action = __bind(this.refresh_action, this);

    this.filter_apply = __bind(this.filter_apply, this);

    this.filter_action = __bind(this.filter_action, this);

    this.select_action = __bind(this.select_action, this);

    this.select_all_action = __bind(this.select_all_action, this);

    this.query_action = __bind(this.query_action, this);

    this.open_column_popup = __bind(this.open_column_popup, this);
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
    var _ref;
    ListView.__super__.initialize.apply(this, arguments);
    this.params = params;
    this.filter = {};
    this.collection_hard = this.params.collection;
    this.collection = _.clone(this.params.collection);
    this.listing_type = (_ref = this.params.listing_type) != null ? _ref : false;
    this.template = require("views/templates/" + this.params.template);
    this.delegate('change', '#select-action', this.select_action);
    this.delegate('change', '#all', this.select_all_action);
    this.delegate('click', '#refresh', this.refresh_action);
    this.delegate('change', "[data-query]", this.query_action);
    this.delegate('change', "#view-menu [data-filter]", this.filter_action);
    this.delegate('click', "[href='#list-table-popup']", this.open_column_popup);
    this.publishEvent('log:debug', this.params);
    return window.collection = this.collection_hard;
  };

  ListView.prototype.open_column_popup = function(event) {
    this.publishEvent("log:info", "coumn toggle popup");
    event.preventDefault();
    return $('#list-table-popup').popup('open');
  };

  ListView.prototype.query_action = function(event) {
    return this.publishEvent("log:info", "query_action called");
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
    var id, key, list_of_models, value;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.collection = _.clone(this.collection_hard);
    key = event.target.dataset.filter;
    id = event.target.id;
    this.undelegate('change', "#" + id, this.filter_action);
    if (event.target.type === 'checkbox') {
      this.publishEvent("log:info", event.target.type);
      value = event.target.checked;
    } else if (event.target.type === 'select-one') {
      this.publishEvent("log:info", event.target.type);
      value = parseInt(event.target.value);
    } else {
      value = event.target.value;
    }
    if (_.isNaN(value)) {
      this.filter = _.omit(this.filter, key);
      this.publishEvent("log:info", "omiting " + key);
      console.log(this.filter);
    } else {
      this.filter[key] = value;
    }
    this.publishEvent('log:debug', key);
    this.publishEvent('log:debug', value);
    console.log(this.filter);
    if (_.isEmpty(this.filter)) {

    } else {
      list_of_models = this.collection_hard.where(this.filter);
      return this.collection.reset(list_of_models);
    }
  };

  ListView.prototype.filter_apply = function() {
    var list_of_models;
    this.publishEvent('log:debug', 'filter apply');
    if (obj[this.filter] !== false) {
      console.log(obj);
      this.publishEvent('log:debug', 'filter apply');
      list_of_models = this.collection_hard.where(obj);
      this.collection.reset(list_of_models);
    } else {
      this.publishEvent('log:debug', 'filter reset');
      this.collection = _.clone(this.collection_hard);
    }
    return this.render();
  };

  ListView.prototype.refresh_action = function(event) {
    var _this = this;
    event.preventDefault();
    this.publishEvent('log:debug', 'refresh');
    return this.collection_hard.fetch({
      data: this.collection_hard.query || {},
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

  ListView.prototype.selects_refresh = function() {
    var k, v, _ref, _results;
    if (this.collection.query) {
      _ref = this.collection.query;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        $("[data-query=\'" + k + "\']").val(v);
        _results.push($("[data-query=\'" + k + "\']").selectmenu('refresh'));
      }
      return _results;
    }
  };

  ListView.prototype.getTemplateData = function() {
    return {
      collection: this.collection.toJSON(),
      listing_type: this.listing_type,
      agents: localStorage.getObject('agents'),
      clients: localStorage.getObject('clients'),
      branches: localStorage.getObject('branches')
    };
  };

  ListView.prototype.render = function() {
    ListView.__super__.render.apply(this, arguments);
    $("#list-table-popup").remove();
    return $("#list-table-popup-popup").remove();
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
    this.publishEvent('table_refresh');
    return this.selects_refresh();
  };

  return ListView;

})(CollectionView);

});

;require.register("views/list-view", function(exports, require, module) {
var ListView, SubView, View, mediator,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

SubView = require('views/list-items-view');

mediator = require('mediator');

module.exports = ListView = (function(_super) {

  __extends(ListView, _super);

  function ListView() {
    this.attach = __bind(this.attach, this);

    this.render_subview = __bind(this.render_subview, this);

    this.render = __bind(this.render, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.selects_refresh = __bind(this.selects_refresh, this);

    this.refresh_action = __bind(this.refresh_action, this);

    this.filter_apply = __bind(this.filter_apply, this);

    this.filter_action = __bind(this.filter_action, this);

    this.select_action = __bind(this.select_action, this);

    this.select_all_action = __bind(this.select_all_action, this);

    this.query_action = __bind(this.query_action, this);

    this.open_column_popup = __bind(this.open_column_popup, this);
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
    var _ref;
    ListView.__super__.initialize.apply(this, arguments);
    this.params = params;
    this.filter = {};
    this.collection_hard = this.params.collection;
    this.collection = _.clone(this.params.collection);
    this.listing_type = (_ref = this.params.listing_type) != null ? _ref : false;
    this.template = require("views/templates/" + this.params.template);
    this.sub_template = require("views/templates/" + this.params.template + "_items");
    this.delegate('change', '#select-action', this.select_action);
    this.delegate('change', '#all', this.select_all_action);
    this.delegate('click', '#refresh', this.refresh_action);
    this.delegate('change', "[data-query]", this.query_action);
    this.delegate('change', "#view-menu [data-filter]", this.filter_action);
    this.delegate('click', "[href='#list-table-popup']", this.open_column_popup);
    return this.publishEvent('log:debug', this.params);
  };

  ListView.prototype.open_column_popup = function(event) {
    this.publishEvent("log:info", "coumn toggle popup");
    event.preventDefault();
    return $('#list-table-popup').popup('open');
  };

  ListView.prototype.query_action = function(event) {
    this.publishEvent("log:info", "query_action called");
    return this.filter = {};
  };

  ListView.prototype.select_all_action = function() {
    var selected;
    this.publishEvent("log:info", "select all action");
    selected = $('#list-table>thead input:checkbox').prop('checked');
    return $('#list-table>tbody input:checkbox').prop('checked', selected).checkboxradio("refresh");
  };

  ListView.prototype.select_action = function(event) {
    var $ul, clean_after_action, form, item, k, model, selected, self, str, url, v, val, _i, _len, _ref, _ref1,
      _this = this;
    this.publishEvent("log:info", "select action");
    selected = $('#list-table>tbody input:checked');
    self = this;
    clean_after_action = function(selected) {
      $('#list-table>tbody input:checkbox').prop('checked', false).checkboxradio("refresh");
      $("#select-action :selected").removeAttr('selected');
      $("#select-action option:first").attr('selected', 'selected');
      $("#select-action").selectmenu('refresh');
      selected = null;
      _this.publishEvent('jqm_refersh:render');
    };
    this.publishEvent('log:info', "performing action " + event.target.value + " for offers " + selected);
    if (selected.length > 0) {
      if (event.target.value === 'usun') {
        $("#confirm").popup('open');
        $("#confirmed").unbind().click(function() {
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
                self.render_subview();
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
          self.render_subview();
          return clean_after_action(selected);
        });
      }
      if (event.target.value === 'zmien_agenta') {
        str = "";
        _ref = localStorage.getObject('agents');
        for (k in _ref) {
          v = _ref[k];
          str = "" + str + "<li value='" + k + "'><a id='" + k + "'>" + v + "</a></li>";
        }
        val = "<h4>Wybierz Agenta</h4><br /><ul data-role='listview' id='agent-choose'>" + str + "</ul>";
        $('#popgeneric').html(val);
        $ul = $("#popgeneric");
        try {
          $ul.enhanceWithin();
        } catch (error) {
          this.publishEvent("log:warn", error);
        }
        $('#popgeneric').popup('open', {
          transition: "fade"
        });
        $("#agent-choose li").unbind().click(function() {
          var i, model, _i, _len;
          $('#popgeneric').popup('close');
          for (_i = 0, _len = selected.length; _i < _len; _i++) {
            i = selected[_i];
            model = self.collection_hard.get(i.id);
            model.set('agent', this.value);
          }
          $(this).off('click');
          return self.render_subview();
        });
        clean_after_action(selected);
      }
      if (event.target.value === 'send-listing-client') {
        str = "";
        _ref1 = localStorage.getObject('clients');
        for (k in _ref1) {
          v = _ref1[k];
          str = "" + str + "<li value='" + k + "'><a id='" + k + "'>" + v + "</a></li>";
        }
        val = "<h4>Wybierz Klienta</h4><br /><ul data-role='listview' id='client-choose'>" + str + "</ul>";
        try {
          $('#popgeneric').html(val).enhanceWithin();
        } catch (error) {
          this.publishEvent("log:warn", error);
        }
        $('#popgeneric').popup('open', {
          transition: "fade"
        });
        $("#client-choose li").unbind().click(function() {
          var item, model, url, _i, _len;
          $('#popgeneric').popup('close');
          for (_i = 0, _len = selected.length; _i < _len; _i++) {
            item = selected[_i];
            model = self.collection_hard.get(item.id);
            url = "" + model.urlRoot + "/" + item.id + "/email/" + this.value + "?private=false";
            self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany');
          }
          $(this).off('click');
          return self.render_subview();
        });
        clean_after_action(selected);
      }
      if (event.target.value === 'send-listing-address') {
        console.log(1);
        form = '<form>\n<label for="email_send" class="ui-hidden-accessible">Email:</label>\n<input name="email_send" id="email_send" placeholder="Wprowadź email" value="" type="text" />\n<button data-icon="mail" id="address_submit">Wyślij</button>\n</form>';
        try {
          $('#popgeneric').html(form).enhanceWithin();
        } catch (error) {
          this.publishEvent("log:warn", error);
        }
        $('#popgeneric').popup('open', {
          transition: "fade"
        });
        $("#address_submit").unbind().click(function(e) {
          var item, model, url, _i, _len;
          e.preventDefault();
          $('#popgeneric').popup('close');
          for (_i = 0, _len = selected.length; _i < _len; _i++) {
            item = selected[_i];
            model = self.collection_hard.get(item.id);
            url = "" + model.urlRoot + "/" + item.id + "/email/" + ($("#email_send").val()) + "?private=false";
            self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany');
          }
          $(this).off('click');
          return self.render_subview();
        });
        clean_after_action(selected);
      }
      if (event.target.value === 'wydruk-wewnetrzny' || event.target.value === 'wydruk-klienta') {
        for (_i = 0, _len = selected.length; _i < _len; _i++) {
          item = selected[_i];
          model = this.collection_hard.get(item.id);
          if (event.target.value === 'wydruk-wewnetrzny') {
            url = "" + model.urlRoot + "/" + item.id + "/" + (mediator.models.user.get('company_name')) + "?private=true";
          }
          if (event.target.value === 'wydruk-klienta') {
            url = "" + model.urlRoot + "/" + item.id + "/" + (mediator.models.user.get('company_name')) + "?private=false";
          }
          window.location = url;
          $(this).off('click');
          self.render_subview();
        }
        return clean_after_action(selected);
      }
    } else {
      this.publishEvent('tell_user', 'Musisz zaznaczyć przynajmniej jeden element!');
      return clean_after_action(selected);
    }
  };

  ListView.prototype.filter_action = function(event) {
    var id, key, list_of_models, value;
    this.publishEvent("log:info", "filter_action_called");
    event.preventDefault();
    this.collection = _.clone(this.collection_hard);
    key = event.target.dataset.filter;
    id = event.target.id;
    this.undelegate('change', "#" + id, this.filter_action);
    if (event.target.type === 'checkbox') {
      this.publishEvent("log:info", event.target.type);
      value = event.target.checked;
    } else if (event.target.type === 'select-one') {
      this.publishEvent("log:info", event.target.type);
      value = parseInt(event.target.value);
    } else {
      value = event.target.value;
    }
    if (_.isNaN(value)) {
      this.filter = _.omit(this.filter, key);
      this.publishEvent("log:info", "omiting " + key);
      this.publishEvent("log:info", this.filter);
    } else {
      this.filter[key] = value;
    }
    this.publishEvent('log:debug', key);
    this.publishEvent('log:debug', value);
    if (_.isEmpty(this.filter)) {
      return this.render_subview();
    } else {
      list_of_models = this.collection_hard.where(this.filter);
      this.collection.reset(list_of_models);
      return this.render_subview();
    }
  };

  ListView.prototype.filter_apply = function() {
    var list_of_models;
    this.publishEvent('log:debug', 'filter apply');
    if (obj[this.filter] !== false) {
      console.log(obj);
      this.publishEvent('log:debug', 'filter apply');
      list_of_models = this.collection_hard.where(obj);
      this.collection.reset(list_of_models);
    } else {
      this.publishEvent('log:debug', 'filter reset');
      this.collection = _.clone(this.collection_hard);
    }
    return this.render_subview();
  };

  ListView.prototype.refresh_action = function(event) {
    var _this = this;
    event.preventDefault();
    this.publishEvent('log:debug', 'refresh');
    return this.collection_hard.fetch({
      data: this.collection_hard.query || {},
      success: function() {
        _this.publishEvent('tell_user', 'Odświeżam listę elementów');
        _this.collection = _.clone(_this.collection_hard);
        return _this.render_subview();
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

  ListView.prototype.selects_refresh = function() {
    var k, v, _ref, _results;
    if (this.collection.query) {
      _ref = this.collection.query;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        $("[data-query=\'" + k + "\']").val(v);
        _results.push($("[data-query=\'" + k + "\']").selectmenu('refresh'));
      }
      return _results;
    }
  };

  ListView.prototype.getTemplateData = function() {
    return {
      listing_type: this.listing_type,
      agents: localStorage.getObject('agents'),
      clients: localStorage.getObject('clients'),
      branches: localStorage.getObject('branches')
    };
  };

  ListView.prototype.render = function() {
    ListView.__super__.render.apply(this, arguments);
    $("#list-table-popup").remove();
    return $("#list-table-popup-popup").remove();
  };

  ListView.prototype.render_subview = function() {
    this.publishEvent('log:info', "render sub_view");
    this.subview("items", new SubView({
      template: this.sub_template,
      collection: this.collection
    }));
    this.subview("items").render();
    return this.publishEvent('jqm_refersh:render');
  };

  ListView.prototype.attach = function() {
    ListView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'view: list-view afterRender()');
    this.publishEvent('jqm_refersh:render');
    this.render_subview();
    return this.selects_refresh();
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

    this.query_action = __bind(this.query_action, this);
    return ListingListView.__super__.constructor.apply(this, arguments);
  }

  ListingListView.prototype.initialize = function(params) {
    return ListingListView.__super__.initialize.apply(this, arguments);
  };

  ListingListView.prototype.query_action = function(event) {
    var query,
      _this = this;
    ListingListView.__super__.query_action.apply(this, arguments);
    if (_.isEmpty(event.target.value)) {
      this.publishEvent("log:info", "removing key " + event.target.dataset.query);
      this.collection_hard.query_remove("" + event.target.dataset.query);
    } else {
      query = {};
      query[event.target.dataset.query] = event.target.value;
      this.collection_hard.query_add(query);
    }
    this.publishEvent("log:info", "" + event.target.value + "," + (typeof event.target.value));
    this.publishEvent("log:info", "" + query + "," + mediator.collections.listings.query);
    return this.collection_hard.fetch({
      data: this.collection_hard.query,
      beforeSend: function() {
        return _this.publishEvent('tell_user', 'Ładuje oferty...');
      },
      success: function() {
        _this.collection = _.clone(_this.collection_hard);
        return _this.render();
      },
      error: function() {
        return _this.publishEvent('server_error');
      }
    });
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

    this.back_action = __bind(this.back_action, this);

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
          var _ref;
          ({
            wait: true
          });
          if (mediator.collections.listings != null) {
            mediator.collections.listings.add(_this.model);
          }
          _this.publishEvent('tell_user', "Rekord " + (_this.model.get_url()) + " zapisany");
          if (((_ref = mediator.collections.listings) != null ? _ref.query : void 0) != null) {
            return Chaplin.utils.redirectTo({
              url: url != null ? url : "/oferty?" + ($.param(mediator.collections.listings.query))
            });
          } else {
            return Chaplin.utils.redirectTo({
              url: url != null ? url : "/"
            });
          }
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
        var _ref, _ref1;
        if ((_ref = mediator.collections.listings) != null) {
          _ref.remove(_this.model);
        }
        _this.publishEvent('tell_user', 'Rekord został usunięty');
        if (((_ref1 = mediator.collections.listings) != null ? _ref1.query : void 0) != null) {
          return Chaplin.utils.redirectTo({
            url: typeof url !== "undefined" && url !== null ? url : "/oferty?" + ($.param(mediator.collections.listings.query))
          });
        } else {
          return Chaplin.utils.redirectTo({
            url: typeof url !== "undefined" && url !== null ? url : "/"
          });
        }
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

  AddView.prototype.back_action = function() {
    AddView.__super__.back_action.apply(this, arguments);
    if ((mediator.collections.listings != null) === true) {
      return Chaplin.utils.redirectTo({
        url: "/oferty?" + ($.param(mediator.collections.listings.query))
      });
    } else {
      return Chaplin.utils.redirectTo({
        url: "/"
      });
    }
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
    $("[name='county']").val('');
    return $("[name='number']").val('');
  };

  AddView.prototype.fill_address = function(event) {
    var $ul, borough, county, full_name, item, newPx, obj, openlayers_projection, position, projection, zoom, _i, _len;
    this.publishEvent('log:info', 'fill address event');
    this.address_reset();
    obj = this.response[event.target.value];
    $("[name='postcode']").val(obj.address.postcode);
    $("[name='street']").val(obj.address.road || obj.address.pedestrian);
    $("[name='town']").val(obj.address.city || obj.address.village);
    $("[name='province']").val(obj.address.state.replace('województwo ', ''));
    $("[name='number']").val(obj.address.house_number);
    $("[name='town_district']").val(obj.address.city_district || obj.address.suburb);
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
    this.publishEvent('log:info', "county:" + county + ", borough:" + borough + ", address.county:" + obj.address.county + ", address.borough:" + obj.address.borough);
    $("[name='borough']").val(borough || obj.address.borough || obj.address.village || obj.address.city);
    $("[name='county']").val(county || obj.address.county || '');
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
    var icon, lat, layer, lon, lonLat, map, marker, markers, newPx, offset, openlayers_projection, position, projection, size, vlayer, zoom;
    this.publishEvent('log:debug', 'opentstreet called');
    OpenLayers.ImgPath = 'img/';
    $("#openmap").css('height', '400px');
    projection = new OpenLayers.Projection("EPSG:4326");
    openlayers_projection = new OpenLayers.Projection("EPSG:900913");
    lat = this.model.get('lat') || 52.05;
    lon = this.model.get('lon') || 19.55;
    if (this.model.get('lat')) {
      zoom = 15;
    } else {
      zoom = 7;
    }
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
      controls: [new OpenLayers.Control.PanZoom()],
      units: 'km',
      projection: projection,
      displayProjection: projection
    });
    map.addLayers([layer, vlayer, markers]);
    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.Navigation());
    map.addControl(new OpenLayers.Control.OverviewMap());
    map.addControl(new OpenLayers.Control.Attribution());
    lonLat = new OpenLayers.LonLat(lon, lat).transform(projection, map.getProjectionObject());
    map.setCenter(lonLat, zoom);
    size = new OpenLayers.Size(21, 25);
    offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
    marker = new OpenLayers.Marker(new OpenLayers.LonLat(0, 0).transform(projection), icon);
    markers.addMarker(marker);
    this.map = map;
    this.marker = marker;
    if (this.model.get('lon')) {
      position = new OpenLayers.LonLat(this.model.get('lon'), this.model.get('lat')).transform(projection, openlayers_projection);
      newPx = this.map.getLayerPxFromLonLat(position);
      this.marker.moveTo(newPx);
      this.map.setCenter(position, zoom);
    }
    return map.events.register("click", map, function(e) {
      var new_position, opx;
      opx = map.getLayerPxFromViewPortPx(e.xy);
      lonLat = map.getLonLatFromPixel(e.xy);
      marker.map = map;
      marker.moveTo(opx);
      new_position = marker.lonlat.transform(openlayers_projection, projection);
      $("[name='lat']").val(new_position.lat);
      return $("[name='lon']").val(new_position.lon);
    });
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
        _this.publishEvent('tell_user', "Logowanie zakończone.");
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

;require.register("views/popgeneric-view", function(exports, require, module) {
var PopGenericView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/popgeneric');

View = require('views/base/view');

module.exports = PopGenericView = (function(_super) {

  __extends(PopGenericView, _super);

  function PopGenericView() {
    return PopGenericView.__super__.constructor.apply(this, arguments);
  }

  PopGenericView.prototype.template = template;

  PopGenericView.prototype.containerMethod = 'html';

  PopGenericView.prototype.id = 'popgeneric';

  PopGenericView.prototype.attributes = {
    'data-role': 'popup',
    'data-theme': 'b',
    'data-position-to': 'window',
    'data-arrow': 'true'
  };

  PopGenericView.prototype.className = 'ui-content';

  return PopGenericView;

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
    'header': '#header-region',
    'footer': '#footer-region',
    'info': '#info-region',
    'viewed': '#viewed-region',
    'login': '#login-region',
    'confirm': '#confirm-region',
    'popgeneric': '#popgeneric-region'
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
      var key, val, _ref;
    
      __out.push('<div id="view-menu">\n    <form>\n        <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n            <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n            <a href=\'/agenci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n            <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n            <select name="select-action" id="select-action">\n                <option selected disabled>Akcja</option>\n                <option value="usun">Usuń</option>\n            </select>\n            <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n            <select name="select-filter" id="select-filter" data-filter=\'agent_type\'>\n                <option selected disabled>Filtr</option>\n                <option value="">Wszyscy</option>\n                <option value="0">Pośrednik</option>\n                <option value="1">Administrator nieruchomości</option>\n                <option value="2">Menadzer</option>\n                <option value="3">Wsparcie IT</option>\n            </select>\n            <label for="branch-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n            <select name="branch-filter" id="branch-filter" data-filter=\'branch\'>\n                <option selected disabled>Oddział</option>\n                <option value="">Wszystkie</option>\n                ');
    
      _ref = this.branches;
      for (key in _ref) {
        val = _ref[key];
        __out.push('\n                <option value="');
        __out.push(__sanitize(key));
        __out.push('">');
        __out.push(__sanitize(val));
        __out.push('</option>\n                ');
      }
    
      __out.push('\n            </select>\n    </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/agent_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th width="2%"> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th>Oddział&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Login&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="4">Aktywny&nbsp;&nbsp;</th>\n         <th data-priority="6">Admin&nbsp;&nbsp;</th>\n         <th data-priority="6">Typ&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
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
        __out.push(__sanitize(item['branch_func']));
        __out.push('</td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['first_name']));
        __out.push('</a></td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['surname']));
        __out.push('</a></td>\n         <td><a href=\'/agenci/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['username']));
        __out.push('</a></td>\n         <td>');
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
    
      __out.push('\n     </tbody>\n   </table>\n');
    
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
    
      __out.push('<!-- this is REGIONS ONLY -->\n<div id=\'header-region\' >\n</div><!-- header -->\n\n<div id=\'content-region\'>\n</div><!-- content -->\n\n<div id=\'footer-region\' >\n</div><!-- footer -->\n\n<div id="viewed-region">\n</div><!-- info-region -->\n\n<div id="info-region">\n</div><!-- info-region -->\n\n<div id="login-region">\n</div><!-- info-region -->\n\n<div id="confirm-region">\n</div><!-- info-region -->\n\n<div id="popgeneric-region">\n</div><!-- pop-region -->\n');
    
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
    
      __out.push('<div id="view-menu">\n            <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n                <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n                <a href=\'/oddzialy/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n                <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n                <select name="select-action" id="select-action">\n                    <option selected disabled>Akcja</option>\n                    <option value="usun">Usuń</option>\n                </select>\n            </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/branch_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th data-priority="2">Nazwa&nbsp;&nbsp;</th>\n         <th data-priority="2">Identyfikator&nbsp;&nbsp;</th>\n         <th data-priority="2">WWW&nbsp;&nbsp;</th>\n         <th data-priority="5">Tel&nbsp;&nbsp;</th>\n         <th data-priority="4">Email&nbsp;&nbsp;</th>\n         <th data-priority="6">Miasto&nbsp;&nbsp;</th>\n         <th data-priority="6">Nip&nbsp;&nbsp;</th>\n         <th data-priority="6">Główny&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n       <tr>\n         <td> <label> <input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true"  type="checkbox"> </label> </td>\n         <td>');
        __out.push(__sanitize(item['id']));
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
    
      __out.push('\n     </tbody>\n</table>\n');
    
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
    
      __out.push('<div id="view-menu">\n    <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n        <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option selected disabled>Akcja</option>\n            <option value="usun">Usuń</option>\n            <option value="drukuj" disabled>Drukuj</option>\n            <option value="eksport" disabled>Eksport do pliku</option>\n        </select>\n        <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="select-filter" id="select-filter" data-filter=\'client_type\'>\n            <option selected disabled>Filtr</option>\n            <option value="">Wszyscy</option>\n            <option value="1">Kupujący</option>\n            <option value="2">Sprzedający</option>\n            <option value="3">Najemca</option>\n            <option value="4">Wynajmujący</option>\n        </select>\n    </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/client_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Firma&nbsp;&nbsp;</th>\n         <th data-priority="6">Adres&nbsp;&nbsp;</th>\n         <th data-priority="6">Budżet&nbsp;&nbsp;</th>\n         <th data-priority="6">Typ&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
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
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['client_type_func']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n   </table>\n');
    
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
    
      __out.push('<div id="view-menu">\n    <fieldset data-role="controlgroup" data-type="horizontal" data-theme="b">\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\'>Odśwież</button>\n        <a href=\'/klienci/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left" >Dodaj</a>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option selected disabled>Akcja</option>\n            <option value="usun">Usuń</option>\n            <option value="drukuj" disabled>Drukuj</option>\n            <option value="eksport" disabled>Eksport do pliku</option>\n        </select>\n        <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="select-filter" id="select-filter">\n            <option selected disabled>Filtr</option>\n            <option value="">Wszyscy</option>\n            <option value="1">Kupujący</option>\n            <option value="2">Sprzedający</option>\n            <option value="3">Najemca</option>\n            <option value="4">Wynajmujący</option>\n        </select>\n    </fieldset>\n</div><!-- /grid-b -->\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/client_public_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a">\n     <thead>\n       <tr class=\'th-groups\'>\n         <th> <label> <input name="all" id="all" data-mini="true"  type="checkbox"> </label> </th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Imię&nbsp;&nbsp;</th>\n         <th data-priority="2">Nazwisko&nbsp;&nbsp;</th>\n         <th data-priority="2">Email&nbsp;&nbsp;</th>\n         <th data-priority="4">Telefon&nbsp;&nbsp;</th>\n         <th data-priority="5">Firma&nbsp;&nbsp;</th>\n         <th data-priority="6">Adres&nbsp;&nbsp;</th>\n         <th data-priority="6">Budżet&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
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
    
      __out.push('\n     </tbody>\n</table>\n');
    
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

;require.register("views/templates/export_list_view", function(exports, require, module) {
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
      var key, val, _ref;
    
      __out.push('<div id="view-menu">\n    <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n        <a href=\'/eksporty/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option selected disabled>Akcja</option>\n            <option value="usun">Usuń</option>\n        </select>\n        <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="select-filter" id="select-filter" data-filter=\'branch\'>\n            <option selected disabled>Oddziały</option>\n            <option value="">Wszystkie</option>\n            ');
    
      _ref = this.branches;
      for (key in _ref) {
        val = _ref[key];
        __out.push('\n            <option value="');
        __out.push(__sanitize(key));
        __out.push('">');
        __out.push(__sanitize(val));
        __out.push('</option>\n            ');
      }
    
      __out.push('\n        </select>\n    </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/export_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th data-priority="6">ID</th>\n         <th>Nazwa&nbsp;&nbsp;</th>\n         <th>Adres ftp&nbsp;&nbsp;</th>\n         <th>Oddział&nbsp;&nbsp;</th>\n         <th data-priority="2">Login&nbsp;&nbsp;</th>\n         <th data-priority="5">Data&nbsp;&nbsp;</th>\n         <th data-priority="5">Limit ofert&nbsp;&nbsp;</th>\n         <th data-priority="5">Aktywny&nbsp;&nbsp;</th>\n         <th><abbr title="Typ następnego eksportu">Rodzaj eksportu</abbr>&nbsp;&nbsp;</th>\n         <th><abbr title="Dodaj wszystkie oferty do tego eksportu">Zaznacz oferty</abbr>&nbsp;&nbsp;</th>\n         <th><abbr title="Usuń wszystkie oferty z tego eksportu">Odznacz oferty</abbr>&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n\n       <tr>\n         <td><label><input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true" type="checkbox"></label></td>\n         <td>');
        __out.push(__sanitize(item['id']));
        __out.push('</td>\n         <td><a href=\'/eksporty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(item['name']);
        __out.push('</a></td>\n         <td><a href=\'/eksporty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['address_ftp']));
        __out.push('</a></td>\n         <td><a href=\'/eksporty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['branch_func']));
        __out.push('</a></td>\n         <td><a href=\'/eksporty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['login']));
        __out.push('</a></td>\n         <td><a href=\'/eksporty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['date_created_func']));
        __out.push('</a></td>\n         <td>');
        __out.push(__sanitize(item['limit']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['is_active_func']));
        __out.push('</td>\n         <th><a href="#" class="ui-btn" id=\'set_full_export\' data-export=\'');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['next_export_func']));
        __out.push('</a></th>\n         <th><a href="#" class="ui-btn" id=\'select_all_for_export\' data-export=\'');
        __out.push(__sanitize(item['id']));
        __out.push('\'>Zaznacz oferty</a></th>\n         <th><a href="#" class="ui-btn" id=\'delete_all_for_export\' data-export=\'');
        __out.push(__sanitize(item['id']));
        __out.push('\'>Odznacz oferty</a></th>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n</table>\n');
    
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
    
      __out.push(' <div data-role="navbar">\n        <ul>\n            <li><button id="delete-button" class="ui-btn ui-btn-icon-top ui-icon-delete">Usuń</button></li>\n            <li><button id="save-button" class="ui-btn ui-btn-icon-top ui-icon-check" >Zapisz</button></li>\n            <li><button id="back-button" class="ui-btn ui-btn-icon-top ui-icon-back">Wróć</button></li>\n        </ul>\n    </div><!-- /navbar -->\n');
    
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
    
      __out.push('            <div style=\'padding:2px 8px 2px 8px\' >\n         <input id="filterTable-input" data-type="search" data-filter-placeholder="Find cars..." data-theme="a" data-filter-theme="a" data-inset="true" />\n            </div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/graphic_list_view", function(exports, require, module) {
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
    
      __out.push('<div id="view-menu">\n    <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n        <a href=\'/grafiki/dodaj\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option selected disabled>Akcja</option>\n            <option value="usun">Usuń</option>\n        </select>\n        <label for="select-filter" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="select-filter" id="select-filter" data-filter=\'image_type\'>\n            <option selected disabled>Filtr</option>\n            <option value="">Wszystko</option>\n            <option value="0">Logo</option>\n            <option value="1">Znak wodny</option>\n        </select>\n    </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/graphic_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input"  data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th>ID</th>\n         <th>Grafika&nbsp;&nbsp;</th>\n         <th>Oddział&nbsp;&nbsp;</th>\n         <th data-priority="2">Typ grafiki&nbsp;&nbsp;</th>\n         <th data-priority="2">Pozycja&nbsp;&nbsp;</th>\n         <th data-priority="4">Przeźroczystość&nbsp;&nbsp;</th>\n         <th data-priority="5">Aktywna&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
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
        __out.push(item['thumbnail_func']);
        __out.push('</td>\n         <td><a href=\'/grafiki/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['branch_func']));
        __out.push('</a></td>\n         <td><a href=\'/grafiki/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['image_type_func']));
        __out.push('</a></td>\n         <td><a href=\'/grafiki/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['position_func']));
        __out.push('</a></td>\n         <td><a href=\'/grafiki/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['opacity']));
        __out.push('%</a></td>\n         <td>');
        __out.push(__sanitize(item['is_active_func']));
        __out.push('</td>\n       </tr>\n      ');
      }
    
      __out.push('\n     </tbody>\n</table>\n');
    
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
    
      __out.push('    <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-left">\n        <a href=\'#left-panel\' class=\'ui-btn ui-icon-grid ui-btn-icon-left\' data-theme="b">Menu</a>\n        <button data-rel="popup" data-transition="pop" data-iconpos="notext" id=\'viewed-btn\' data-position-to="origin" class="ui-btn ui-btn-b ui-btn-inline ui-icon-eye ui-btn-icon-notext">Icon only</button>\n    </div>\n\n    <h1>Mobilny Pośrednik</h1>\n\n    <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">\n        <button data-rel="popup" data-transition="pop" data-iconpos="notext" id=\'account-status-btn\' data-position-to="origin" class="ui-btn ui-btn-b ui-btn-inline ui-icon-shop ui-btn-icon-notext">Icon only</button>\n        <button data-rel="popup" data-transition="pop" data-iconpos="notext" id=\'info-btn\' data-position-to="origin" class="ui-btn ui-btn-b ui-btn-inline ui-icon-info ui-btn-icon-notext">Icon only</button>\n        <button id=\'first-name-placeholder\' class="ui-btn ui-btn-b ui-btn-icon-right ui-icon-power"></button>\n    </div>\n');
    
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
      var item, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    
      __out.push('<ul data-role="listview" data-inset="true" data-divider-theme="a">\n<li data-role="list-divider">Ostatio Dodane</li>\n\n      ');
    
      _ref = this.latest;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n            <li><a href="#oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('">\n              ');
        __out.push(item['thumbnail_func']);
        __out.push('\n        <h3>');
        __out.push(__sanitize(item['remote_id']));
        __out.push(' ');
        __out.push(__sanitize(item['category_func']));
        __out.push('</h3>\n        <p>');
        __out.push(__sanitize(item['town']));
        __out.push(' ');
        __out.push(__sanitize(item['street']));
        __out.push(' ');
        __out.push(__sanitize(item['number']));
        __out.push('  ');
        __out.push(__sanitize(item['cena']));
        __out.push(__sanitize(item['waluta_func']));
        __out.push('</p>\n        <p class="ui-li-aside">Ostatnio wprowadzone</p>\n            <span class="ui-li-count">');
        __out.push(__sanitize(item['date_created_func']));
        __out.push('</span>\n            </a>\n            </li>\n      ');
      }
    
      __out.push('\n\n<li data-role="list-divider">Ostatnio Zmodyfikowane</li>\n\n      ');
    
      _ref1 = this.latest_modyfied;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        item = _ref1[_j];
        __out.push('\n            <li><a href="#oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('">\n              ');
        __out.push(item['thumbnail_func']);
        __out.push('\n        <h3>');
        __out.push(__sanitize(item['remote_id']));
        __out.push(' ');
        __out.push(__sanitize(item['category_func']));
        __out.push('</h3>\n        <p>');
        __out.push(__sanitize(item['town']));
        __out.push(' ');
        __out.push(__sanitize(item['street']));
        __out.push(' ');
        __out.push(__sanitize(item['number']));
        __out.push(' ');
        __out.push(__sanitize(item['cena']));
        __out.push(__sanitize(item['waluta_func']));
        __out.push('</p>\n        <p class="ui-li-aside">Ostatnia modyfikacja</p>\n            <span class="ui-li-count">');
        __out.push(__sanitize(item['date_modyfied_func']));
        __out.push('</span>\n            </a>\n            </li>\n      ');
      }
    
      __out.push('\n\n<li data-role="list-divider">Wymagające Odświerzenia</li>\n\n      ');
    
      _ref2 = this.update_needed;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        item = _ref2[_k];
        __out.push('\n            <li><a href="#oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('">\n              ');
        __out.push(item['thumbnail_func']);
        __out.push('\n        <h3>');
        __out.push(__sanitize(item['remote_id']));
        __out.push(' ');
        __out.push(__sanitize(item['category_func']));
        __out.push(' </h3>\n        <p>');
        __out.push(__sanitize(item['town']));
        __out.push(' ');
        __out.push(__sanitize(item['street']));
        __out.push(' ');
        __out.push(__sanitize(item['number']));
        __out.push('  ');
        __out.push(__sanitize(item['cena']));
        __out.push(__sanitize(item['waluta_func']));
        __out.push('</p>\n        <p class="ui-li-aside">Ostatnie odświerzenie</p>\n            <span class="ui-li-count">');
        __out.push(__sanitize(item['date_updated_func']));
        __out.push('</span>\n            </a>\n            </li>\n      ');
      }
    
      __out.push('\n\n<li data-role="list-divider">Status Eksportów</li>\n<li><a href="#eksporty">OK</a></li>\n</ul>\n');
    
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
    
      __out.push('<!-- ##################################  PANEL -->\n\n\t\t\t\t\t<ul data-role="listview" >\n\t\t\t\t\t\t<li data-icon="delete" > <a href="#header" data-rel="close">Zamknij menu</a> </li>\n\t\t\t\t\t\t<li data-icon="home" > <a href="/" >Początek</a> </li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="eye" data-expanded-icon="arrow-d">\n                    <h4>Przeglądaj oferty</h4>\n                    <ul data-role="listview" >\n                        <li><a href="/oferty?category=flat_rent"    >Mieszkania Wynajem</a></li>\n                        <li><a href="/oferty?category=flat_sell"    >Mieszkania Sprzedaż</a></li>\n                        <li><a href="/oferty?category=house_rent"    >Domy Wynajem</a></li>\n                        <li><a href="/oferty?category=house_sell"    >Domy Sprzedaż</a></li>\n                        <li><a href="/oferty?category=land_rent"    >Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty?category=land_sell"    >Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty?category=commercial_rent"    >Lokale Wynajem</a></li>\n                        <li><a href="/oferty?category=commercial_sell"    >Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty?category=warehouse_rent"    >Hale Wynajem</a></li>\n                        <li><a href="/oferty?category=warehouse_sell"   >Hale Sprzedaż</a></li>\n                        <li><a href="/oferty?category=object_rent"   >Obiekty Wynajem</a></li>\n                        <li><a href="/oferty?category=object_sell"   >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n                <div data-role="collapsible" data-inset="false"  data-collapsed-icon="plus" data-expanded-icon="arrow-d">\n                    <h4>Dodaj ofertę</h4>\n                    <ul data-role="listview">\n                        <li><a href="/oferty/dodaj?type=flat_rent"    >Mieszkania Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=flat_sell"    >Mieszkania Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=house_rent"    >Domy Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=house_sell"    >Domy Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=land_rent"    >Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty/dodaj?type=land_sell"    >Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=commercial_rent"    >Lokale Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=commercial_sell"    >Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=warehouse_rent"    >Hale Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=warehouse_sell"   >Hale Sprzedaż</a></li>\n                        <li><a href="/oferty/dodaj?type=object_rent"   >Obiekty Wynajem</a></li>\n                        <li><a href="/oferty/dodaj?type=object_sell"   >Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n                        <!--\n    <div data-role="collapsible" data-inset="false"  data-collapsed-icon="tag" data-expanded-icon="arrow-d">\n                    <h3>Etykiety</h3>\n                    <ul data-role="listview" >\n                        <li ><a href="" >Dodaj Etykietę</a></li>\n                        <li><a href="/oferty?status=4" >Robocze<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=3" >Archiwalne<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=1" >Nieaktywna<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=5" >Sprzedana<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=6" >Wynajęta<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty?status=7" >Umowa przedstępna<span class=\'ui-li-count\'>34</span></a> </li>\n                    </ul>\n                </div>\n                        -->\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="phone" data-expanded-icon="arrow-d">\n                    <h3>Kontrahenci</h3>\n                    <ul data-role="listview" >\n                        <li ><a href="/klienci/dodaj" >Dodaj Kontrahenta</a></li>\n                        <li ><a href="/klienci" >Moi</a></li>\n                        <li ><a href="/klienci-wspolni" >Wspólni</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="gear" data-expanded-icon="arrow-d">\n                    <h3>Ustawienia</h3>\n                    <ul data-role="listview" >\n                        <li ><a id=\'bon-config-link\' href="" >Dane Biura Nieruchomości</a></li>\n                        <li ><a id=\'agent-config-link\' href="" >Dane Profilu</a></li>\n                        <li ><a href="/agenci" >Agenci</a></li>\n                        <li ><a href="/oddzialy" >Oddziały</a></li>\n                        <li ><a href="/grafiki" >Logo/Znaki wodne</a></li>\n                        <!--\n                        <li ><a href="" >Importy</a></li>\n                        <li><a href="" >Portale zewnętrzne</a></li>\n                        -->\n                        <li ><a href="/eksporty" >Eksporty</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n   <!--\n   <div data-role="collapsible" data-inset="false" data-collapsed-icon="search" data-expanded-icon="arrow-d">\n                    <h3>Wyszukiwania</h3>\n                    <ul data-role="listview">\n                        <li data-role=\'list-divider\' >Portale Zewnętrzne </li>\n                        <li><a href="http://www.oferty.malopolska.pl/" target="_blank" >OfertyMałopolska</a></li>\n                        <li><a href="http://www.gumtree.pl/" target="_blank" >Gumtree</a></li>\n                        <li><a href="http://www.tablica.pl/" target="_blank" >Tablica</a></li>\n                        <li><a href="http://dom.gratka.pl/" target="_blank" >Gratka</a></li>\n                        <li><a href="http://www.domiporta.pl/" target="_blank" >Domiporta</a></li>\n                        <li><a href="http://alegratka.pl/nieruchomosci/" target="_blank" >AleGratka</a></li>\n                        <li><a href="http://www.krn.pl/" target="_blank" >KRN</a></li>\n                        <li><a href="http://www.morizon.pl/" target="_blank" >Morizon</a></li>\n                        <li><a href="http://www.szybko.pl/" target="_blank" >Szybko</a></li>\n                        <li><a href="http://nieruchomosci.multiple.pl" target="_blank" >Multiple</a></li>\n                        <li><a href="http://oferty.net" target="_blank" >OfertyNet</a></li>\n                        <li><a href="http://otodom.pl" target="_blank" >Otodom</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n   -->\n    <div data-role="collapsible" data-inset="false" data-collapsed-icon="location" data-expanded-icon="arrow-d">\n                    <h3>Narzędzia</h3>\n                    <ul data-role="listview" >\n                        <li><a href="https://www.google.com/calendar/" target="_blank" >Kalendarz</a></li>\n                        <li><a href="https://maps.google.com/" target="_blank" >MapyGoogle</a></li>\n                        <li><a href="http://www.openstreetmap.org" target="_blank" >OpenStreet</a></li>\n                        <li><a href="/iframe/kw" >Księgi wieczyste</a></li>\n                        <li><a href="http://maps.geoportal.gov.pl/webclient/" target="_blank" >Geoportal</a></li>\n                        <li><a href="http://mapy.geoportal.gov.pl/imap/?gpmap=gp0&actions=acShowWgPlot" target="_blank" >Wyszukaj działkę</a></li>\n                        <li><a href="http://planmieszkania.pl/" target="_blank">Plan mieszkania</a></li>\n                        <!--\n                        <li><a href="/iframe/calendar">Kalendarz</a></li>\n                        <li><a href="http://ekw.ms.gov.pl/pdcbdkw/pdcbdkw.html" target="_blank" >Księgi wieczyste</a></li>\n                        -->\n                        <li><a href="http://www.nieruchomosci.222.pl/kalkulator_oplat.html" target="_blank">Kalkulator kosztów</a></li>\n                        <!--\n                        <li><a href="http://pfrn.pl/" >PFRN</a></li>\n                        -->\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n\n<!-- ##################################  PANEL -->\n');
    
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

;require.register("views/templates/listing_list_view", function(exports, require, module) {
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
      var key, val, _ref, _ref1, _ref2;
    
      __out.push('<div id="view-menu">\n    <fieldset data-role="controlgroup" data-type="horizontal" data-theme=\'b\'>\n        <button data-icon="refresh" data-iconpos="notext" id=\'refresh\' >Odśwież</button>\n        <a href=\'/oferty/dodaj?type=');
    
      __out.push(__sanitize(this.listing_type));
    
      __out.push('\' class="ui-btn ui-icon-edit ui-btn-icon-left " >Dodaj</a>\n\n        <label for="select-action" class="ui-hidden-accessible ui-icon-action">Akcja</label>\n        <select name="select-action" id="select-action">\n            <option selected value=\'\'>Akcja</option>\n            <option value="wydruk-wewnetrzny">Wydruk wewnętrzyny</option>\n            <option value="wydruk-klienta">Wydruk dla klienta</option>\n            <option value="zmien_agenta">Zmień Agenta</option>\n            <option value="send-listing-client">Wyślij ofertę klientowi</option>\n            <option value="send-listing-address">Wyślij ofertę ...</option>\n            <option value="usun">Usuń</option>\n            <option value="eksport" disabled>Eksport do pliku</option>\n        </select>\n\n        <label for="status-query" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="status-query" id="status-query" data-query=\'status\'>\n            <option selected disabled>Status</option>\n            <option value="">Wszystkie</option>\n            <option value="1">Aktywne</option>\n            <option value="0">Nieaktywne</option>\n            <option value="2">Archiwalne</option>\n            <option value="3">Robocze</option>\n            <option value="4">Sprzedane</option>\n            <option value="5">Wynajęte</option>\n            <option value="6">Umowa przedwstępna</option>\n            <option value="7">Usunięte</option>\n        </select>\n\n        <label for="agent-query" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="agent-query" id="agent-query" data-query=\'agent\'>\n            <option selected disabled>Agent</option>\n            <option value="">Wszyscy</option>\n            ');
    
      _ref = this.agents;
      for (key in _ref) {
        val = _ref[key];
        __out.push('\n            <option value="');
        __out.push(__sanitize(key));
        __out.push('">');
        __out.push(__sanitize(val));
        __out.push('</option>\n            ');
      }
    
      __out.push('\n        </select>\n        <label for="client-query" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="client-query" id="client-query" data-query=\'client\'>\n            <option selected disabled>Klient</option>\n            <option value="">Wszyscy</option>\n            ');
    
      _ref1 = this.clients;
      for (key in _ref1) {
        val = _ref1[key];
        __out.push('\n            <option value="');
        __out.push(__sanitize(key));
        __out.push('">');
        __out.push(__sanitize(val));
        __out.push('</option>\n            ');
      }
    
      __out.push('\n        </select>\n        <label for="branch-query" class="ui-hidden-accessible ui-icon-user">Filtr</label>\n        <select name="branch-query" id="branch-query" data-query=\'branch\'>\n            <option selected disabled>Oddział</option>\n            <option value="">Wszystkie</option>\n            ');
    
      _ref2 = this.branches;
      for (key in _ref2) {
        val = _ref2[key];
        __out.push('\n            <option value="');
        __out.push(__sanitize(key));
        __out.push('">');
        __out.push(__sanitize(val));
        __out.push('</option>\n            ');
      }
    
      __out.push('\n        </select>\n\n            <input name="wylacznosc" id="wylacznosc" type="checkbox" data-filter=\'wylacznosc\'>\n                <label for="wylacznosc">Wyłączność</label>\n\n        <input name="radio-choice-b" id="radio-choice-c" value="pierwotny"  type="radio" data-filter=\'rynek_func\'>\n        <label for="radio-choice-c">Pierwotny</label>\n        <input name="radio-choice-b" id="radio-choice-d" value="wtórny" type="radio" data-filter=\'rynek_func\'>\n        <label for="radio-choice-d">Wtórny</label>\n\n    </fieldset>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/listing_list_view_items", function(exports, require, module) {
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
    
      __out.push('<table data-role="table" id="list-table" data-mode="columntoggle" class="tablesorter ui-responsive ui-shadow table-stroke table-stripe"\ndata-filter="true" data-input="#filterTable-input" data-column-btn-text="Wybierz kolumny" data-column-btn-theme="b" data-column-popup-theme="a" >\n     <thead>\n       <tr class=\'th-groups\'>\n         <th><label><input name="all" id="all" data-mini="true" type="checkbox"></label></th>\n         <th>Zdjęcie&nbsp;&nbsp;</th>\n         <th>ID</th>\n         <th>Agent&nbsp;&nbsp;</th>\n         <th>Adres&nbsp;&nbsp;</th>\n         <th data-priority="2">Klient&nbsp;&nbsp;</th>\n         <th data-priority="2">Cena&nbsp;&nbsp;</th>\n         <th data-priority="5"><abbr title="Powierzchnia całkowita">Pow. cał.</abbr>&nbsp;&nbsp;</th>\n         <th data-priority="4">Pok.&nbsp;&nbsp;</th>\n         <th data-priority="7"><abbr title="Piętro">Pt.</abbr>&nbsp;&nbsp;</th>\n         <th data-priority="6">Status&nbsp;&nbsp;</th>\n         <th data-priority="6">Rynek&nbsp;&nbsp;</th>\n         <th data-priority="6"><abbr title="Wyłączność">Wył.</abbr>&nbsp;&nbsp;</th>\n         <th data-priority="6"><abbr title="Ostatnia modyfikacja">Modyfi.</abbr>&nbsp;&nbsp;</th>\n         <th data-priority="6"><abbr title="Data wprowadzenia">Wprowadz.&nbsp;&nbsp;</th>\n       </tr>\n     </thead>\n     <tbody>\n      ');
    
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        __out.push('\n       <tr>\n         <td><label><input name="');
        __out.push(__sanitize(item['id']));
        __out.push('" id="');
        __out.push(__sanitize(item['id']));
        __out.push('" data-mini="true" type="checkbox"></label></td>\n         <td>');
        __out.push(item['thumbnail_func']);
        __out.push('</td>\n         <td><a href=\'/oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>');
        __out.push(__sanitize(item['remote_id']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['agent_func']));
        __out.push('</td>\n         <td><a href=\'/oferty/');
        __out.push(__sanitize(item['id']));
        __out.push('\'>\n            ');
        if (item['town']) {
          __out.push('\n                ');
          __out.push(__sanitize(item['town']));
          __out.push('\n            ');
        }
        __out.push('\n            ');
        if (item['street']) {
          __out.push('\n                ,');
          __out.push(__sanitize(item['street']));
          __out.push('\n            ');
        }
        __out.push('\n            ');
        if (item['number']) {
          __out.push('\n                &nbsp;');
          __out.push(__sanitize(item['number']));
          __out.push('\n            ');
        }
        __out.push('\n            ');
        if (item['street_district']) {
          __out.push('\n                ,');
          __out.push(__sanitize(item['street_district']));
          __out.push('\n            ');
        }
        __out.push('\n            </td>\n         <td>');
        __out.push(__sanitize(item['client_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['cena']));
        __out.push(__sanitize(item['waluta_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['powierzchnia_calkowita']));
        __out.push(' m2</td>\n         <td>');
        __out.push(__sanitize(item['liczba_pokoi']));
        __out.push(' pk</td>\n         <td>');
        __out.push(__sanitize(item['pietro']));
        __out.push(' pt</td>\n         <td>');
        __out.push(__sanitize(item['status_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['rynek_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['wylacznosc_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['date_created_func']));
        __out.push('</td>\n         <td>');
        __out.push(__sanitize(item['date_modyfied_func']));
        __out.push('</td>\n         <td style="display:none;" >');
        __out.push(__sanitize(item['tytul']));
        __out.push('</td>\n         <td style="display:none;" >');
        __out.push(__sanitize(item['opis']));
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
    
      __out.push('    <div data-role="header" data-theme="a">\n    <h1>Logowianie</h1>\n    </div>\n    <div role="main" class="ui-content">\n    <p class=\'login-error\'></p>\n    <form>\n            <input name="user" id="user" placeholder="Użytkownik" value="" type="text">\n            <input name="pass" id="pass" placeholder="Hasło" value="" type="password">\n            <a href=\'http://mobilnyposrednik.pl/rejestracja\' class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" >Rejestracja</a>&nbsp; &nbsp;\n            <button id="login-verification" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" >Zaloguj</button>\n    </div>\n');
    
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

;require.register("views/templates/popgeneric", function(exports, require, module) {
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
    
      __out.push('<p>Hi im popgeneric popup</p>\n');
    
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

;require.register("views/templates/viewed", function(exports, require, module) {
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
    
      __out.push('<p>Hi im viewed popup</p>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/viewed-view", function(exports, require, module) {
var View, ViewedView, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/viewed');

View = require('views/base/view');

module.exports = ViewedView = (function(_super) {

  __extends(ViewedView, _super);

  function ViewedView() {
    this.attach = __bind(this.attach, this);
    return ViewedView.__super__.constructor.apply(this, arguments);
  }

  ViewedView.prototype.template = template;

  ViewedView.prototype.containerMethod = 'html';

  ViewedView.prototype.id = 'viewed';

  ViewedView.prototype.attributes = {
    'data-role': 'popup',
    'data-theme': 'b',
    'data-position-to': 'window',
    'data-arrow': 'true'
  };

  ViewedView.prototype.className = 'ui-content';

  ViewedView.prototype.attach = function() {
    ViewedView.__super__.attach.apply(this, arguments);
    return this.publishEvent('log:info', 'HeaderView:attach()');
  };

  return ViewedView;

})(View);

});

;
//# sourceMappingURL=app.js.map