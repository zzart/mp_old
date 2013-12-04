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
    mediator.t_conf = null;
    mediator.prev_t_conf = null;
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

Controller = require('controllers/base/controller');

HomePageView = require('views/home-page-view');

mediator = require('mediator');

module.exports = HomeController = (function(_super) {

  __extends(HomeController, _super);

  function HomeController() {
    return HomeController.__super__.constructor.apply(this, arguments);
  }

  HomeController.prototype.index = function() {
    this.publishEvent('log:info', 'controller:index');
    this.view_conf = {
      content: 'base_structure',
      footer: 'base_footer',
      nr_pages: 1
    };
    mediator.t_conf = this.view_conf;
    mediator.publish('view:init');
    this.publishEvent('log:debug', mediator);
    return this.view = new HomePageView();
  };

  HomeController.prototype.dispose = function() {
    return this.publishEvent('log:info', 'controller:index dispose ........');
  };

  return HomeController;

})(Controller);

});

;require.register("controllers/offer-list-controller", function(exports, require, module) {
var Collection, Controller, OfferListController, OfferListView, mediator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/base/controller');

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
    this.publishEvent('log:info', params);
    this.publishEvent('log:info', route);
    this.publishEvent('log:info', options);
    this.view_conf = {
      content: 'base_structure',
      footer: 'empty_footer',
      nr_pages: 1
    };
    mediator.t_conf = this.view_conf;
    mediator.publish('view:init');
    this.collection = new Collection;
    return this.collection.fetch({
      data: params,
      beforeSend: function() {
        return _this.publishEvent('loading_start');
      },
      success: function() {
        _this.publishEvent('log:info', "data with " + params + " fetched ok");
        _this.publishEvent('loading_stop');
        return _this.view = new OfferListView({
          collection: _this.collection,
          params: params
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
var Controller, MenuView, StructureController, StructureView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('controllers/base/controller');

StructureView = require('views/structure-view');

MenuView = require('views/menu-view');

module.exports = StructureController = (function(_super) {

  __extends(StructureController, _super);

  function StructureController() {
    return StructureController.__super__.constructor.apply(this, arguments);
  }

  StructureController.prototype.initialize = function() {
    StructureController.__super__.initialize.apply(this, arguments);
    this.structureview = new StructureView();
    return this.view = new MenuView();
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

  OfferList.prototype.url = 'http://localhost:8080/mp/oferty/?dev=1';

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

;require.register("models/schema-collection", function(exports, require, module) {
var Chaplin, Model, Schemas,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

Model = require('models/offer-list-model');

module.exports = Schemas = (function(_super) {

  __extends(Schemas, _super);

  function Schemas() {
    return Schemas.__super__.constructor.apply(this, arguments);
  }

  return Schemas;

})(Chaplin.Collection);

});

;require.register("models/schema-model", function(exports, require, module) {
var Chaplin, Schema,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Chaplin = require('chaplin');

module.exports = Schema = (function(_super) {

  __extends(Schema, _super);

  function Schema() {
    return Schema.__super__.constructor.apply(this, arguments);
  }

  Schema.prototype.url = 'http://localhost:8000/api/schema/';

  Schema.prototype.initialize = function() {
    return this.schema = false;
  };

  return Schema;

})(Chaplin.Model);

});

;require.register("routes", function(exports, require, module) {

module.exports = function(match) {
  match('', 'home#index');
  match('oferty/:typ', 'offer-list#show');
  match('oferty/:typ/:transakcja', 'offer-list#show');
  return match('dodaj_oferte', 'add-offer#show');
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

;require.register("views/footer-view", function(exports, require, module) {
var FooterView, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('views/templates/base_footer');

View = require('views/base/view');

module.exports = FooterView = (function(_super) {

  __extends(FooterView, _super);

  function FooterView() {
    this.render = __bind(this.render, this);
    return FooterView.__super__.constructor.apply(this, arguments);
  }

  FooterView.prototype.container = "[data-role='footer']";

  FooterView.prototype.containerMethod = "html";

  FooterView.prototype.attributes = {
    'data-role': 'footer'
  };

  FooterView.prototype.initialize = function(options) {
    FooterView.__super__.initialize.apply(this, arguments);
    if (options.footer) {
      return this.template = require('views/templates/' + options.footer);
    } else {
      return this.template = template;
    }
  };

  FooterView.prototype.render = function() {
    FooterView.__super__.render.apply(this, arguments);
    return this.publishEvent('log:info', 'footerView:render()');
  };

  return FooterView;

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
    this.dispose = __bind(this.dispose, this);

    this.getTemplateData = __bind(this.getTemplateData, this);

    this.render = __bind(this.render, this);
    return HomePageView.__super__.constructor.apply(this, arguments);
  }

  HomePageView.prototype.autoRender = true;

  HomePageView.prototype.container = "[data-role='content']";

  HomePageView.prototype.containerMethod = "html";

  HomePageView.prototype.template = template;

  HomePageView.prototype.render = function() {
    return this.publishEvent('log:info', 'home-page-view init');
  };

  HomePageView.prototype.getTemplateData = function() {
    return {
      title: 'test'
    };
  };

  HomePageView.prototype.dispose = function() {
    return this.publishEvent('log:info', 'home-page-view dispose()');
  };

  return HomePageView;

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

    this.jqm_menurender = __bind(this.jqm_menurender, this);

    this.jqm_init = __bind(this.jqm_init, this);

    this.log_error = __bind(this.log_error, this);

    this.log_warn = __bind(this.log_warn, this);

    this.log_info = __bind(this.log_info, this);

    this.log_debug = __bind(this.log_debug, this);

    this.server_error = __bind(this.server_error, this);

    this.jqm_loading_stop = __bind(this.jqm_loading_stop, this);

    this.jqm_loading_start = __bind(this.jqm_loading_start, this);
    return Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.initialize = function() {
    Layout.__super__.initialize.apply(this, arguments);
    this.log = log4javascript.getDefaultLogger();
    this.log.info('layout init');
    this.subscribeEvent('structureView:render', this.jqm_init);
    this.subscribeEvent('menu:render', this.jqm_menurender);
    this.subscribeEvent('index:render', this.jqm_init);
    this.subscribeEvent('offerlistview:render', this.jqm_refersh);
    this.subscribeEvent('addofferview:render', this.jqm_refersh);
    this.subscribeEvent('loading_start', this.jqm_loading_start);
    this.subscribeEvent('loading_stop', this.jqm_loading_stop);
    this.subscribeEvent('server_error', this.server_error);
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

  Layout.prototype.server_error = function() {
    return this.log.debug('server error');
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
      return $.mobile.loading('hide');
    });
  };

  Layout.prototype.jqm_menurender = function() {
    this.log.info('layout: event jqm_menurender caugth');
    return $("[data-role='panel']").panel('open');
  };

  Layout.prototype.jqm_refersh = function() {
    this.log.info('layout: event jqm_refresh caugth');
    return $("#index").enhanceWithin();
  };

  Layout.prototype.jqm_recreate = function() {};

  return Layout;

})(Chaplin.Layout);

});

;require.register("views/menu-view", function(exports, require, module) {
var MenuView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/base/view');

template = require('views/templates/menu');

module.exports = MenuView = (function(_super) {

  __extends(MenuView, _super);

  function MenuView() {
    return MenuView.__super__.constructor.apply(this, arguments);
  }

  MenuView.prototype.autoRender = true;

  MenuView.prototype.attributes = {
    'data-role': 'panel',
    'data-position': 'left',
    'data-position-fixed': 'true',
    'data-dismissible': 'false',
    'data-display': 'reveal',
    'data-theme': 'a'
  };

  MenuView.prototype.container = "[data-role='page']";

  MenuView.prototype.id = 'main-menu';

  MenuView.prototype.template = template;

  MenuView.prototype.render = function() {
    MenuView.__super__.render.apply(this, arguments);
    this.publishEvent('log:info', 'menuview: render()');
    return this.publishEvent('menu:render');
  };

  return MenuView;

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

    this.render = __bind(this.render, this);

    this.set_mediator = __bind(this.set_mediator, this);

    this.structure_change = __bind(this.structure_change, this);
    return StructureView.__super__.constructor.apply(this, arguments);
  }

  StructureView.prototype.autoRender = true;

  StructureView.prototype.container = "body";

  StructureView.prototype.containerMethod = 'html';

  StructureView.prototype.id = 'main-container';

  StructureView.prototype.template = template;

  StructureView.prototype.template_name = 'base_structure';

  StructureView.prototype.footer = 'base_footer';

  StructureView.prototype.pages = 1;

  StructureView.prototype.initialize = function() {
    StructureView.__super__.initialize.apply(this, arguments);
    this.template = template;
    return mediator.subscribe('view:init', this.structure_change);
  };

  StructureView.prototype.structure_change = function(options) {
    if (_.isEqual(mediator.t_conf, mediator.prev_t_conf)) {
      console.log('obj are equal so we will do noting');
    } else {
      this.publishEvent('log:info', 'doing some logic to figure out what is changed and rerender this');
      if (mediator.t_conf.footer !== mediator.prev_t_conf.footer) {
        this.footer = mediator.t_conf.footer;
        this.subview('footer', new FooterView({
          footer: this.footer
        }));
        this.subview('footer').render();
        this.set_mediator();
        return this.publishEvent('structureView:render');
      }
    }
  };

  StructureView.prototype.set_mediator = function() {
    return mediator.prev_t_conf = {
      content: this.template_name,
      footer: this.footer,
      nr_pages: this.pages
    };
  };

  StructureView.prototype.render = function() {
    return StructureView.__super__.render.apply(this, arguments);
  };

  StructureView.prototype.attach = function() {
    StructureView.__super__.attach.apply(this, arguments);
    this.publishEvent('log:info', 'structureView: attach()');
    this.subview('footer', new FooterView({
      footer: this.footer
    }));
    this.subview('footer').render();
    this.publishEvent('structureView:render');
    return this.set_mediator();
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

;require.register("views/templates/base_footer", function(exports, require, module) {
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
    
      __out.push('            <div data-role=\'page\' class="ui-responsive-panel" id=\'index\'>\n\n                 <div data-role=\'header\'>\n                    <a href=\'#main-menu\' data-icon=\'grid\' data-theme="b">Menu</a>\n                    <h1>Mobilny Pośrednik </h1>\n                    <div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">\n                        <a href="#info-popap" data-rel="popup" data-transition="pop" id=\'info-area\' class="ui-btn ui-btn-b ui-btn-inline ui-icon-info ui-btn-icon-notext">Icon only</a>\n                            <a href="#"  class="ui-btn ui-btn-b ui-btn-icon-right ui-icon-user">zzart</a>\n                    </div>\n                </div><!-- header -->\n\n                <div data-role=\'content\'>\n                        this is test contet of structure . replace me\n                </div><!-- content -->\n\n                <div data-role=\'footer\' data-position=\'fixed\' id=\'footer\'>\n                </div><!-- footer -->\n\n                <div id="info" data-role="popup" data-theme="b" data-position-to="window" class="ui-content">\n              ...Popup contents...\n                </div>\n\n            </div><!-- page -->\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
});

;require.register("views/templates/empty_footer", function(exports, require, module) {
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

;require.register("views/templates/header", function(exports, require, module) {
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
    
      __out.push('eco template <?= @ ?>\n<a class="header-link" href="test/">App tests</a>\n<a class="header-link" href="http://brunch.readthedocs.org/">Docs</a>\n\n');
    
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

;require.register("views/templates/menu", function(exports, require, module) {
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
    
      __out.push('<!-- ##################################  PANEL -->\n\n\n\t\t\t\t\t<ul data-role="listview" data-theme="b" data-divider-theme="b"   >\n\t\t\t\t\t\t<li data-icon="delete" >\n\t\t\t\t\t\t\t<a href="#" data-rel="close">Zamknij menu</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t<li data-icon="home" >\n\t\t\t\t\t\t\t<a href="/" >Początek</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t</ul>\n    <div data-role="collapsible-set" data-inset="false" data-theme="b" data-divider-theme="b" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">\n                  <div data-role="collapsible" >\n                    <h3>Przeglądaj oferty</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                        <li><a href="/oferty/robocze" data-panel="main">Robocze<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/archiwalne" data-panel="main">Archiwalne<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/mieszkania/wynajem" data-panel="main">Mieszkania Wynajem<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/mieszkania/sprzedaz" data-panel="main">Mieszkania Sprzedaż<span class=\'ui-li-count\'>34</span></a> </li>\n                        <li><a href="/oferty/domy/wynajem" data-panel="main">Domy Wynajem</a></li>\n                        <li><a href="/oferty/domy/sprzedaz" data-panel="main">Domy Sprzedaż</a></li>\n                        <li><a href="/oferty/grunty/wynajem" data-panel="main">Grunty Dzierżawa</a></li>\n                        <li><a href="/oferty/grunty/sprzedaz" data-panel="main">Grunty Sprzedaż</a></li>\n                        <li><a href="/oferty/lokale/wynajem" data-panel="main">Lokale Wynajem</a></li>\n                        <li><a href="/oferty/lokale/sprzedaz" data-panel="main">Lokale Sprzedaż</a></li>\n                        <li><a href="/oferty/lokale?/" data-panel="main">Lokale użytkowe Wynajem</a></li>\n                        <li><a href="/oferty/lokale?/" data-panel="main">Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="/oferty/obiekty/wynajem" data-panel="main">Obiekty Wynajem</a></li>\n                        <li><a href="/oferty/obiekty/sprzedaz" data-panel="main">Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n                <div data-role="collapsible">\n                    <h3>Dodaj ofertę</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                        <li><a href="dodaj_oferte?sch=1"    data-panel="main">Mieszkania Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=2"    data-panel="main">Mieszkania Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=3"    data-panel="main">Domy Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=4"    data-panel="main">Domy Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=5"    data-panel="main">Grunty Dzierżawa</a></li>\n                        <li><a href="dodaj_oferte?sch=6"    data-panel="main">Grunty Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=7"    data-panel="main">Lokale Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=8"    data-panel="main">Lokale Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=9"    data-panel="main">Lokale użytkowe Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=10"   data-panel="main">Lokale użytkowe Sprzedaż</a></li>\n                        <li><a href="dodaj_oferte?sch=11"   data-panel="main">Obiekty Wynajem</a></li>\n                        <li><a href="dodaj_oferte?sch=12"   data-panel="main">Obiekty Sprzedaż</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n                  <div data-role="collapsible" >\n                    <h3>Etykiety</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                    </ul>\n                </div>\n\n                  <div data-role="collapsible" >\n                    <h3>Ustawienia</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                        <li><a href="" data-panel="main">Dodaj Etykietę</a></li>\n                        <li><a href="" data-panel="main">Zmień Hasło</a></li>\n                        <li><a href="" data-panel="main">Dane Profilu</a></li>\n                        <li><a href="" data-panel="main">Dane Biura Nieruchomości</a></li>\n                        <li><a href="" data-panel="main">Logo</a></li>\n                        <li><a href="" data-panel="main">Watermark</a></li>\n                        <li><a href="" data-panel="main">Importy</a></li>\n                        <li><a href="" data-panel="main">Eksporty</a></li>\n                        <li><a href="" data-panel="main">Portale zewnętrzne</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n                  <div data-role="collapsible" >\n                    <h3>Wyszukiwania</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                        <li><a href="" data-panel="main">Wyszukiwanie Zaawansowane</a></li>\n                        <li data-role=\'list-divider\' >Portale Zewnętrzne </li>\n                        <li><a href="" data-panel="main">Gumtree</a></li>\n                        <li><a href="" data-panel="main">aleGratka</a></li>\n                        <li><a href="" data-panel="main">Tablica</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n                  <div data-role="collapsible" >\n                    <h3>Kontrahenci</h3>\n                    <ul data-role="listview" data-theme="b" data-divider-theme="b">\n                        <li><a href="" data-panel="main">Dodaj Kontrahenta</a></li>\n                        <li><a href="" data-panel="main">Sprzedający</a></li>\n                        <li><a href="" data-panel="main">Kupujący</a></li>\n                        <li><a href="" data-panel="main">Wynajmujący</a></li>\n                        <li><a href="" data-panel="main">Szukający</a></li>\n                        <li data-role=\'list-divider\' > </li>\n                    </ul>\n                </div>\n\n\n<!-- ##################################  PANEL -->\n');
    
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