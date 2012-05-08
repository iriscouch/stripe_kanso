// Stripe helpers and utilities
//
// Copyright 2011 Iris Couch
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

var ddoc = module.exports = {'updates':{}, 'views':{}, 'filters':{}}


ddoc.validate_doc_update = function(newDoc, oldDoc, userCtx, secObj) {
  if(~userCtx.roles.indexOf('_admin') && 0)
    return log('Allowing admin update')

  if(oldDoc)
    throw {'forbidden':'Stripe documents may not change'}

  if(!newDoc.id)
    throw {'forbidden':'Required field: .id'}

  if(newDoc._id != newDoc.id)
    throw {'forbidden':'Doc id (from Stripe) must match doc._id (for CouchDB)'}
}

ddoc.updates.stripe_webhook = function(doc, req) {
  // Use ?debug=true to enable debug logging
  var couch_log = log
  log = debug_log

  var response = {'ok':true, 'strip':false}
  log('Receive Stripe webhook: ' + req.body)

  try        { doc = JSON.parse(req.body) }
  catch (er) { return fail('Bad JSON body: ' + JSON.stringify(req.body)) }

  // Use ?keep=true to disable stripping all information except the ID.
  if(!req.query.keep) {
    log('Stripping all Stripe data except the event id: ' + doc.id)
    response.strip = true
    doc = {'id':doc.id}
  }

  doc._id = doc.id

  log('Stripe webhook doc:' + JSON.stringify(doc))
  return respond(201)

  //
  // Utilities
  //

  function fail(reason) {
    log('Stripe ERROR: ' + JSON.stringify(reason))
    doc = null
    return respond(400, {'error':reason})
  }

  function respond(code, body) {
    body = body || response
    body = JSON.stringify(body) + "\n"
    return [doc, {'code':code, 'body':body}]
  }

  function debug_log() {
    if(req.query.debug)
      Array.prototype.slice.apply(arguments).forEach(function(obj) {
        couch_log(obj)
      })
  }
}


//
// Maybe some helpful views
//

ddoc.views.stripe_created = {'reduce':'_count'}
ddoc.views.stripe_created.map = function(doc) {
  if(typeof doc.created == 'number')
    emit(doc.created, 1)
}


ddoc.views.stripe_mode_created = {'reduce':'_count'}
ddoc.views.stripe_mode_created.map = function(doc) {
  if(typeof doc.created != 'number')
    return

  var data = doc.data || {}
    , object = data.object || {}

  if('livemode' in object)
    emit([ !!object.livemode, doc.created ], 1)
}

//
// Filters
//

ddoc.filters.stripe_livemode = function(doc, req) {
  var data = doc.data || {}
    , object = data.object || {}
    , is_live = !! object.livemode

  var want_live = true
  if(req.query.livemode === false || req.query.livemode == 'false')
    want_live = false

  return (want_live && is_live) || (!want_live && !is_live)
}
