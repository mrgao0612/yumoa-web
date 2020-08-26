/* eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars */
'use strict'

var $protobuf = require('protobufjs/light')

var $root = ($protobuf.roots['default'] || ($protobuf.roots['default'] = new $protobuf.Root()))
  .setOptions({
    java_package: 'com.yum.oa.common.im.protocol',
    java_outer_classname: 'MessageBase'
  })
  .addJSON({
    Message: {
      fields: {
        requestId: {
          type: 'string',
          id: 1
        },
        cmd: {
          type: 'CommandType',
          id: 2
        },
        content: {
          type: 'string',
          id: 3
        }
      },
      nested: {
        CommandType: {
          values: {
            NORMAL: 0,
            HEARTBEAT_REQUEST: 1,
            HEARTBEAT_RESPONSE: 2,
            OPEN: 3
          }
        }
      }
    }
  })

module.exports = $root
