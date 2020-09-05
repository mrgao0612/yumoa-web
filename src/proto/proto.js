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
        senderId: {
          type: 'string',
          id: 1
        },
        senderAvatar: {
          type: 'string',
          id: 2
        },
        receiverId: {
          type: 'string',
          id: 3
        },
        cmd: {
          type: 'CommandType',
          id: 4
        },
        content: {
          type: 'string',
          id: 5
        }
      },
      nested: {
        CommandType: {
          values: {
            MESSAGE: 0,
            NOTICE: 1,
            OPEN: 2
          }
        }
      }
    }
  })

module.exports = $root
