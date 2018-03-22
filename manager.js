module.exports = EntityManager;
var ObjectPool = require('./ObjectPool.js');
var Entity     = require('./Entity.js');

function EntityManager(messenger) {
  this._entityPool = new ObjectPool(Entity);
  this._entities = [];
  this._systems = [];
  this._systemsPools = {};
  this._systemEntities = {};
  this._tags = {};
}

EntityManager.prototype.addSystem = function (Component, func, before, after) {
  this._systems.push({
    Component:Component,
    func:func,
    before:before,
    after:after
  })
  var name = componentPropertyName(Component);
  if (!this._systems[name]) {
    this._systemsPools[name] = new ObjectPool(Component);
    this._systemEntities[name] = [];
  }
}

EntityManager.prototype.runSystems = function (dt) {
  var length = this._systems.length;
  for (var i = 0; i < length; i++) {
    var func = this._systems[i].func;
    var before = this._systems[i].before;
    var after = this._systems[i].after;
    var Component = this._systems[i].Component;

    if (before) {
      if (before(dt) === false) {
        continue;
      };
    }
    if (!func) {
      if (after) {
        after(dt);
      }
      continue;
    }
    var name = componentPropertyName(Component);
    var ents = this._systemEntities[name];
    var entsLength = ents.length;
    for (var j = 0; j < entsLength; j++) {
      var ent = ents[j];
      if (!ent) {
        continue;
      }
      if (func(dt, ent) === false) {
        continue;
      }
    }
    if (after) {
      after(dt);
    }

  }
}

EntityManager.prototype.createEntity = function() {
  var entity = this._entityPool.aquire();

  this._entities.push(entity);
  entity._manager = this;
  return entity;
};
EntityManager.prototype.entityAddComponent = function(entity, Component) {
  if (~entity._Components.indexOf(Component)) return;

  entity._Components.push(Component);

  // Create the reference on the entity to this (aquired) component
  var cName = componentPropertyName(Component);
  //console.log('add', cName);
  if (!this._systemsPools[cName]) {
    console.error('dont know system of', cName);
  }
  var component = this._systemsPools[cName].aquire();
  entity[cName] = component;

  this._systemEntities[cName].push(entity);

  // Check each indexed group to see if we need to add this entity to the list
};



/**
 * @param {Entity} entity
 * @param {Function} Component
 */
EntityManager.prototype.entityRemoveComponent = function(entity, Component)
{
  var index = entity._Components.indexOf(Component);
  if (!~index) return;

  const name = componentPropertyName(Component);

  const systemEntities = this._systemEntities[name];
  systemEntities.splice(systemEntities.indexOf(entity), 1)

  // Remove T listing on entity and property ref, then free the component.
  var propName = componentPropertyName(Component);
  entity._Components.splice(index, 1);
  var component = entity[propName];
  delete entity[propName];
  this._systemsPools[propName].release(component);
};


/**
 * Drop an entity. Returns it to the pool and fires all events for removing
 * components as well.
 * @param {Entity} entity
 */
EntityManager.prototype.removeEntity = function(entity)
{
  var index = this._entities.indexOf(entity);

  if (!~index)
    throw new Error('Tried to remove entity not in list');

  this.entityRemoveAllComponents(entity);

  // Remove from entity list
  this._entities.splice(index, 1);

  // Remove entity from any tag groups and clear the on-entity ref
  entity._tags.length = 0;
  for (var tag in this._tags) {
    var entities = this._tags[tag];
    var n = entities.indexOf(entity);
    if (~n) entities.splice(n, 1);
  }

  // Prevent any acecss and free
  entity._manager = null;
  this._entityPool.release(entity);
};

EntityManager.prototype.removeAllEntities = function()
{
  for (var x = this._entities.length - 1; x >= 0; x--) {
    this._entities[x].remove();
  }
};

/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.entityAddTag = function(entity, tag)
{
  var entities = this._tags[tag];

  if (!entities)
    entities = this._tags[tag] = [];

  // Don't add if already there
  if (~entities.indexOf(entity)) return;

  // Add to our tag index AND the list on the entity
  entities.push(entity);
  entity._tags.push(tag);
};

/**
 * Drop all components on an entity. Avoids loop issues.
 * @param {Entity} entity
 */
EntityManager.prototype.entityRemoveAllComponents = function(entity)
{
  var Cs = entity._Components;

  for (var j = Cs.length - 1; j >= 0; j--) {
    var C = Cs[j];
    entity.removeComponent(C);
  }
};

/**
 * Get a list of entities that all have a certain tag.
 * @param {String} tag
 * @return {Array.<Entity>}
 */
EntityManager.prototype.queryTag = function(tag)
{
  var entities = this._tags[tag];

  if (entities === undefined)
    entities = this._tags[tag] = [];

  return entities;
};


/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.entityRemoveTag = function(entity, tag)
{
  var entities = this._tags[tag];
  if (!entities) return;

  var index = entities.indexOf(entity);
  if (!~index) return;

  // Remove from our index AND the list on the entity
  entities.splice(index, 1);
  entity._tags.splice(entity._tags.indexOf(tag), 1);
};

function componentPropertyName(Component)
{
  var name = Component.__name;
  return name;
}

