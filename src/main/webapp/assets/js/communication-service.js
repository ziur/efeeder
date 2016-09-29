(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CommunicationService = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    var avro = require('avro-js');

    module.exports = CommunicationService;

  CommunicationService.avro = avro;
    function CommunicationService() {
        this.socket = null;
    }

    var MESSAGE_CONTEXT_SCHEMA =
    {
      "namespace": "org.jala.efeeder.servlets.websocket.avro",
      "type": "record",
      "name": "MessageContext",
      "alias": "MessageContext",
      "fields": [
        {
          "name": "user",
          "type": "int"
        },
        {
          "name": "room",
          "type": "int"
        },
        {
          "name": "command",
          "type": ["string", "null"], "default": ""
        },
        {
          "name": "events",
          "type": {
            "type": "array",
            "items": {
              "namespace": "org.jala.efeeder.servlets.websocket.avro",
              "type": "record",
              "name": "MessageEvent",
              "alias": "MessageEvent",
              "fields": [
                {
                  "name": "event",
                  "type": [
                    {
                      "namespace": "org.jala.efeeder.servlets.websocket.avro",
                      "type": "record",
                      "name": "WelcomeEvent",
                      "alias": "WelcomeEvent",
                      "fields": [
                      ]
                    },
                    {
                      "namespace": "org.jala.efeeder.servlets.websocket.avro",
                      "type": "record",
                      "name": "CloseVotingEvent",
                      "alias": "CloseVotingEvent",
                      "fields": [
                      ]
                    },
                    {
                      "namespace": "org.jala.efeeder.servlets.websocket.avro",
                      "type": "record",
                      "name": "RaffleEvent",
                      "alias": "RaffleEvent",
                      "fields": [
                        {
                          "name": "chosen",
                          "type": "int"
                        },
                        {
                          "name": "items",
                          "type": {"type": "array", "items": "string"}
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    };

    var MessageContextType = avro.parse(MESSAGE_CONTEXT_SCHEMA);

  CommunicationService.prototype.serialize = function (message) {
      var event = MessageContextType.clone(message,  {wrapUnions:true});
      return event;
    };

    CommunicationService.prototype.deserialize = function (message) {
        return MessageContextType.fromBuffer(message);
    };

  CommunicationService.prototype.onMessage = function (fn) {
    this.onMessageFn = fn;
  };

    CommunicationService.prototype.connect = function (host, foodMeeting, onOpen) {
        var hostUrl = host + "?roomId=" + foodMeeting;
        this.socket = new WebSocket(hostUrl);
        var socket = this.socket;
        var self = this;
        socket.onopen = function (event) {
            if(event.data === undefined)
                return;
            console.log("WebSocket connection opened." + event.data);
          if (onOpen) {
            onOpen(convertMessage(event.data));
          }

        };
        socket.onclose = function (event) {
            console.log("WebSocket connection closed." + event.data);
        };

        socket.onmessage = function (event) {
            self.onMessageFn(convertMessage(event.data));
        };

        var convertMessage = function(message){
          var json = JSON.parse(message);
          return self.serialize(json);
      }
    };

  CommunicationService.prototype.sendMessage = function(message) {
    var obj = this.serialize(message);
    obj = JSON.stringify(obj);
    this.socket.send(obj);
  };

},{"avro-js":2}],2:[function(require,module,exports){
(function (Buffer){
/* jshint browserify: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

/**
 * Shim entry point used when `avro` is `require`d from browserify.
 *
 * It doesn't expose any of the filesystem methods and patches a few others.
 *
 */

var Tap = require('../../lib/utils').Tap,
    schemas = require('../../lib/schemas'),
    deprecated = require('../deprecated/validator');


function parse(schema, opts) {
  var obj;
  if (typeof schema == 'string') {
    try {
      obj = JSON.parse(schema);
    } catch (err) {
      // Pass. No file reading from the browser.
    }
  }
  if (obj === undefined) {
    obj = schema;
  }
  return schemas.createType(obj, opts);
}

// No utf8 and binary functions on browserify's `Buffer`, we must patch in the
// generic slice and write equivalents.

Tap.prototype.readString = function () {
  var len = this.readLong();
  var pos = this.pos;
  var buf = this.buf;
  this.pos += len;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.slice(pos, pos + len).toString();
};

Tap.prototype.writeString = function (s) {
  var len = Buffer.byteLength(s);
  this.writeLong(len);
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.write(s, pos);
};

Tap.prototype.writeBinary = function (s, len) {
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.write(s, pos, len, 'binary');
};


module.exports = {
  parse: parse,
  types: schemas.types,
  Validator: deprecated.Validator,
  ProtocolValidator: deprecated.ProtocolValidator
};

}).call(this,require("buffer").Buffer)
},{"../../lib/schemas":5,"../../lib/utils":6,"../deprecated/validator":4,"buffer":9}],3:[function(require,module,exports){
/* jshint browserify: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

/**
 * Shim to disable schema fingerprint computation.
 *
 */

function createHash() {
  throw new Error('fingerprinting not supported in the browser');
}


module.exports = {
  createHash: createHash
};

},{}],4:[function(require,module,exports){
// Licensed to the Apache Software Foundation (ASF) under one or more
// contributor license agreements.  See the NOTICE file distributed with
// this work for additional information regarding copyright ownership.
// The ASF licenses this file to You under the Apache License, Version 2.0
// (the "License"); you may not use this file except in compliance with
// the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _ = require("underscore"),
    util = require('util');

var WARNING = 'Validator API is deprecated. Please use the type API instead.';
Validator = util.deprecate(Validator, WARNING);
ProtocolValidator = util.deprecate(ProtocolValidator, WARNING);

var AvroSpec = {
  PrimitiveTypes: ['null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string'],
  ComplexTypes: ['record', 'enum', 'array', 'map', 'union', 'fixed']
};
AvroSpec.Types = AvroSpec.PrimitiveTypes.concat(AvroSpec.ComplexTypes);

var InvalidSchemaError = function(msg) { return new Error('InvalidSchemaError: ' + msg); };
var InvalidProtocolError = function(msg) { return new Error('InvalidProtocolError: ' + msg); };
var ValidationError = function(msg) { return new Error('ValidationError: ' + msg); };
var ProtocolValidationError = function(msg) { return new Error('ProtocolValidationError: ' + msg); };


function Record(name, namespace, fields) {
  function validateArgs(name, namespace, fields) {
    if (!_.isString(name)) {
      throw new InvalidSchemaError('Record name must be string');
    }

    if (!_.isNull(namespace) && !_.isUndefined(namespace) && !_.isString(namespace)) {
      throw new InvalidSchemaError('Record namespace must be string or null');
    }

    if (!_.isArray(fields)) {
      throw new InvalidSchemaError('Record name must be string');
    }
  }

  validateArgs(name, namespace, fields);

  this.name = name;
  this.namespace = namespace;
  this.fields = fields;
}

function makeFullyQualifiedTypeName(schema, namespace) {
  var typeName = null;
  if (_.isString(schema)) {
    typeName = schema;
  } else if (_.isObject(schema)) {
    if (_.isString(schema.namespace)) {
      namespace = schema.namespace;
    }
    if (_.isString(schema.name)) {
      typeName = schema.name;
    } else if (_.isString(schema.type)) {
      typeName = schema.type;
    }
  } else {
    throw new InvalidSchemaError('unable to determine fully qualified type name from schema ' + JSON.stringify(schema) + ' in namespace ' + namespace);
  }

  if (!_.isString(typeName)) {
    throw new InvalidSchemaError('unable to determine type name from schema ' + JSON.stringify(schema) + ' in namespace ' + namespace);
  }

  if (typeName.indexOf('.') !== -1) {
    return typeName;
  } else if (_.contains(AvroSpec.PrimitiveTypes, typeName)) {
    return typeName;
  } else if (_.isString(namespace)) {
    return namespace + '.' + typeName;
  } else {
    return typeName;
  }
}

function Union(typeSchemas, namespace) {
  this.branchNames = function() {
    return _.map(typeSchemas, function(typeSchema) { return makeFullyQualifiedTypeName(typeSchema, namespace); });
  };

  function validateArgs(typeSchemas) {
    if (!_.isArray(typeSchemas) || _.isEmpty(typeSchemas)) {
      throw new InvalidSchemaError('Union must have at least 1 branch');
    }
  }

  validateArgs(typeSchemas);

  this.typeSchemas = typeSchemas;
  this.namespace = namespace;
}

function Enum(symbols) {

  function validateArgs(symbols) {
    if (!_.isArray(symbols)) {
      throw new InvalidSchemaError('Enum must have array of symbols, got ' + JSON.stringify(symbols));
    }
    if (!_.all(symbols, function(symbol) { return _.isString(symbol); })) {
      throw new InvalidSchemaError('Enum symbols must be strings, got ' + JSON.stringify(symbols));
    }
  }

  validateArgs(symbols);

  this.symbols = symbols;
}

function AvroArray(itemSchema) {

  function validateArgs(itemSchema) {
    if (_.isNull(itemSchema) || _.isUndefined(itemSchema)) {
      throw new InvalidSchemaError('Array "items" schema should not be null or undefined');
    }
  }

  validateArgs(itemSchema);

  this.itemSchema = itemSchema;
}

function Map(valueSchema) {

  function validateArgs(valueSchema) {
    if (_.isNull(valueSchema) || _.isUndefined(valueSchema)) {
      throw new InvalidSchemaError('Map "values" schema should not be null or undefined');
    }
  }

  validateArgs(valueSchema);

  this.valueSchema = valueSchema;
}

function Field(name, schema) {
  function validateArgs(name, schema) {
    if (!_.isString(name)) {
      throw new InvalidSchemaError('Field name must be string');
    }
  }

  this.name = name;
  this.schema = schema;
}

function Primitive(type) {
  function validateArgs(type) {
    if (!_.isString(type)) {
      throw new InvalidSchemaError('Primitive type name must be a string');
    }

    if (!_.contains(AvroSpec.PrimitiveTypes, type)) {
      throw new InvalidSchemaError('Primitive type must be one of: ' + JSON.stringify(AvroSpec.PrimitiveTypes) + '; got ' + type);
    }
  }

  validateArgs(type);

  this.type = type;
}

function Validator(schema, namespace, namedTypes) {
  this.validate = function(obj) {
    return _validate(this.schema, obj);
  };

  var _validate = function(schema, obj) {
    if (schema instanceof Record) {
      return _validateRecord(schema, obj);
    } else if (schema instanceof Union) {
      return _validateUnion(schema, obj);
    } else if (schema instanceof Enum) {
      return _validateEnum(schema, obj);
    } else if (schema instanceof AvroArray) {
      return _validateArray(schema, obj);
    } else if (schema instanceof Map) {
      return _validateMap(schema, obj);
    } else if (schema instanceof Primitive) {
      return _validatePrimitive(schema, obj);
    } else {
      throw new InvalidSchemaError('validation not yet implemented: ' + JSON.stringify(schema));
    }
  };

  var _validateRecord = function(schema, obj) {
    if (!_.isObject(obj) || _.isArray(obj)) {
      throw new ValidationError('Expected record Javascript type to be non-array object, got ' + JSON.stringify(obj));
    }

    var schemaFieldNames = _.pluck(schema.fields, 'name').sort();
    var objFieldNames = _.keys(obj).sort();
    if (!_.isEqual(schemaFieldNames, objFieldNames)) {
      throw new ValidationError('Expected record fields ' + JSON.stringify(schemaFieldNames) + '; got ' + JSON.stringify(objFieldNames));
    }

    return _.all(schema.fields, function(field) {
      return _validate(field.schema, obj[field.name]);
    });
  };

  var _validateUnion = function(schema, obj) {
    if (_.isObject(obj)) {
      if (_.isArray(obj)) {
        throw new ValidationError('Expected union Javascript type to be non-array object (or null), got ' + JSON.stringify(obj));
      } else if (_.size(obj) !== 1) {
        throw new ValidationError('Expected union Javascript object to be object with exactly 1 key (or null), got ' + JSON.stringify(obj));
      } else {
        var unionBranch = _.keys(obj)[0];
        if (unionBranch === "") {
          throw new ValidationError('Expected union Javascript object to contain non-empty string branch, got ' + JSON.stringify(obj));
        }
        if (_.contains(schema.branchNames(), unionBranch)) {
          return true;
        } else {
          throw new ValidationError('Expected union branch to be one of ' + JSON.stringify(schema.branchNames()) + '; got ' + JSON.stringify(unionBranch));
        }
      }
    } else if (_.isNull(obj)) {
      if (_.contains(schema.branchNames(), 'null')) {
        return true;
      } else {
        throw new ValidationError('Expected union branch to be one of ' + JSON.stringify(schema.branchNames()) + '; got ' + JSON.stringify(obj));
      }
    } else {
      throw new ValidationError('Expected union Javascript object to be non-array object of size 1 or null, got ' + JSON.stringify(obj));
    }
  };

  var _validateEnum = function(schema, obj) {
    if (_.isString(obj)) {
      if (_.contains(schema.symbols, obj)) {
        return true;
      } else {
        throw new ValidationError('Expected enum value to be one of ' + JSON.stringify(schema.symbols) + '; got ' + JSON.stringify(obj));
      }
    } else {
      throw new ValidationError('Expected enum Javascript object to be string, got ' + JSON.stringify(obj));
    }
  };

  var _validateArray = function(schema, obj) {
    if (_.isArray(obj)) {
      return _.all(obj, function(member) { return _validate(schema.itemSchema, member); });
    } else {
      throw new ValidationError('Expected array Javascript object to be array, got ' + JSON.stringify(obj));
    }
  };

  var _validateMap = function(schema, obj) {
    if (_.isObject(obj) && !_.isArray(obj)) {
      return _.all(obj, function(value) { return _validate(schema.valueSchema, value); });
    } else if (_.isArray(obj)) {
      throw new ValidationError('Expected map Javascript object to be non-array object, got array ' + JSON.stringify(obj));
    } else {
      throw new ValidationError('Expected map Javascript object to be non-array object, got ' + JSON.stringify(obj));
    }
  };

  var _validatePrimitive = function(schema, obj) {
    switch (schema.type) {
      case 'null':
        if (_.isNull(obj) || _.isUndefined(obj)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript null or undefined for Avro null, got ' + JSON.stringify(obj));
        }
        break;
      case 'boolean':
        if (_.isBoolean(obj)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript boolean for Avro boolean, got ' + JSON.stringify(obj));
        }
        break;
      case 'int':
        if (_.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 31)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript int32 number for Avro int, got ' + JSON.stringify(obj));
        }
        break;
      case 'long':
        if (_.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 63)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript int64 number for Avro long, got ' + JSON.stringify(obj));
        }
        break;
      case 'float':
        if (_.isNumber(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript float number for Avro float, got ' + JSON.stringify(obj));
        }
        break;
      case 'double':
        if (_.isNumber(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript double number for Avro double, got ' + JSON.stringify(obj));
        }
        break;
      case 'bytes':
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      case 'string':
        if (_.isString(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript string for Avro string, got ' + JSON.stringify(obj));
        }
        break;
      default:
        throw new InvalidSchemaError('unrecognized primitive type: ' + schema.type);
    }
  };

  // TODO: namespace handling is rudimentary. multiple namespaces within a certain nested schema definition
  // are probably buggy.
  var _namedTypes = namedTypes || {};
  var _saveNamedType = function(fullyQualifiedTypeName, schema) {
    if (_.has(_namedTypes, fullyQualifiedTypeName)) {
      if (!_.isEqual(_namedTypes[fullyQualifiedTypeName], schema)) {
        throw new InvalidSchemaError('conflicting definitions for type ' + fullyQualifiedTypeName + ': ' + JSON.stringify(_namedTypes[fullyQualifiedTypeName]) + ' and ' + JSON.stringify(schema));
      }
    } else {
      _namedTypes[fullyQualifiedTypeName] = schema;
    }
  };

  var _lookupTypeByFullyQualifiedName = function(fullyQualifiedTypeName) {
    if (_.has(_namedTypes, fullyQualifiedTypeName)) {
      return _namedTypes[fullyQualifiedTypeName];
    } else {
      return null;
    }
  };

  var _parseNamedType = function(schema, namespace) {
    if (_.contains(AvroSpec.PrimitiveTypes, schema)) {
      return new Primitive(schema);
    } else if (!_.isNull(_lookupTypeByFullyQualifiedName(makeFullyQualifiedTypeName(schema, namespace)))) {
      return _lookupTypeByFullyQualifiedName(makeFullyQualifiedTypeName(schema, namespace));
    } else {
      throw new InvalidSchemaError('unknown type name: ' + JSON.stringify(schema) + '; known type names are ' + JSON.stringify(_.keys(_namedTypes)));
    }
  };

  var _parseSchema = function(schema, parentSchema, namespace) {
    if (_.isNull(schema) || _.isUndefined(schema)) {
      throw new InvalidSchemaError('schema is null, in parentSchema: ' + JSON.stringify(parentSchema));
    } else if (_.isString(schema)) {
      return _parseNamedType(schema, namespace);
    } else if (_.isObject(schema) && !_.isArray(schema)) {
      if (schema.type === 'record') {
        var newRecord = new Record(schema.name, schema.namespace, _.map(schema.fields, function(field) {
          return new Field(field.name, _parseSchema(field.type, schema, schema.namespace || namespace));
        }));
        _saveNamedType(makeFullyQualifiedTypeName(schema, namespace), newRecord);
        return newRecord;
      } else if (schema.type === 'enum') {
        if (_.has(schema, 'symbols')) {
          var newEnum = new Enum(schema.symbols);
          _saveNamedType(makeFullyQualifiedTypeName(schema, namespace), newEnum);
          return newEnum;
        } else {
          throw new InvalidSchemaError('enum must specify symbols, got ' + JSON.stringify(schema));
        }
      } else if (schema.type === 'array') {
        if (_.has(schema, 'items')) {
          return new AvroArray(_parseSchema(schema.items, schema, namespace));
        } else {
          throw new InvalidSchemaError('array must specify "items" schema, got ' + JSON.stringify(schema));
        }
      } else if (schema.type === 'map') {
        if (_.has(schema, 'values')) {
          return new Map(_parseSchema(schema.values, schema, namespace));
        } else {
          throw new InvalidSchemaError('map must specify "values" schema, got ' + JSON.stringify(schema));
        }
      } else if (_.has(schema, 'type') && _.contains(AvroSpec.PrimitiveTypes, schema.type)) {
        return _parseNamedType(schema.type, namespace);
      } else {
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      }
    } else if (_.isArray(schema)) {
      if (_.isEmpty(schema)) {
        throw new InvalidSchemaError('unions must have at least 1 branch');
      }
      var branchTypes = _.map(schema, function(branchType) { return _parseSchema(branchType, schema, namespace); });
      return new Union(branchTypes, namespace);
    } else {
      throw new InvalidSchemaError('unexpected Javascript type for schema: ' + (typeof schema));
    }
  };

  this.rawSchema = schema;
  this.schema = _parseSchema(schema, null, namespace);
}

Validator.validate = function(schema, obj) {
  return (new Validator(schema)).validate(obj);
}

function ProtocolValidator(protocol) {
  this.validate = function(typeName, obj) {
    var fullyQualifiedTypeName = makeFullyQualifiedTypeName(typeName, protocol.namespace);
    if (!_.has(_typeSchemaValidators, fullyQualifiedTypeName)) {
      throw new ProtocolValidationError('Protocol does not contain definition for type ' + JSON.stringify(fullyQualifiedTypeName) + ' (fully qualified from input "' + typeName + '"); known types are ' + JSON.stringify(_.keys(_typeSchemaValidators)));
    }
    return _typeSchemaValidators[fullyQualifiedTypeName].validate(obj);
  };

  var _typeSchemaValidators = {};
  var _initSchemaValidators = function(protocol) {
    var namedTypes = {};
    if (!_.has(protocol, 'protocol') || !_.isString(protocol.protocol)) {
      throw new InvalidProtocolError('Protocol must contain a "protocol" attribute with a string value');
    }
    if (_.isArray(protocol.types)) {
      _.each(protocol.types, function(typeSchema) {
        var schemaValidator = new Validator(typeSchema, protocol.namespace, namedTypes);
        var fullyQualifiedTypeName = makeFullyQualifiedTypeName(typeSchema, protocol.namespace);
        _typeSchemaValidators[fullyQualifiedTypeName] = schemaValidator;
      });
    }
  };

  _initSchemaValidators(protocol);
}

ProtocolValidator.validate = function(protocol, typeName, obj) {
  return (new ProtocolValidator(protocol)).validate(typeName, obj);
};

if (typeof exports !== 'undefined') {
  exports['Validator'] = Validator;
  exports['ProtocolValidator'] = ProtocolValidator;
}

},{"underscore":7,"util":15}],5:[function(require,module,exports){
(function (Buffer){
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

var utils = require('./utils'),
    buffer = require('buffer'), // For `SlowBuffer`.
    crypto = require('crypto'),
    util = require('util');

// Convenience imports.
var Tap = utils.Tap;
var f = util.format;

// All Avro types.
var TYPES = {
  'array': ArrayType,
  'boolean': BooleanType,
  'bytes': BytesType,
  'double': DoubleType,
  'enum': EnumType,
  'error': RecordType,
  'fixed': FixedType,
  'float': FloatType,
  'int': IntType,
  'long': LongType,
  'map': MapType,
  'null': NullType,
  'record': RecordType,
  'string': StringType,
  'union': UnionType
};

// Valid (field, type, and symbol) name regex.
var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Random generator.
var RANDOM = new utils.Lcg();

// Encoding tap (shared for performance).
var TAP = new Tap(new buffer.SlowBuffer(1024));

// Path prefix for validity checks (shared for performance).
var PATH = [];

// Currently active logical type, used for name redirection.
var LOGICAL_TYPE = null;


/**
 * Schema parsing entry point.
 *
 * It isn't exposed directly but called from `parse` inside `index.js` (node)
 * or `avro.js` (browserify) which each add convenience functionality.
 *
 */
function createType(attrs, opts) {
  if (attrs instanceof Type) {
    return attrs;
  }

  opts = getOpts(attrs, opts);

  var type;
  if (typeof attrs == 'string') { // Type reference.
    if (opts.namespace && !~attrs.indexOf('.') && !isPrimitive(attrs)) {
      attrs = opts.namespace + '.' + attrs;
    }
    type = opts.registry[attrs];
    if (type) {
      // Type was already defined, return it.
      return type;
    }
    if (isPrimitive(attrs)) {
      // Reference to a primitive type. These are also defined names by default
      // so we create the appropriate type and it to the registry for future
      // reference.
      return opts.registry[attrs] = createType({type: attrs}, opts);
    }
    throw new Error(f('undefined type name: %s', attrs));
  }

  if (opts.typeHook && (type = opts.typeHook(attrs, opts))) {
    if (!(type instanceof Type)) {
      throw new Error(f('invalid typehook return value: %j', type));
    }
    return type;
  }

  if (attrs.logicalType && !LOGICAL_TYPE) {
    var DerivedType = opts.logicalTypes[attrs.logicalType];
    if (DerivedType) {
      var registry = {};
      Object.keys(opts.registry).forEach(function (key) {
        registry[key] = opts.registry[key];
      });
      try {
        return new DerivedType(attrs, opts);
      } catch (err) {
        if (opts.assertLogicalTypes) {
          throw err;
        }
        LOGICAL_TYPE = null;
        opts.registry = registry; // In case any names were registered.
      }
    }
  }

  if (attrs instanceof Array) { // Union.
    type = new UnionType(attrs, opts);
  } else { // New type definition.
    type = (function (typeName) {
      var Type = TYPES[typeName];
      if (Type === undefined) {
        throw new Error(f('unknown type: %j', typeName));
      }
      return new Type(attrs, opts);
    })(attrs.type);
  }
  return type;
}

/**
 * "Abstract" base Avro type class.
 *
 * This class' constructor will register any named types to support
 * recursive schemas.
 *
 * All type values are represented in memory similarly to their JSON
 * representation, except for `bytes` and `fixed` which are represented as
 * `Buffer`s. See individual subclasses for details.
 *
 */
function Type(registry) {
  var name = this._name;
  var type = LOGICAL_TYPE || this;
  LOGICAL_TYPE = null;

  if (registry === undefined || name === undefined) {
    return;
  }

  var prev = registry[name];
  if (prev !== undefined) {
    throw new Error(f('duplicate type name: %s', name));
  }
  registry[name] = type;
}

Type.__reset = function (size) { TAP.buf = new buffer.SlowBuffer(size); };

Type.prototype.createResolver = function (type, opts) {
  if (!(type instanceof Type)) {
    // More explicit error message than the "incompatible type" thrown
    // otherwise (especially because of the overridden `toJSON` method).
    throw new Error(f('not a type: %j', type));
  }

  if (type instanceof LogicalType && !(this instanceof LogicalType)) {
    // Trying to read a logical type as a built-in: unwrap the logical type.
    return this.createResolver(type._underlyingType, opts);
  }

  opts = opts || {};
  opts.registry = opts.registry || {};

  var resolver, key;
  if (this instanceof RecordType && type instanceof RecordType) {
    key = this._name + ':' + type._name; // ':' is illegal in Avro type names.
    resolver = opts.registry[key];
    if (resolver) {
      return resolver;
    }
  }

  resolver = new Resolver(this);
  if (key) { // Register resolver early for recursive schemas.
    opts.registry[key] = resolver;
  }

  if (type instanceof UnionType) {
    var resolvers = type._types.map(function (t) {
      return this.createResolver(t, opts);
    }, this);
    resolver._read = function (tap) {
      var index = tap.readLong();
      var resolver = resolvers[index];
      if (resolver === undefined) {
        throw new Error(f('invalid union index: %s', index));
      }
      return resolvers[index]._read(tap);
    };
  } else {
    this._updateResolver(resolver, type, opts);
  }

  if (!resolver._read) {
    throw new Error(f('cannot read %s as %s', type, this));
  }
  return resolver;
};

Type.prototype.decode = function (buf, pos, resolver) {
  var tap = new Tap(buf);
  tap.pos = pos | 0;
  var val = readValue(this, tap, resolver);
  if (!tap.isValid()) {
    return {value: undefined, offset: -1};
  }
  return {value: val, offset: tap.pos};
};

Type.prototype.encode = function (val, buf, pos) {
  var tap = new Tap(buf);
  tap.pos = pos | 0;
  this._write(tap, val);
  if (!tap.isValid()) {
    // Don't throw as there is no way to predict this. We also return the
    // number of missing bytes to ease resizing.
    return buf.length - tap.pos;
  }
  return tap.pos;
};

Type.prototype.fromBuffer = function (buf, resolver, noCheck) {
  var tap = new Tap(buf);
  var val = readValue(this, tap, resolver, noCheck);
  if (!tap.isValid()) {
    throw new Error('truncated buffer');
  }
  if (!noCheck && tap.pos < buf.length) {
    throw new Error('trailing data');
  }
  return val;
};

Type.prototype.toBuffer = function (val) {
  TAP.pos = 0;
  this._write(TAP, val);
  if (!TAP.isValid()) {
    Type.__reset(2 * TAP.pos);
    TAP.pos = 0;
    this._write(TAP, val);
  }
  var buf = new Buffer(TAP.pos);
  TAP.buf.copy(buf, 0, 0, TAP.pos);
  return buf;
};

Type.prototype.fromString = function (str) {
  return this._copy(JSON.parse(str), {coerce: 2});
};

Type.prototype.toString = function (val) {
  if (val === undefined) {
    // Consistent behavior with standard `toString` expectations.
    return this.getSchema(true);
  }
  return JSON.stringify(this._copy(val, {coerce: 3}));
};

Type.prototype.clone = function (val, opts) {
  if (opts) {
    opts = {
      coerce: !!opts.coerceBuffers | 0, // Coerce JSON to Buffer.
      fieldHook: opts.fieldHook,
      wrap: !!opts.wrapUnions | 0 // Wrap first match into union.
    };
  }
  return this._copy(val, opts);
};

Type.prototype.isValid = function (val, opts) {
  while (PATH.length) {
    // In case the previous `isValid` call didn't complete successfully (e.g.
    // if an exception was thrown, but then caught in client code), `PATH`
    // might be non-empty, we must manually clear it.
    PATH.pop();
  }
  return this._check(val, opts && opts.errorHook);
};

Type.prototype.compareBuffers = function (buf1, buf2) {
  return this._match(new Tap(buf1), new Tap(buf2));
};

Type.prototype.getName = function (noRef) {
  return noRef ? getTypeName(this) : this._name;
};

Type.prototype.getSchema = function (noDeref) {
  // Since JS objects are unordered, this implementation (unfortunately)
  // relies on engines returning properties in the same order that they are
  // inserted in. This is not in the JS spec, but can be "somewhat" safely
  // assumed (more here: http://stackoverflow.com/q/5525795/1062617).
  return (function (type, registry) {
    return JSON.stringify(type, function (key, value) {
      if (value instanceof Field) {
        return {name: value._name, type: value._type};
      } else if (value && value.name) {
        var name = value.name;
        if (noDeref || registry[name]) {
          return name;
        }
        registry[name] = true;
      }
      return value;
    });
  })(this, {});
};

Type.prototype.getFingerprint = function (algorithm) {
  algorithm = algorithm || 'md5';
  var hash = crypto.createHash(algorithm);
  hash.end(this.getSchema());
  return hash.read();
};

Type.prototype.inspect = function () {
  if (this instanceof PrimitiveType) {
    return f('<%s>', this.constructor.name);
  } else {
    var obj = JSON.parse(this.getSchema(true)); // Slow, only for debugging.
    if (typeof obj == 'object') {
      obj.type = undefined; // Would be redundant with constructor name.
    }
    return f('<%s %j>', this.constructor.name, obj);
  }
};

Type.prototype._check = utils.abstractFunction;
Type.prototype._copy = utils.abstractFunction;
Type.prototype._match = utils.abstractFunction;
Type.prototype._read = utils.abstractFunction;
Type.prototype._skip = utils.abstractFunction;
Type.prototype._updateResolver = utils.abstractFunction;
Type.prototype._write = utils.abstractFunction;
Type.prototype.compare = utils.abstractFunction;
Type.prototype.random = utils.abstractFunction;

// Implementations.

/**
 * Base primitive Avro type.
 *
 * Most of the primitive types share the same cloning and resolution
 * mechanisms, provided by this class. This class also lets us conveniently
 * check whether a type is a primitive using `instanceof`.
 *
 */
function PrimitiveType() { Type.call(this); }
util.inherits(PrimitiveType, Type);
PrimitiveType.prototype._updateResolver = function (resolver, type) {
  if (type.constructor === this.constructor) {
    resolver._read = this._read;
  }
};
PrimitiveType.prototype._copy = function (val) {
  this._check(val, throwInvalidError);
  return val;
};
PrimitiveType.prototype.compare = utils.compare;

/**
 * Nulls.
 *
 */
function NullType() { PrimitiveType.call(this); }
util.inherits(NullType, PrimitiveType);
NullType.prototype._check = function (val, cb) {
  var b = val === null;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
NullType.prototype._read = function () { return null; };
NullType.prototype._skip = function () {};
NullType.prototype._write = function (tap, val) {
  if (val !== null) {
    throwInvalidError(null, val, this);
  }
};
NullType.prototype._match = function () { return 0; };
NullType.prototype.compare = NullType.prototype._match;
NullType.prototype.random = NullType.prototype._read;
NullType.prototype.toJSON = function () { return 'null'; };

/**
 * Booleans.
 *
 */
function BooleanType() { PrimitiveType.call(this); }
util.inherits(BooleanType, PrimitiveType);
BooleanType.prototype._check = function (val, cb) {
  var b = typeof val == 'boolean';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
BooleanType.prototype._read = function (tap) { return tap.readBoolean(); };
BooleanType.prototype._skip = function (tap) { tap.skipBoolean(); };
BooleanType.prototype._write = function (tap, val) {
  if (typeof val != 'boolean') {
    throwInvalidError(null, val, this);
  }
  tap.writeBoolean(val);
};
BooleanType.prototype._match = function (tap1, tap2) {
  return tap1.matchBoolean(tap2);
};
BooleanType.prototype.random = function () { return RANDOM.nextBoolean(); };
BooleanType.prototype.toJSON = function () { return 'boolean'; };

/**
 * Integers.
 *
 */
function IntType() { PrimitiveType.call(this); }
util.inherits(IntType, PrimitiveType);
IntType.prototype._check = function (val, cb) {
  var b = val === (val | 0);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
IntType.prototype._read = function (tap) { return tap.readInt(); };
IntType.prototype._skip = function (tap) { tap.skipInt(); };
IntType.prototype._write = function (tap, val) {
  if (val !== (val | 0)) {
    throwInvalidError(null, val, this);
  }
  tap.writeInt(val);
};
IntType.prototype._match = function (tap1, tap2) {
  return tap1.matchInt(tap2);
};
IntType.prototype.random = function () { return RANDOM.nextInt(1000) | 0; };
IntType.prototype.toJSON = function () { return 'int'; };

/**
 * Longs.
 *
 * We can't capture all the range unfortunately since JavaScript represents all
 * numbers internally as `double`s, so the default implementation plays safe
 * and throws rather than potentially silently change the data. See `using` or
 * `AbstractLongType` below for a way to implement a custom long type.
 *
 */
function LongType() { PrimitiveType.call(this); }
util.inherits(LongType, PrimitiveType);
LongType.prototype._check = function (val, cb) {
  var b = typeof val == 'number' && val % 1 === 0 && isSafeLong(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
LongType.prototype._read = function (tap) {
  var n = tap.readLong();
  if (!isSafeLong(n)) {
    throw new Error('potential precision loss');
  }
  return n;
};
LongType.prototype._skip = function (tap) { tap.skipLong(); };
LongType.prototype._write = function (tap, val) {
  if (typeof val != 'number' || val % 1 || !isSafeLong(val)) {
    throwInvalidError(null, val, this);
  }
  tap.writeLong(val);
};
LongType.prototype._match = function (tap1, tap2) {
  return tap1.matchLong(tap2);
};
LongType.prototype._updateResolver = function (resolver, type) {
  if (type instanceof LongType || type instanceof IntType) {
    resolver._read = type._read;
  }
};
LongType.prototype.random = function () { return RANDOM.nextInt(); };
LongType.prototype.toJSON = function () { return 'long'; };
LongType.using = function (methods, noUnpack) {
  methods = methods || {}; // Will give a more helpful error message.
  // We map some of the methods to a different name to be able to intercept
  // their input and output (otherwise we wouldn't be able to perform any
  // unpacking logic, and the type wouldn't work when nested).
  var mapping = {
    toBuffer: '_toBuffer',
    fromBuffer: '_fromBuffer',
    fromJSON: '_fromJSON',
    toJSON: '_toJSON',
    isValid: '_isValid',
    compare: 'compare'
  };
  var type = new AbstractLongType(noUnpack);
  Object.keys(mapping).forEach(function (name) {
    if (methods[name] === undefined) {
      throw new Error(f('missing method implementation: %s', name));
    }
    type[mapping[name]] = methods[name];
  });
  return type;
};

/**
 * Floats.
 *
 */
function FloatType() { PrimitiveType.call(this); }
util.inherits(FloatType, PrimitiveType);
FloatType.prototype._check = function (val, cb) {
  var b = typeof val == 'number';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
FloatType.prototype._read = function (tap) { return tap.readFloat(); };
FloatType.prototype._skip = function (tap) { tap.skipFloat(); };
FloatType.prototype._write = function (tap, val) {
  if (typeof val != 'number') {
    throwInvalidError(null, val, this);
  }
  tap.writeFloat(val);
};
FloatType.prototype._match = function (tap1, tap2) {
  return tap1.matchFloat(tap2);
};
FloatType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof FloatType ||
    type instanceof LongType ||
    type instanceof IntType
  ) {
    resolver._read = type._read;
  }
};
FloatType.prototype.random = function () { return RANDOM.nextFloat(1e3); };
FloatType.prototype.toJSON = function () { return 'float'; };

/**
 * Doubles.
 *
 */
function DoubleType() { PrimitiveType.call(this); }
util.inherits(DoubleType, PrimitiveType);
DoubleType.prototype._check = function (val, cb) {
  var b = typeof val == 'number';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
DoubleType.prototype._read = function (tap) { return tap.readDouble(); };
DoubleType.prototype._skip = function (tap) { tap.skipDouble(); };
DoubleType.prototype._write = function (tap, val) {
  if (typeof val != 'number') {
    throwInvalidError(null, val, this);
  }
  tap.writeDouble(val);
};
DoubleType.prototype._match = function (tap1, tap2) {
  return tap1.matchDouble(tap2);
};
DoubleType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof DoubleType ||
    type instanceof FloatType ||
    type instanceof LongType ||
    type instanceof IntType
  ) {
    resolver._read = type._read;
  }
};
DoubleType.prototype.random = function () { return RANDOM.nextFloat(); };
DoubleType.prototype.toJSON = function () { return 'double'; };

/**
 * Strings.
 *
 */
function StringType() { PrimitiveType.call(this); }
util.inherits(StringType, PrimitiveType);
StringType.prototype._check = function (val, cb) {
  var b = typeof val == 'string';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
StringType.prototype._read = function (tap) { return tap.readString(); };
StringType.prototype._skip = function (tap) { tap.skipString(); };
StringType.prototype._write = function (tap, val) {
  if (typeof val != 'string') {
    throwInvalidError(null, val, this);
  }
  tap.writeString(val);
};
StringType.prototype._match = function (tap1, tap2) {
  return tap1.matchString(tap2);
};
StringType.prototype._updateResolver = function (resolver, type) {
  if (type instanceof StringType || type instanceof BytesType) {
    resolver._read = this._read;
  }
};
StringType.prototype.random = function () {
  return RANDOM.nextString(RANDOM.nextInt(32));
};
StringType.prototype.toJSON = function () { return 'string'; };

/**
 * Bytes.
 *
 * These are represented in memory as `Buffer`s rather than binary-encoded
 * strings. This is more efficient (when decoding/encoding from bytes, the
 * common use-case), idiomatic, and convenient.
 *
 * Note the coercion in `_copy`.
 *
 */
function BytesType() { PrimitiveType.call(this); }
util.inherits(BytesType, PrimitiveType);
BytesType.prototype._check = function (val, cb) {
  var b = Buffer.isBuffer(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
BytesType.prototype._read = function (tap) { return tap.readBytes(); };
BytesType.prototype._skip = function (tap) { tap.skipBytes(); };
BytesType.prototype._write = function (tap, val) {
  if (!Buffer.isBuffer(val)) {
    throwInvalidError(null, val, this);
  }
  tap.writeBytes(val);
};
BytesType.prototype._match = function (tap1, tap2) {
  return tap1.matchBytes(tap2);
};
BytesType.prototype._updateResolver = StringType.prototype._updateResolver;
BytesType.prototype._copy = function (obj, opts) {
  var buf;
  switch ((opts && opts.coerce) | 0) {
    case 3: // Coerce buffers to strings.
      this._check(obj, throwInvalidError);
      return obj.toString('binary');
    case 2: // Coerce strings to buffers.
      if (typeof obj != 'string') {
        throw new Error(f('cannot coerce to buffer: %j', obj));
      }
      buf = new Buffer(obj, 'binary');
      this._check(buf, throwInvalidError);
      return buf;
    case 1: // Coerce buffer JSON representation to buffers.
      if (!obj || obj.type !== 'Buffer' || !(obj.data instanceof Array)) {
        throw new Error(f('cannot coerce to buffer: %j', obj));
      }
      buf = new Buffer(obj.data);
      this._check(buf, throwInvalidError);
      return buf;
    default: // Copy buffer.
      this._check(obj, throwInvalidError);
      return new Buffer(obj);
  }
};
BytesType.prototype.compare = Buffer.compare;
BytesType.prototype.random = function () {
  return RANDOM.nextBuffer(RANDOM.nextInt(32));
};
BytesType.prototype.toJSON = function () { return 'bytes'; };

/**
 * Avro unions.
 *
 * Unions are represented in memory similarly to their JSON representation
 * (i.e. inside an object with single key the name of the contained type).
 *
 * This is not ideal, but is the most efficient way to unambiguously support
 * all unions. Here are a few reasons why the wrapping object is necessary:
 *
 * + Unions with multiple number types would have undefined behavior, unless
 *   numbers are wrapped (either everywhere, leading to large performance and
 *   convenience costs; or only when necessary inside unions, making it hard to
 *   understand when numbers are wrapped or not).
 * + Fixed types would have to be wrapped to be distinguished from bytes.
 * + Using record's constructor names would work (after a slight change to use
 *   the fully qualified name), but would mean that generic objects could no
 *   longer be valid records (making it inconvenient to do simple things like
 *   creating new records).
 *
 * Lore: In the past (until d304cab), there used to be an "unwrapped union
 * type" which directly exposed its values, without the wrapping object
 * (similarly to Avro's python implementation). It was removed to keep all
 * representations consistent and make this library simpler to understand
 * (conversions, e.g. for schema evolution, between representations were
 * particularly confusing). Encoding was also much slower (worst case
 * complexity linear in the number of types in the union).
 *
 */
function UnionType(attrs, opts) {
  if (!(attrs instanceof Array)) {
    throw new Error(f('non-array union schema: %j', attrs));
  }
  if (!attrs.length) {
    throw new Error('empty union');
  }

  opts = getOpts(attrs, opts);
  Type.call(this);
  this._types = attrs.map(function (obj) { return createType(obj, opts); });

  this._indices = {};
  this._types.forEach(function (type, i) {
    if (type instanceof UnionType) {
      throw new Error('unions cannot be directly nested');
    }
    var name = type._name || getTypeName(type);
    if (this._indices[name] !== undefined) {
      throw new Error(f('duplicate union name: %j', name));
    }
    this._indices[name] = i;
  }, this);

  this._constructors = this._types.map(function (type) {
    // jshint -W054
    var name = type._name || getTypeName(type);
    if (name === 'null') {
      return null;
    }
    var body;
    if (~name.indexOf('.')) { // Qualified name.
      body = 'this[\'' + name + '\'] = val;';
    } else {
      body = 'this.' + name + ' = val;';
    }
    return new Function('val', body);
  });
}
util.inherits(UnionType, Type);

UnionType.prototype._check = function (val, cb) {
  var b = false;
  if (val === null) {
    // Shortcut type lookup in this case.
    b = this._indices['null'] !== undefined;
  } else if (typeof val == 'object') {
    var keys = Object.keys(val);
    if (keys.length === 1) {
      // We require a single key here to ensure that writes are correct and
      // efficient as soon as a record passes this check.
      var name = keys[0];
      var index = this._indices[name];
      if (index !== undefined) {
        PATH.push(name);
        b = this._types[index]._check(val[name], cb);
        PATH.pop();
        return b;
      }
    }
  }
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

UnionType.prototype._read = function (tap) {
  var index = tap.readLong();
  var Class = this._constructors[index];
  if (Class) {
    return new Class(this._types[index]._read(tap));
  } else if (Class === null) {
    return null;
  } else {
    throw new Error(f('invalid union index: %s', index));
  }
};

UnionType.prototype._skip = function (tap) {
  this._types[tap.readLong()]._skip(tap);
};

UnionType.prototype._write = function (tap, val) {
  var index, keys, name;
  if (val === null) {
    index = this._indices['null'];
    if (index === undefined) {
      throwInvalidError(null, val, this);
    }
    tap.writeLong(index);
  } else {
    keys = Object.keys(val);
    if (keys.length === 1) {
      name = keys[0];
      index = this._indices[name];
    }
    if (index === undefined) {
      throwInvalidError(null, val, this);
    }
    tap.writeLong(index);
    this._types[index]._write(tap, val[name]);
  }
};

UnionType.prototype._match = function (tap1, tap2) {
  var n1 = tap1.readLong();
  var n2 = tap2.readLong();
  if (n1 === n2) {
    return this._types[n1]._match(tap1, tap2);
  } else {
    return n1 < n2 ? -1 : 1;
  }
};

UnionType.prototype._updateResolver = function (resolver, type, opts) {
  // jshint -W083
  // (The loop exits after the first function is created.)
  var i, l, typeResolver, Class;
  for (i = 0, l = this._types.length; i < l; i++) {
    try {
      typeResolver = this._types[i].createResolver(type, opts);
    } catch (err) {
      continue;
    }
    Class = this._constructors[i];
    if (Class) {
      resolver._read = function (tap) {
        return new Class(typeResolver._read(tap));
      };
    } else {
      resolver._read = function () { return null; };
    }
    return;
  }
};

UnionType.prototype._copy = function (val, opts) {
  var wrap = opts && opts.wrap | 0;
  if (wrap === 2) {
    // Promote into first type (used for schema defaults).
    if (val === null && this._constructors[0] === null) {
      return null;
    }
    return new this._constructors[0](this._types[0]._copy(val, opts));
  }
  if (val === null && this._indices['null'] !== undefined) {
    return null;
  }

  var i, l, obj;
  if (typeof val == 'object') {
    var keys = Object.keys(val);
    if (keys.length === 1) {
      var name = keys[0];
      i = this._indices[name];
      if (i === undefined) {
        // We are a bit more flexible than in `_check` here since we have
        // to deal with other serializers being less strict, so we fall
        // back to looking up unqualified names.
        var j, type;
        for (j = 0, l = this._types.length; j < l; j++) {
          type = this._types[j];
          if (type._name && name === unqualify(type._name)) {
            i = j;
            break;
          }
        }
      }
      if (i !== undefined) {
        obj = this._types[i]._copy(val[name], opts);
      }
    }
  }
  if (wrap === 1 && obj === undefined) {
    // Try promoting into first match (convenience, slow).
    i = 0;
    l = this._types.length;
    while (i < l && obj === undefined) {
      try {
        obj = this._types[i]._copy(val, opts);
      } catch (err) {
        i++;
      }
    }
  }
  if (obj !== undefined) {
    return new this._constructors[i](obj);
  }
  throwInvalidError(null, val, this);
};

UnionType.prototype.compare = function (val1, val2) {
  var name1 = val1 === null ? 'null' : Object.keys(val1)[0];
  var name2 = val2 === null ? 'null' : Object.keys(val2)[0];
  var index = this._indices[name1];
  if (name1 === name2) {
    return name1 === 'null' ?
      0 :
      this._types[index].compare(val1[name1], val2[name1]);
  } else {
    return utils.compare(index, this._indices[name2]);
  }
};

UnionType.prototype.getTypes = function () { return this._types.slice(); };

UnionType.prototype.random = function () {
  var index = RANDOM.nextInt(this._types.length);
  var Class = this._constructors[index];
  if (!Class) {
    return null;
  }
  return new Class(this._types[index].random());
};

UnionType.prototype.toJSON = function () { return this._types; };

/**
 * Avro enum type.
 *
 * Represented as strings (with allowed values from the set of symbols). Using
 * integers would be a reasonable option, but the performance boost is arguably
 * offset by the legibility cost and the extra deviation from the JSON encoding
 * convention.
 *
 * An integer representation can still be used (e.g. for compatibility with
 * TypeScript `enum`s) by overriding the `EnumType` with a `LongType` (e.g. via
 * `parse`'s registry).
 *
 */
function EnumType(attrs, opts) {
  if (!(attrs.symbols instanceof Array) || !attrs.symbols.length) {
    throw new Error(f('invalid %j enum symbols: %j', attrs.name, attrs));
  }

  opts = getOpts(attrs, opts);
  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._symbols = attrs.symbols;
  this._aliases = resolutions.aliases;
  Type.call(this, opts.registry);

  this._indices = {};
  this._symbols.forEach(function (symbol, i) {
    if (!NAME_PATTERN.test(symbol)) {
      throw new Error(f('invalid %s symbol: %j', this, symbol));
    }
    if (this._indices[symbol] !== undefined) {
      throw new Error(f('duplicate %s symbol: %j', this, symbol));
    }
    this._indices[symbol] = i;
  }, this);
}
util.inherits(EnumType, Type);

EnumType.prototype._check = function (val, cb) {
  var b = this._indices[val] !== undefined;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

EnumType.prototype._read = function (tap) {
  var index = tap.readLong();
  var symbol = this._symbols[index];
  if (symbol === undefined) {
    throw new Error(f('invalid %s enum index: %s', this._name, index));
  }
  return symbol;
};

EnumType.prototype._skip = function (tap) { tap.skipLong(); };

EnumType.prototype._write = function (tap, val) {
  var index = this._indices[val];
  if (index === undefined) {
    throwInvalidError(null, val, this);
  }
  tap.writeLong(index);
};

EnumType.prototype._match = function (tap1, tap2) {
  return tap1.matchLong(tap2);
};

EnumType.prototype.compare = function (val1, val2) {
  return utils.compare(this._indices[val1], this._indices[val2]);
};

EnumType.prototype._updateResolver = function (resolver, type) {
  var symbols = this._symbols;
  if (
    type instanceof EnumType &&
    ~getAliases(this).indexOf(type._name) &&
    type._symbols.every(function (s) { return ~symbols.indexOf(s); })
  ) {
    resolver._symbols = type._symbols;
    resolver._read = type._read;
  }
};

EnumType.prototype._copy = function (val) {
  this._check(val, throwInvalidError);
  return val;
};

EnumType.prototype.getAliases = function () { return this._aliases; };

EnumType.prototype.getSymbols = function () { return this._symbols.slice(); };

EnumType.prototype.random = function () {
  return RANDOM.choice(this._symbols);
};

EnumType.prototype.toJSON = function () {
  return {name: this._name, type: 'enum', symbols: this._symbols};
};

/**
 * Avro fixed type.
 *
 * Represented simply as a `Buffer`.
 *
 */
function FixedType(attrs, opts) {
  if (attrs.size !== (attrs.size | 0) || attrs.size < 1) {
    throw new Error(f('invalid %j fixed size: %j', attrs.name, attrs.size));
  }

  opts = getOpts(attrs, opts);
  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._size = attrs.size | 0;
  this._aliases = resolutions.aliases;
  Type.call(this, opts.registry);
}
util.inherits(FixedType, Type);

FixedType.prototype._check = function (val, cb) {
  var b = Buffer.isBuffer(val) && val.length === this._size;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

FixedType.prototype._read = function (tap) {
  return tap.readFixed(this._size);
};

FixedType.prototype._skip = function (tap) {
  tap.skipFixed(this._size);
};

FixedType.prototype._write = function (tap, val) {
  if (!Buffer.isBuffer(val) || val.length !== this._size) {
    throwInvalidError(null, val, this);
  }
  tap.writeFixed(val, this._size);
};

FixedType.prototype._match = function (tap1, tap2) {
  return tap1.matchFixed(tap2, this._size);
};

FixedType.prototype.compare = Buffer.compare;

FixedType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof FixedType &&
    this._size === type._size &&
    ~getAliases(this).indexOf(type._name)
  ) {
    resolver._size = this._size;
    resolver._read = this._read;
  }
};

FixedType.prototype._copy = BytesType.prototype._copy;

FixedType.prototype.getAliases = function () { return this._aliases; };

FixedType.prototype.getSize = function () { return this._size; };

FixedType.prototype.random = function () {
  return RANDOM.nextBuffer(this._size);
};

FixedType.prototype.toJSON = function () {
  return {name: this._name, type: 'fixed', size: this._size};
};

/**
 * Avro map.
 *
 * Represented as vanilla objects.
 *
 */
function MapType(attrs, opts) {
  if (!attrs.values) {
    throw new Error(f('missing map values: %j', attrs));
  }

  opts = getOpts(attrs, opts);
  Type.call(this);
  this._values = createType(attrs.values, opts);
}
util.inherits(MapType, Type);

MapType.prototype.getValuesType = function () { return this._values; };

MapType.prototype._check = function (val, cb) {
  if (!val || typeof val != 'object' || val instanceof Array) {
    if (cb) {
      cb(PATH.slice(), val, this);
    }
    return false;
  }

  var keys = Object.keys(val);
  var b = true;
  var i, l, j, key;
  if (cb) {
    // Slow path.
    j = PATH.length;
    PATH.push('');
    for (i = 0, l = keys.length; i < l; i++) {
      key = PATH[j] = keys[i];
      if (!this._values._check(val[key], cb)) {
        b = false;
      }
    }
    PATH.pop();
  } else {
    for (i = 0, l = keys.length; i < l; i++) {
      if (!this._values._check(val[keys[i]], cb)) {
        return false;
      }
    }
  }
  return b;
};

MapType.prototype._read = function (tap) {
  var values = this._values;
  var val = {};
  var n;
  while ((n = readArraySize(tap))) {
    while (n--) {
      var key = tap.readString();
      val[key] = values._read(tap);
    }
  }
  return val;
};

MapType.prototype._skip = function (tap) {
  var values = this._values;
  var len, n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      len = tap.readLong();
      tap.pos += len;
    } else {
      while (n--) {
        tap.skipString();
        values._skip(tap);
      }
    }
  }
};

MapType.prototype._write = function (tap, val) {
  if (!val || typeof val != 'object' || val instanceof Array) {
    throwInvalidError(null, val, this);
  }

  var values = this._values;
  var keys = Object.keys(val);
  var n = keys.length;
  var i, key;
  if (n) {
    tap.writeLong(n);
    for (i = 0; i < n; i++) {
      key = keys[i];
      tap.writeString(key);
      values._write(tap, val[key]);
    }
  }
  tap.writeLong(0);
};

MapType.prototype._match = function () {
  throw new Error('maps cannot be compared');
};

MapType.prototype._updateResolver = function (resolver, type, opts) {
  if (type instanceof MapType) {
    resolver._values = this._values.createResolver(type._values, opts);
    resolver._read = this._read;
  }
};

MapType.prototype._copy = function (val, opts) {
  if (val && typeof val == 'object' && !(val instanceof Array)) {
    var values = this._values;
    var keys = Object.keys(val);
    var i, l, key;
    var copy = {};
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      copy[key] = values._copy(val[key], opts);
    }
    return copy;
  }
  throwInvalidError(null, val, this);
};

MapType.prototype.compare = MapType.prototype._match;

MapType.prototype.random = function () {
  var val = {};
  var i, l;
  for (i = 0, l = RANDOM.nextInt(10); i < l; i++) {
    val[RANDOM.nextString(RANDOM.nextInt(20))] = this._values.random();
  }
  return val;
};

MapType.prototype.toJSON = function () {
  return {type: 'map', values: this._values};
};

/**
 * Avro array.
 *
 * Represented as vanilla arrays.
 *
 */
function ArrayType(attrs, opts) {
  if (!attrs.items) {
    throw new Error(f('missing array items: %j', attrs));
  }

  opts = getOpts(attrs, opts);

  this._items = createType(attrs.items, opts);
  Type.call(this);
}
util.inherits(ArrayType, Type);

ArrayType.prototype._check = function (val, cb) {
  if (!(val instanceof Array)) {
    if (cb) {
      cb(PATH.slice(), val, this);
    }
    return false;
  }

  var b = true;
  var i, l, j;
  if (cb) {
    // Slow path.
    j = PATH.length;
    PATH.push('');
    for (i = 0, l = val.length; i < l; i++) {
      PATH[j] = '' + i;
      if (!this._items._check(val[i], cb)) {
        b = false;
      }
    }
    PATH.pop();
  } else {
    for (i = 0, l = val.length; i < l; i++) {
      if (!this._items._check(val[i], cb)) {
        return false;
      }
    }
  }
  return b;
};

ArrayType.prototype._read = function (tap) {
  var items = this._items;
  var val = [];
  var n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      n = -n;
      tap.skipLong(); // Skip size.
    }
    while (n--) {
      val.push(items._read(tap));
    }
  }
  return val;
};

ArrayType.prototype._skip = function (tap) {
  var len, n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      len = tap.readLong();
      tap.pos += len;
    } else {
      while (n--) {
        this._items._skip(tap);
      }
    }
  }
};

ArrayType.prototype._write = function (tap, val) {
  if (!(val instanceof Array)) {
    throwInvalidError(null, val, this);
  }

  var n = val.length;
  var i;
  if (n) {
    tap.writeLong(n);
    for (i = 0; i < n; i++) {
      this._items._write(tap, val[i]);
    }
  }
  tap.writeLong(0);
};

ArrayType.prototype._match = function (tap1, tap2) {
  var n1 = tap1.readLong();
  var n2 = tap2.readLong();
  var f;
  while (n1 && n2) {
    f = this._items._match(tap1, tap2);
    if (f) {
      return f;
    }
    if (!--n1) {
      n1 = readArraySize(tap1);
    }
    if (!--n2) {
      n2 = readArraySize(tap2);
    }
  }
  return utils.compare(n1, n2);
};

ArrayType.prototype._updateResolver = function (resolver, type, opts) {
  if (type instanceof ArrayType) {
    resolver._items = this._items.createResolver(type._items, opts);
    resolver._read = this._read;
  }
};

ArrayType.prototype._copy = function (val, opts) {
  if (!(val instanceof Array)) {
    throwInvalidError(null, val, this);
  }
  var items = [];
  var i, l;
  for (i = 0, l = val.length; i < l; i++) {
    items.push(this._items._copy(val[i], opts));
  }
  return items;
};

ArrayType.prototype.compare = function (val1, val2) {
  var n1 = val1.length;
  var n2 = val2.length;
  var i, l, f;
  for (i = 0, l = Math.min(n1, n2); i < l; i++) {
    if ((f = this._items.compare(val1[i], val2[i]))) {
      return f;
    }
  }
  return utils.compare(n1, n2);
};

ArrayType.prototype.getItemsType = function () { return this._items; };

ArrayType.prototype.random = function () {
  var arr = [];
  var i, l;
  for (i = 0, l = RANDOM.nextInt(10); i < l; i++) {
    arr.push(this._items.random());
  }
  return arr;
};

ArrayType.prototype.toJSON = function () {
  return {type: 'array', items: this._items};
};

/**
 * Avro record.
 *
 * Values are represented as instances of a programmatically generated
 * constructor (similar to a "specific record"), available via the
 * `getRecordConstructor` method. This "specific record class" gives
 * significant speedups over using generics objects.
 *
 * Note that vanilla objects are still accepted as valid as long as their
 * fields match (this makes it much more convenient to do simple things like
 * update nested records).
 *
 */
function RecordType(attrs, opts) {
  opts = getOpts(attrs, opts);

  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._aliases = resolutions.aliases;
  Type.call(this, opts.registry);

  if (!(attrs.fields instanceof Array)) {
    throw new Error(f('non-array %s fields', this._name));
  }
  this._fields = attrs.fields.map(function (f) {
    return new Field(f, opts);
  });
  if (utils.hasDuplicates(attrs.fields, function (f) { return f.name; })) {
    throw new Error(f('duplicate %s field name', this._name));
  }

  var isError = attrs.type === 'error';
  this._constructor = this._createConstructor(isError);
  this._read = this._createReader();
  this._skip = this._createSkipper();
  this._write = this._createWriter();
  this._check = this._createChecker();
}
util.inherits(RecordType, Type);

RecordType.prototype._createConstructor = function (isError) {
  // jshint -W054
  var outerArgs = [];
  var innerArgs = [];
  var ds = []; // Defaults.
  var innerBody = isError ? '  Error.call(this);\n' : '';
  // Not calling `Error.captureStackTrace` because this wouldn't be compatible
  // with browsers other than Chrome.
  var i, l, field, name, getDefault;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    getDefault = field.getDefault;
    name = field._name;
    innerArgs.push('v' + i);
    innerBody += '  ';
    if (getDefault() === undefined) {
      innerBody += 'this.' + name + ' = v' + i + ';\n';
    } else {
      innerBody += 'if (v' + i + ' === undefined) { ';
      innerBody += 'this.' + name + ' = d' + ds.length + '(); ';
      innerBody += '} else { this.' + name + ' = v' + i + '; }\n';
      outerArgs.push('d' + ds.length);
      ds.push(getDefault);
    }
  }
  var outerBody = 'return function ' + unqualify(this._name) + '(';
  outerBody += innerArgs.join() + ') {\n' + innerBody + '};';
  var Record = new Function(outerArgs.join(), outerBody).apply(undefined, ds);

  var self = this;
  Record.getType = function () { return self; };
  Record.prototype = {
    constructor: Record,
    $clone: function (opts) { return self.clone(this, opts); },
    $compare: function (val) { return self.compare(this, val); },
    $getType: Record.getType,
    $isValid: function (opts) { return self.isValid(this, opts); },
    $toBuffer: function () { return self.toBuffer(this); },
    $toString: function (noCheck) { return self.toString(this, noCheck); }
  };
  // The names of these properties added to the prototype are prefixed with `$`
  // because it is an invalid property name in Avro but not in JavaScript.
  // (This way we are guaranteed not to be stepped over!)
  if (isError) {
    util.inherits(Record, Error);
    // Not setting the name on the prototype to be consistent with how object
    // fields are mapped to (only if defined in the schema as a field).
  }

  return Record;
};

RecordType.prototype._createChecker = function () {
  // jshint -W054
  var names = ['t', 'P'];
  var values = [this, PATH];
  var body = 'return function check' + unqualify(this._name) + '(val, cb) {\n';
  body += '  if (val === null || typeof val != \'object\') {\n';
  body += '    if (cb) { cb(P.slice(), val, t); }\n';
  body += '    return false;\n';
  body += '  }\n';
  if (!this._fields.length) {
    // Special case, empty record. We handle this directly.
    body += '  return true;\n';
  } else {
    for (i = 0, l = this._fields.length; i < l; i++) {
      field = this._fields[i];
      names.push('t' + i);
      values.push(field._type);
      if (field.getDefault() !== undefined) {
        body += '  var v' + i + ' = val.' + field._name + ';\n';
      }
    }
    body += '  if (cb) {\n';
    body += '    var b = 1;\n';
    body += '    var j = P.length;\n';
    body += '    P.push(\'\');\n';
    var i, l, field;
    for (i = 0, l = this._fields.length; i < l; i++) {
      field = this._fields[i];
      body += '    P[j] = \'' + field._name + '\';\n';
      if (field.getDefault() === undefined) {
        body += '    b &= t' + i + '._check(val.' + field._name + ', cb);\n';
      } else {
        body += '    b &= v' + i + ' === undefined || ';
        body += 't' + i + '._check(v' + i + ', cb);\n';
      }
    }
    body += '    P.pop();\n';
    body += '    return !!b;\n';
    body += '  } else {\n    return (\n      ';
    body += this._fields.map(function (field, i) {
      if (field.getDefault() === undefined) {
        return 't' + i + '._check(val.' + field._name + ')';
      } else {
        return '(v' + i + ' === undefined || t' + i + '._check(v' + i + '))';
      }
    }).join(' &&\n      ');
    body += '\n    );\n  }\n';
  }
  body += '};';
  return new Function(names.join(), body).apply(undefined, values);
};

RecordType.prototype._createReader = function () {
  // jshint -W054
  var uname = unqualify(this._name);
  var names = [];
  var values = [this._constructor];
  var i, l;
  for (i = 0, l = this._fields.length; i < l; i++) {
    names.push('t' + i);
    values.push(this._fields[i]._type);
  }
  var body = 'return function read' + uname + '(tap) {\n';
  body += '  return new ' + uname + '(';
  body += names.map(function (t) { return t + '._read(tap)'; }).join();
  body += ');\n};';
  names.unshift(uname);
  // We can do this since the JS spec guarantees that function arguments are
  // evaluated from left to right.
  return new Function(names.join(), body).apply(undefined, values);
};

RecordType.prototype._createSkipper = function () {
  // jshint -W054
  var args = [];
  var body = 'return function skip' + unqualify(this._name) + '(tap) {\n';
  var values = [];
  var i, l;
  for (i = 0, l = this._fields.length; i < l; i++) {
    args.push('t' + i);
    values.push(this._fields[i]._type);
    body += '  t' + i + '._skip(tap);\n';
  }
  body += '}';
  return new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._createWriter = function () {
  // jshint -W054
  // We still do default handling here, in case a normal JS object is passed.
  var args = [];
  var body = 'return function write' + unqualify(this._name) + '(tap, val) {\n';
  var values = [];
  var i, l, field, value;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    args.push('t' + i);
    values.push(field._type);
    body += '  ';
    if (field.getDefault() === undefined) {
      body += 't' + i + '._write(tap, val.' + field._name + ');\n';
    } else {
      value = field._type.toBuffer(field.getDefault()).toString('binary');
      // Convert the default value to a binary string ahead of time. We aren't
      // converting it to a buffer to avoid retaining too much memory. If we
      // had our own buffer pool, this could be an idea in the future.
      args.push('d' + i);
      values.push(value);
      body += 'var v' + i + ' = val.' + field._name + '; ';
      body += 'if (v' + i + ' === undefined) { ';
      body += 'tap.writeBinary(d' + i + ', ' + value.length + ');';
      body += ' } else { t' + i + '._write(tap, v' + i + '); }\n';
    }
  }
  body += '}';
  return new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._updateResolver = function (resolver, type, opts) {
  // jshint -W054
  if (!~getAliases(this).indexOf(type._name)) {
    throw new Error(f('no alias for %s in %s', type._name, this._name));
  }

  var rFields = this._fields;
  var wFields = type._fields;
  var wFieldsMap = utils.toMap(wFields, function (f) { return f._name; });

  var innerArgs = []; // Arguments for reader constructor.
  var resolvers = {}; // Resolvers keyed by writer field name.
  var i, j, field, name, names, matches;
  for (i = 0; i < rFields.length; i++) {
    field = rFields[i];
    names = getAliases(field);
    matches = [];
    for (j = 0; j < names.length; j++) {
      name = names[j];
      if (wFieldsMap[name]) {
        matches.push(name);
      }
    }
    if (matches.length > 1) {
      throw new Error(f('multiple matches for %s', field.name));
    }
    if (!matches.length) {
      if (field.getDefault() === undefined) {
        throw new Error(f('no match for default-less %s', field.name));
      }
      innerArgs.push('undefined');
    } else {
      name = matches[0];
      resolvers[name] = {
        resolver: field._type.createResolver(wFieldsMap[name]._type, opts),
        name: field._name // Reader field name.
      };
      innerArgs.push(field._name);
    }
  }

  // See if we can add a bypass for unused fields at the end of the record.
  var lazyIndex = -1;
  i = wFields.length;
  while (i && resolvers[wFields[--i]._name] === undefined) {
    lazyIndex = i;
  }

  var uname = unqualify(this._name);
  var args = [uname];
  var values = [this._constructor];
  var body = '  return function read' + uname + '(tap,lazy) {\n';
  for (i = 0; i < wFields.length; i++) {
    if (i === lazyIndex) {
      body += '  if (!lazy) {\n';
    }
    field = type._fields[i];
    name = field._name;
    body += (~lazyIndex && i >= lazyIndex) ? '    ' : '  ';
    if (resolvers[name] === undefined) {
      args.push('t' + i);
      values.push(field._type);
      body += 't' + i + '._skip(tap);\n';
    } else {
      args.push('t' + i);
      values.push(resolvers[name].resolver);
      body += 'var ' + resolvers[name].name + ' = ';
      body += 't' + i + '._read(tap);\n';
    }
  }
  if (~lazyIndex) {
    body += '  }\n';
  }
  body +=  '  return new ' + uname + '(' + innerArgs.join() + ');\n};';

  resolver._read = new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._match = function (tap1, tap2) {
  var fields = this._fields;
  var i, l, field, order, type;
  for (i = 0, l = fields.length; i < l; i++) {
    field = fields[i];
    order = field._order;
    type = field._type;
    if (order) {
      order *= type._match(tap1, tap2);
      if (order) {
        return order;
      }
    } else {
      type._skip(tap1);
      type._skip(tap2);
    }
  }
  return 0;
};

RecordType.prototype._copy = function (val, opts) {
  // jshint -W058
  var hook = opts && opts.fieldHook;
  var values = [undefined];
  var i, l, field, value;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    value = field._type._copy(val[field._name], opts);
    if (hook) {
      value = hook(field, value, this);
    }
    values.push(value);
  }
  return new (this._constructor.bind.apply(this._constructor, values));
};

RecordType.prototype.compare = function (val1, val2) {
  var fields = this._fields;
  var i, l, field, name, order, type;
  for (i = 0, l = fields.length; i < l; i++) {
    field = fields[i];
    name = field._name;
    order = field._order;
    type = field._type;
    if (order) {
      order *= type.compare(val1[name], val2[name]);
      if (order) {
        return order;
      }
    }
  }
  return 0;
};

RecordType.prototype.random = function () {
  // jshint -W058
  var fields = this._fields.map(function (f) { return f._type.random(); });
  fields.unshift(undefined);
  return new (this._constructor.bind.apply(this._constructor, fields));
};

RecordType.prototype.getAliases = function () { return this._aliases; };

RecordType.prototype.getFields = function () { return this._fields.slice(); };

RecordType.prototype.getRecordConstructor = function () {
  return this._constructor;
};

RecordType.prototype.toJSON = function () {
  return {name: this._name, type: 'record', fields: this._fields};
};

/**
 * Derived type abstract class.
 *
 */
function LogicalType(attrs, opts, Types) {
  Type.call(this);
  LOGICAL_TYPE = this;
  this._underlyingType = createType(attrs, opts);

  // Convenience type check.
  if (Types && !~Types.indexOf(this._underlyingType.constructor)) {
    var lType = attrs.logicalType;
    var uType = this._underlyingType;
    throw new Error(f('invalid underlying type for %s: %s', lType, uType));
  }
}
util.inherits(LogicalType, Type);

LogicalType.prototype.getUnderlyingType = function () {
  return this._underlyingType;
};

LogicalType.prototype._read = function (tap) {
  return this._fromValue(this._underlyingType._read(tap));
};

LogicalType.prototype._write = function (tap, any) {
  this._underlyingType._write(tap, this._toValue(any));
};

LogicalType.prototype._check = function (any, cb) {
  try {
    var val = this._toValue(any);
  } catch (err) {
    if (cb) {
      cb(PATH.slice(), any, this);
    }
    return false;
  }
  return this._underlyingType._check(val, cb);
};

LogicalType.prototype._copy = function (any, opts) {
  var type = this._underlyingType;
  switch (opts && opts.coerce) {
    case 3: // To string.
      return type._copy(this._toValue(any), opts);
    case 2: // From string.
      return this._fromValue(type._copy(any, opts));
    default: // Normal copy.
      return this._fromValue(type._copy(this._toValue(any), opts));
  }
};

LogicalType.prototype._updateResolver = function (resolver, type, opts) {
  var _fromValue = this._resolve(type, opts);
  if (_fromValue) {
    resolver._read = function (tap) { return _fromValue(type._read(tap)); };
  }
};

LogicalType.prototype.random = function () {
  return this._fromValue(this._underlyingType.random());
};

LogicalType.prototype.compare = function (obj1, obj2) {
  var val1 = this._toValue(obj1);
  var val2 = this._toValue(obj2);
  return this._underlyingType.compare(val1, val2);
};

LogicalType.prototype.toJSON = function () {
  return this._underlyingType.toJSON();
};

// Methods to be implemented.
LogicalType.prototype._fromValue = utils.abstractFunction;
LogicalType.prototype._toValue = utils.abstractFunction;
LogicalType.prototype._resolve = utils.abstractFunction;


// General helpers.

/**
 * Customizable long.
 *
 * This allows support of arbitrarily large long (e.g. larger than
 * `Number.MAX_SAFE_INTEGER`). See `LongType.using` method above.
 *
 */
function AbstractLongType(noUnpack) {
  LongType.call(this);
  this._noUnpack = !!noUnpack;
}
util.inherits(AbstractLongType, LongType);

AbstractLongType.prototype._check = function (val, cb) {
  var b = this._isValid(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

AbstractLongType.prototype._read = function (tap) {
  var buf, pos;
  if (this._noUnpack) {
    pos = tap.pos;
    tap.skipLong();
    buf = tap.buf.slice(pos, tap.pos);
  } else {
    buf = tap.unpackLongBytes(tap);
  }
  if (tap.isValid()) {
    return this._fromBuffer(buf);
  }
};

AbstractLongType.prototype._write = function (tap, val) {
  if (!this._isValid(val)) {
    throwInvalidError(null, val, this);
  }
  var buf = this._toBuffer(val);
  if (this._noUnpack) {
    tap.writeFixed(buf);
  } else {
    tap.packLongBytes(buf);
  }
};

AbstractLongType.prototype._copy = function (val, opts) {
  switch (opts && opts.coerce) {
    case 3: // To string.
      return this._toJSON(val);
    case 2: // From string.
      return this._fromJSON(val);
    default: // Normal copy.
      // Slow but guarantees most consistent results. Faster alternatives would
      // require assumptions on the long class used (e.g. immutability).
      return this._fromJSON(JSON.parse(JSON.stringify(this._toJSON(val))));
  }
};

AbstractLongType.prototype.random = function () {
  return this._fromJSON(LongType.prototype.random());
};

// Methods to be implemented by the user.
AbstractLongType.prototype._fromBuffer = utils.abstractFunction;
AbstractLongType.prototype._toBuffer = utils.abstractFunction;
AbstractLongType.prototype._fromJSON = utils.abstractFunction;
AbstractLongType.prototype._toJSON = utils.abstractFunction;
AbstractLongType.prototype._isValid = utils.abstractFunction;
AbstractLongType.prototype.compare = utils.abstractFunction;

/**
 * Field.
 *
 * @param attrs {Object} The field's schema.
 * @para opts {Object} Schema parsing options (the same as `Type`s').
 *
 */
function Field(attrs, opts) {
  var name = attrs.name;
  if (typeof name != 'string' || !NAME_PATTERN.test(name)) {
    throw new Error(f('invalid field name: %s', name));
  }

  this._name = name;
  this._type = createType(attrs.type, opts);
  this._aliases = attrs.aliases || [];

  this._order = (function (order) {
    switch (order) {
      case 'ascending':
        return 1;
      case 'descending':
        return -1;
      case 'ignore':
        return 0;
      default:
        throw new Error(f('invalid order: %j', order));
    }
  })(attrs.order === undefined ? 'ascending' : attrs.order);

  var value = attrs['default'];
  if (value !== undefined) {
    // We need to convert defaults back to a valid format (unions are
    // disallowed in default definitions, only the first type of each union is
    // allowed instead).
    // http://apache-avro.679487.n3.nabble.com/field-union-default-in-Java-td1175327.html
    var type = this._type;
    var val = type._copy(value, {coerce: 2, wrap: 2});
    // The clone call above will throw an error if the default is invalid.
    if (type instanceof PrimitiveType && !(type instanceof BytesType)) {
      // These are immutable.
      this.getDefault = function () { return val; };
    } else {
      this.getDefault = function () { return type._copy(val); };
    }
  }
}

Field.prototype.getAliases = function () { return this._aliases; };

Field.prototype.getDefault = function () {}; // Undefined default.

Field.prototype.getName = function () { return this._name; };

Field.prototype.getOrder = function () {
  return ['descending', 'ignore', 'ascending'][this._order + 1];
};

Field.prototype.getType = function () { return this._type; };

Field.prototype.inspect = function () { return f('<Field %j>', this._name); };

/**
 * Resolver to read a writer's schema as a new schema.
 *
 * @param readerType {Type} The type to convert to.
 *
 */
function Resolver(readerType) {
  // Add all fields here so that all resolvers share the same hidden class.
  this._readerType = readerType;
  this._items = null;
  this._read = null;
  this._size = 0;
  this._symbols = null;
  this._values = null;
}

Resolver.prototype.inspect = function () { return '<Resolver>'; };

/**
 * Read a value from a tap.
 *
 * @param type {Type} The type to decode.
 * @param tap {Tap} The tap to read from. No checks are performed here.
 * @param resolver {Resolver} Optional resolver. It must match the input type.
 * @param lazy {Boolean} Skip trailing fields when using a resolver.
 *
 */
function readValue(type, tap, resolver, lazy) {
  if (resolver) {
    if (resolver._readerType !== type) {
      throw new Error('invalid resolver');
    }
    return resolver._read(tap, lazy);
  } else {
    return type._read(tap);
  }
}

/**
 * Create default parsing options.
 *
 * @param attrs {Object} Schema to populate options with.
 * @param opts {Object} Base options.
 *
 */
function getOpts(attrs, opts) {
  if (attrs === null) {
    // Let's be helpful for this common error.
    throw new Error('invalid type: null (did you mean "null"?)');
  }
  opts = opts || {};
  opts.registry = opts.registry || {};
  opts.namespace = attrs.namespace || opts.namespace;
  opts.logicalTypes = opts.logicalTypes || {};
  return opts;
}

/**
 * Resolve a schema's name and aliases.
 *
 * @param attrs {Object} True schema (can't be a string).
 * @param namespace {String} Optional parent namespace.
 * @param key {String} Key where the name should be looked up (defaults to
 * `name`).
 *
 */
function resolveNames(attrs, namespace, key) {
  namespace = attrs.namespace || namespace;
  key = key || 'name';

  var name = attrs[key];
  if (!name) {
    throw new Error(f('missing %s property in schema: %j', key, attrs));
  }
  return {
    name: qualify(name),
    aliases: attrs.aliases ? attrs.aliases.map(qualify) : []
  };

  function qualify(name) {
    if (!~name.indexOf('.') && namespace) {
      name = namespace + '.' + name;
    }
    var tail = unqualify(name);
    if (isPrimitive(tail)) {
      // Primitive types cannot be defined in any namespace.
      throw new Error(f('cannot rename primitive type: %j', tail));
    }
    name.split('.').forEach(function (part) {
      if (!NAME_PATTERN.test(part)) {
        throw new Error(f('invalid name: %j', name));
      }
    });
    return name;
  }
}

/**
 * Remove namespace from a name.
 *
 * @param name {String} Full or short name.
 *
 */
function unqualify(name) {
  var parts = name.split('.');
  return parts[parts.length - 1];
}

/**
 * Get all aliases for a type (including its name).
 *
 * @param obj {Type|Object} Typically a type or a field. Its aliases property
 * must exist and be an array.
 *
 */
function getAliases(obj) {
  var names = [obj._name];
  var aliases = obj._aliases;
  var i, l;
  for (i = 0, l = aliases.length; i < l; i++) {
    names.push(aliases[i]);
  }
  return names;
}

/**
 * Get a type's "type" (as a string, e.g. `'record'`, `'string'`).
 *
 * @param type {Type} Any type.
 *
 */
function getTypeName(type) {
  var obj = type.toJSON();
  return typeof obj == 'string' ? obj : obj.type;
}

/**
 * Check whether a type's name is a primitive.
 *
 * @param name {String} Type name (e.g. `'string'`, `'array'`).
 *
 */
function isPrimitive(name) {
  var type = TYPES[name];
  return type !== undefined && type.prototype instanceof PrimitiveType;
}

/**
 * Get the number of elements in an array block.
 *
 * @param tap {Tap} A tap positioned at the beginning of an array block.
 *
 */
function readArraySize(tap) {
  var n = tap.readLong();
  if (n < 0) {
    n = -n;
    tap.skipLong(); // Skip size.
  }
  return n;
}

/**
 * Check whether a long can be represented without precision loss.
 *
 * @param n {Number} The number.
 *
 * Two things to note:
 *
 * + We are not using the `Number` constants for compatibility with older
 *   browsers.
 * + We must remove one from each bound because of rounding errors.
 *
 */
function isSafeLong(n) {
  return n >= -9007199254740990 && n <= 9007199254740990;
}

/**
 * Throw a somewhat helpful error on invalid object.
 *
 * @param path {Array} Passed from hook, but unused (because empty where this
 * function is used, since we aren't keeping track of it for effiency).
 * @param val {...} The object to reject.
 * @param type {Type} The type to check against.
 *
 * This method is mostly used from `_write` to signal an invalid object for a
 * given type. Note that this provides less information than calling `isValid`
 * with a hook since the path is not propagated (for efficiency reasons).
 *
 */
function throwInvalidError(path, val, type) {
  throw new Error(f('invalid %s: %j', type, val));
}


module.exports = {
  createType: createType,
  resolveNames: resolveNames, // Protocols use the same name resolution logic.
  types: (function () {
    // Export the base types along with all concrete implementations.
    var obj = {Type: Type, LogicalType: LogicalType};
    var types = Object.keys(TYPES);
    var i, l, Class;
    for (i = 0, l = types.length; i < l; i++) {
      Class = TYPES[types[i]];
      obj[Class.name] = Class;
    }
    return obj;
  })()
};

}).call(this,require("buffer").Buffer)
},{"./utils":6,"buffer":9,"crypto":3,"util":15}],6:[function(require,module,exports){
(function (Buffer){
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

/**
 * Uppercase the first letter of a string.
 *
 * @param s {String} The string.
 *
 */
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/**
 * Compare two numbers.
 *
 * @param n1 {Number} The first one.
 * @param n2 {Number} The second one.
 *
 */
function compare(n1, n2) { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }

/**
 * Find index of value in array.
 *
 * @param arr {Array} Can also be a false-ish value.
 * @param v {Object} Value to find.
 *
 * Returns -1 if not found, -2 if found multiple times.
 *
 */
function singleIndexOf(arr, v) {
  var pos = -1;
  var i, l;
  if (!arr) {
    return -1;
  }
  for (i = 0, l = arr.length; i < l; i++) {
    if (arr[i] === v) {
      if (pos >= 0) {
        return -2;
      }
      pos = i;
    }
  }
  return pos;
}

/**
 * Convert array to map.
 *
 * @param arr {Array} Elements.
 * @param fn {Function} Function returning an element's key.
 *
 */
function toMap(arr, fn) {
  var obj = {};
  var i, elem;
  for (i = 0; i < arr.length; i++) {
    elem = arr[i];
    obj[fn(elem)] = elem;
  }
  return obj;
}

/**
 * Check whether an array has duplicates.
 *
 * @param arr {Array} The array.
 * @param fn {Function} Optional function to apply to each element.
 *
 */
function hasDuplicates(arr, fn) {
  var obj = {};
  var i, l, elem;
  for (i = 0, l = arr.length; i < l; i++) {
    elem = arr[i];
    if (fn) {
      elem = fn(elem);
    }
    if (obj[elem]) {
      return true;
    }
    obj[elem] = true;
  }
  return false;
}

/**
 * "Abstract" function to help with "subclassing".
 *
 */
function abstractFunction() { throw new Error('abstract'); }

/**
 * Generator of random things.
 *
 * Inspired by: http://stackoverflow.com/a/424445/1062617
 *
 */
function Lcg(seed) {
  var a = 1103515245;
  var c = 12345;
  var m = Math.pow(2, 31);
  var state = Math.floor(seed || Math.random() * (m - 1));

  this._max = m;
  this._nextInt = function () { return state = (a * state + c) % m; };
}

Lcg.prototype.nextBoolean = function () {
  // jshint -W018
  return !!(this._nextInt() % 2);
};

Lcg.prototype.nextInt = function (start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  end = end === undefined ? this._max : end;
  return start + Math.floor(this.nextFloat() * (end - start));
};

Lcg.prototype.nextFloat = function (start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  end = end === undefined ? 1 : end;
  return start + (end - start) * this._nextInt() / this._max;
};

Lcg.prototype.nextString = function(len, flags) {
  len |= 0;
  flags = flags || 'aA';
  var mask = '';
  if (flags.indexOf('a') > -1) {
    mask += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (flags.indexOf('A') > -1) {
    mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (flags.indexOf('#') > -1) {
    mask += '0123456789';
  }
  if (flags.indexOf('!') > -1) {
    mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  }
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(this.choice(mask));
  }
  return result.join('');
};

Lcg.prototype.nextBuffer = function (len) {
  var arr = [];
  var i;
  for (i = 0; i < len; i++) {
    arr.push(this.nextInt(256));
  }
  return new Buffer(arr);
};

Lcg.prototype.choice = function (arr) {
  var len = arr.length;
  if (!len) {
    throw new Error('choosing from empty array');
  }
  return arr[this.nextInt(len)];
};

/**
 * Ordered queue which returns items consecutively.
 *
 * This is actually a heap by index, with the added requirements that elements
 * can only be retrieved consecutively.
 *
 */
function OrderedQueue() {
  this._index = 0;
  this._items = [];
}

OrderedQueue.prototype.push = function (item) {
  var items = this._items;
  var i = items.length | 0;
  var j;
  items.push(item);
  while (i > 0 && items[i].index < items[j = ((i - 1) >> 1)].index) {
    item = items[i];
    items[i] = items[j];
    items[j] = item;
    i = j;
  }
};

OrderedQueue.prototype.pop = function () {
  var items = this._items;
  var len = (items.length - 1) | 0;
  var first = items[0];
  if (!first || first.index > this._index) {
    return null;
  }
  this._index++;
  if (!len) {
    items.pop();
    return first;
  }
  items[0] = items.pop();
  var mid = len >> 1;
  var i = 0;
  var i1, i2, j, item, c, c1, c2;
  while (i < mid) {
    item = items[i];
    i1 = (i << 1) + 1;
    i2 = (i + 1) << 1;
    c1 = items[i1];
    c2 = items[i2];
    if (!c2 || c1.index <= c2.index) {
      c = c1;
      j = i1;
    } else {
      c = c2;
      j = i2;
    }
    if (c.index >= item.index) {
      break;
    }
    items[j] = item;
    items[i] = c;
    i = j;
  }
  return first;
};

/**
 * A tap is a buffer which remembers what has been already read.
 *
 * It is optimized for performance, at the cost of failing silently when
 * overflowing the buffer. This is a purposeful trade-off given the expected
 * rarity of this case and the large performance hit necessary to enforce
 * validity. See `isValid` below for more information.
 *
 */
function Tap(buf, pos) {
  this.buf = buf;
  this.pos = pos | 0;
}

/**
 * Check that the tap is in a valid state.
 *
 * For efficiency reasons, none of the methods below will fail if an overflow
 * occurs (either read, skip, or write). For this reason, it is up to the
 * caller to always check that the read, skip, or write was valid by calling
 * this method.
 *
 */
Tap.prototype.isValid = function () { return this.pos <= this.buf.length; };

// Read, skip, write methods.
//
// These should fail silently when the buffer overflows. Note this is only
// required to be true when the functions are decoding valid objects. For
// example errors will still be thrown if a bad count is read, leading to a
// negative position offset (which will typically cause a failure in
// `readFixed`).

Tap.prototype.readBoolean = function () { return !!this.buf[this.pos++]; };

Tap.prototype.skipBoolean = function () { this.pos++; };

Tap.prototype.writeBoolean = function (b) { this.buf[this.pos++] = !!b; };

Tap.prototype.readInt = Tap.prototype.readLong = function () {
  var n = 0;
  var k = 0;
  var buf = this.buf;
  var b, h, f, fk;

  do {
    b = buf[this.pos++];
    h = b & 0x80;
    n |= (b & 0x7f) << k;
    k += 7;
  } while (h && k < 28);

  if (h) {
    // Switch to float arithmetic, otherwise we might overflow.
    f = n;
    fk = 268435456; // 2 ** 28.
    do {
      b = buf[this.pos++];
      f += (b & 0x7f) * fk;
      fk *= 128;
    } while (b & 0x80);
    return (f % 2 ? -(f + 1) : f) / 2;
  }

  return (n >> 1) ^ -(n & 1);
};

Tap.prototype.skipInt = Tap.prototype.skipLong = function () {
  var buf = this.buf;
  while (buf[this.pos++] & 0x80) {}
};

Tap.prototype.writeInt = Tap.prototype.writeLong = function (n) {
  var buf = this.buf;
  var f, m;

  if (n >= -1073741824 && n < 1073741824) {
    // Won't overflow, we can use integer arithmetic.
    m = n >= 0 ? n << 1 : (~n << 1) | 1;
    do {
      buf[this.pos] = m & 0x7f;
      m >>= 7;
    } while (m && (buf[this.pos++] |= 0x80));
  } else {
    // We have to use slower floating arithmetic.
    f = n >= 0 ? n * 2 : (-n * 2) - 1;
    do {
      buf[this.pos] = f & 0x7f;
      f /= 128;
    } while (f >= 1 && (buf[this.pos++] |= 0x80));
  }
  this.pos++;
};

Tap.prototype.readFloat = function () {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 4;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.readFloatLE(pos);
};

Tap.prototype.skipFloat = function () { this.pos += 4; };

Tap.prototype.writeFloat = function (f) {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 4;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.writeFloatLE(f, pos);
};

Tap.prototype.readDouble = function () {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 8;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.readDoubleLE(pos);
};

Tap.prototype.skipDouble = function () { this.pos += 8; };

Tap.prototype.writeDouble = function (d) {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 8;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.writeDoubleLE(d, pos);
};

Tap.prototype.readFixed = function (len) {
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  var fixed = new Buffer(len);
  this.buf.copy(fixed, 0, pos, pos + len);
  return fixed;
};

Tap.prototype.skipFixed = function (len) { this.pos += len; };

Tap.prototype.writeFixed = function (buf, len) {
  len = len || buf.length;
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  buf.copy(this.buf, pos, 0, len);
};

Tap.prototype.readBytes = function () {
  return this.readFixed(this.readLong());
};

Tap.prototype.skipBytes = function () {
  var len = this.readLong();
  this.pos += len;
};

Tap.prototype.writeBytes = function (buf) {
  var len = buf.length;
  this.writeLong(len);
  this.writeFixed(buf, len);
};

Tap.prototype.readString = function () {
  var len = this.readLong();
  var pos = this.pos;
  var buf = this.buf;
  this.pos += len;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.utf8Slice(pos, pos + len);
};

Tap.prototype.skipString = function () {
  var len = this.readLong();
  this.pos += len;
};

Tap.prototype.writeString = function (s) {
  var len = Buffer.byteLength(s);
  this.writeLong(len);
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.utf8Write(s, pos, len);
};

// Helper used to speed up writing defaults.

Tap.prototype.writeBinary = function (str, len) {
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.binaryWrite(str, pos, len);
};

// Binary comparison methods.
//
// These are not guaranteed to consume the objects they are comparing when
// returning a non-zero result (allowing for performance benefits), so no other
// operations should be done on either tap after a compare returns a non-zero
// value. Also, these methods do not have the same silent failure requirement
// as read, skip, and write since they are assumed to be called on valid
// buffers.

Tap.prototype.matchBoolean = function (tap) {
  return this.buf[this.pos++] - tap.buf[tap.pos++];
};

Tap.prototype.matchInt = Tap.prototype.matchLong = function (tap) {
  var n1 = this.readLong();
  var n2 = tap.readLong();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchFloat = function (tap) {
  var n1 = this.readFloat();
  var n2 = tap.readFloat();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchDouble = function (tap) {
  var n1 = this.readDouble();
  var n2 = tap.readDouble();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchFixed = function (tap, len) {
  return this.readFixed(len).compare(tap.readFixed(len));
};

Tap.prototype.matchBytes = Tap.prototype.matchString = function (tap) {
  var l1 = this.readLong();
  var p1 = this.pos;
  this.pos += l1;
  var l2 = tap.readLong();
  var p2 = tap.pos;
  tap.pos += l2;
  var b1 = this.buf.slice(p1, this.pos);
  var b2 = tap.buf.slice(p2, tap.pos);
  return b1.compare(b2);
};

// Functions for supporting custom long classes.
//
// The two following methods allow the long implementations to not have to
// worry about Avro's zigzag encoding, we directly expose longs as unpacked.

Tap.prototype.unpackLongBytes = function () {
  var res = new Buffer(8);
  var n = 0;
  var i = 0; // Byte index in target buffer.
  var j = 6; // Bit offset in current target buffer byte.
  var buf = this.buf;
  var b, neg;

  b = buf[this.pos++];
  neg = b & 1;
  res.fill(0);

  n |= (b & 0x7f) >> 1;
  while (b & 0x80) {
    b = buf[this.pos++];
    n |= (b & 0x7f) << j;
    j += 7;
    if (j >= 8) {
      // Flush byte.
      j -= 8;
      res[i++] = n;
      n >>= 8;
    }
  }
  res[i] = n;

  if (neg) {
    invert(res, 8);
  }

  return res;
};

Tap.prototype.packLongBytes = function (buf) {
  var neg = (buf[7] & 0x80) >> 7;
  var res = this.buf;
  var j = 1;
  var k = 0;
  var m = 3;
  var n;

  if (neg) {
    invert(buf, 8);
    n = 1;
  } else {
    n = 0;
  }

  var parts = [
    buf.readUIntLE(0, 3),
    buf.readUIntLE(3, 3),
    buf.readUIntLE(6, 2)
  ];
  // Not reading more than 24 bits because we need to be able to combine the
  // "carry" bits from the previous part and JavaScript only supports bitwise
  // operations on 32 bit integers.
  while (m && !parts[--m]) {} // Skip trailing 0s.

  // Leading parts (if any), we never bail early here since we need the
  // continuation bit to be set.
  while (k < m) {
    n |= parts[k++] << j;
    j += 24;
    while (j > 7) {
      res[this.pos++] = (n & 0x7f) | 0x80;
      n >>= 7;
      j -= 7;
    }
  }

  // Final part, similar to normal packing aside from the initial offset.
  n |= parts[m] << j;
  do {
    res[this.pos] = n & 0x7f;
    n >>= 7;
  } while (n && (res[this.pos++] |= 0x80));
  this.pos++;

  // Restore original buffer (could make this optional?).
  if (neg) {
    invert(buf, 8);
  }
};

// Helpers.

/**
 * Invert all bits in a buffer.
 *
 * @param buf {Buffer} Non-empty buffer to invert.
 * @param len {Number} Buffer length (must be positive).
 *
 */
function invert(buf, len) {
  while (len--) {
    buf[len] = ~buf[len];
  }
}


module.exports = {
  abstractFunction: abstractFunction,
  capitalize: capitalize,
  compare: compare,
  toMap: toMap,
  singleIndexOf: singleIndexOf,
  hasDuplicates: hasDuplicates,
  Lcg: Lcg,
  OrderedQueue: OrderedQueue,
  Tap: Tap
};

}).call(this,require("buffer").Buffer)
},{"buffer":9}],7:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],8:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],9:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":8,"ieee754":10,"isarray":11}],10:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],14:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],15:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":14,"_process":12,"inherits":13}]},{},[1])(1)
});