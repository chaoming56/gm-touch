"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var Path = _interopRequireWildcard(require("path"));

var _ = _interopRequireWildcard(require("lodash"));

var ReactDocgen = _interopRequireWildcard(require("react-docgen"));

var reactDocgenHandlers = _interopRequireWildcard(require("react-docgen/dist/handlers"));

var _actualNameHandler = _interopRequireDefault(require("./actualNameHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var defaultHandlers = Object.values(reactDocgenHandlers).map(function (handler) {
  return handler;
});

function _default(_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Program: {
        exit: function exit(path, state) {
          injectReactDocgenInfo(path, state, this.file.code, t);
        }
      }
    }
  };
}

function injectReactDocgenInfo(path, state, code, t) {
  var program = path.scope.getProgramParent().path;
  var docgenResults = [];

  try {
    var resolver = ReactDocgen.resolver.findAllExportedComponentDefinitions;

    if (state.opts.resolver) {
      resolver = ReactDocgen.resolver[state.opts.resolver];
    }

    var customHandlers = [];

    if (state.opts.handlers) {
      state.opts.handlers.forEach(function (handler) {
        customHandlers.push(require(handler));
      });
    }

    var filename = Path.relative('./', Path.resolve('./', path.hub.file.opts.filename));

    var handlers = [].concat(_toConsumableArray(defaultHandlers), customHandlers, [_actualNameHandler["default"]]);
    docgenResults = ReactDocgen.parse(code, resolver, handlers, {filename});

    if (state.opts.removeMethods) {
      docgenResults.forEach(function (docgenResult) {
        delete docgenResult.methods;
      });
    }
  } catch (e) {
    // this is for debugging the error only, do not ship this console log or else it pollutes the webpack output
    // console.log(e);
    return;
  }

  docgenResults.forEach(function (docgenResult, index) {
    var exportName = docgenResult.actualName; // If the result doesn't have an actualName,
    // it's probably on arrow functions.

    if (!exportName) {
      return;
    }

    var docNode = buildObjectExpression(docgenResult, t);
    var docgenInfo = t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier(exportName), t.identifier('__docgenInfo')), docNode));
    program.pushContainer('body', docgenInfo);
    injectDocgenGlobal(exportName, path, state, t);
  });
}

function injectDocgenGlobal(className, path, state, t) {
  var program = path.scope.getProgramParent().path;

  if (!state.opts.DOC_GEN_COLLECTION_NAME) {
    return;
  }

  var globalName = state.opts.DOC_GEN_COLLECTION_NAME;
  var filePath = Path.relative('./', Path.resolve('./', path.hub.file.opts.filename));
  var globalNode = t.ifStatement(t.binaryExpression('!==', t.unaryExpression('typeof', t.identifier(globalName)), t.stringLiteral('undefined')), t.blockStatement([t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(globalName), t.stringLiteral(filePath), true), t.objectExpression([t.objectProperty(t.identifier('name'), t.stringLiteral(className)), t.objectProperty(t.identifier('docgenInfo'), t.memberExpression(t.identifier(className), t.identifier('__docgenInfo'))), t.objectProperty(t.identifier('path'), t.stringLiteral(filePath))])))]));
  program.pushContainer('body', globalNode);
}

function buildObjectExpression(obj, t) {
  if (_.isPlainObject(obj)) {
    var children = [];

    for (var key in obj) {
      if (key === 'actualName') continue;
      if (!obj.hasOwnProperty(key) || _.isUndefined(obj[key])) continue;
      children.push(t.objectProperty(t.stringLiteral(key), buildObjectExpression(obj[key], t)));
    }

    return t.objectExpression(children);
  } else if (_.isString(obj)) {
    return t.stringLiteral(obj);
  } else if (_.isBoolean(obj)) {
    return t.booleanLiteral(obj);
  } else if (_.isNumber(obj)) {
    return t.numericLiteral(obj);
  } else if (_.isArray(obj)) {
    var _children = [];
    obj.forEach(function (val) {
      _children.push(buildObjectExpression(val, t));
    });
    return t.ArrayExpression(_children);
  } else if (_.isNull(obj)) {
    return t.nullLiteral();
  }
}
