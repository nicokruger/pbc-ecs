module.exports = EntityManager;
var ObjectPool = require('./ObjectPool.js');
var Entity     = require('./Entity.js');

function EntityManager(messenger) {
  this._entityPool = new ObjectPool(Entity);
  this._entities = [];
  this._systems = [];
}

EntityManager.prototype.createEntity = function() {
  var entity = this._entityPool.aquire();

  this._entities.push(entity);
  entity._manager = this;
  return entity;
};
EntityManager.prototype.entityAddComponent = function(entity, Component) {
  throw new Error('implement');
  if (~entity._Components.indexOf(Component)) return;

  entity._Components.push(Component);

  // Create the reference on the entity to this (aquired) component
  var cName = componentPropertyName(Component);
  var cPool = this._componentPools[cName];
  if (!cPool)
    cPool = this._componentPools[cName] = new ObjectPool(Component);
  var component = cPool.aquire();
  entity[cName] = component;

  // Check each indexed group to see if we need to add this entity to the list
  for (var groupName in this._groups) {
    var group = this._groups[groupName];

    // Only add this entity to a group index if this component is in the group,
    // this entity has all the components of the group, and its not already in
    // the index.
    if (!~group.Components.indexOf(Component))
      continue;
    if (!entity.hasAllComponents(group.Components))
      continue;
    if (~group.entities.indexOf(entity))
      continue;

    group.entities.push(entity);
  }

  this._trigger(EntityManager.COMPONENT_ADDED, entity, Component);
};

