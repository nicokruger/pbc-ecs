# PBC-ECS
Entity Component-System heavily based on TinyEcs, with one big difference - predefined systems to improve performance. All heavily-used systems can be added before-hand, with a callback function to be called for entities in the system, greatly reducing the number of list manipulations as opposed to just using queryComponent.



# TinyECS

[![Build Status](https://travis-ci.org/bvalosek/tiny-ecs.png?branch=master)](https://travis-ci.org/bvalosek/tiny-ecs)
[![NPM version](https://badge.fury.io/js/tiny-ecs.png)](http://badge.fury.io/js/tiny-ecs)

A mean lean Entity-Component-System library.

[![browser support](https://ci.testling.com/bvalosek/tiny-ecs.png)](https://ci.testling.com/bvalosek/tiny-ecs)

TinyECS is not a ready-to-go game engine framework, it is a small library of
some very performance critical pieces and common utility classes that can be
used to make a game from scratch.

See also:

* tiny-ecs-physics
* tiny-ecs-canvas-2d

## Installation

Works on the server or the browser (via [Browserify](http://browserify.org)):

```
npm install tiny-ecs
```

## Usage

Manage your entities via an `EntityManager` instance:

```javascript
var EntityManager = require('tiny-ecs').EntityManager;

var entities = new EntityManager();
```

### Creating Entities

Create an entity with the default `Transform` component:

```javascript
var hero = entities.create();
```

Or if you don't want to include the `Transform` component:

```javascript
var hero = entities.createEntity();
```

### Adding Components

A component is just a basic Javascript class.

```javascript
function PlayerControlled()
{
  this.gamepad = 1;
}
```

```javascript
function Sprite()
{
  this.image = 'hero.png';
}
```

Add the components:

```javascript
hero.addComponent(Damager).addComponent(Sprite);
```

We now have new data members on our entity for the components. TinyECS will add
an instance member that is the name of the component constructor, lowercased:

```javascript
hero.playerControlled.gamepad = 2;
hero.sprite.image === 'hero.png'; // true
```

Add arbitrary text tags to an entity:

```javascript
hero.addTag('player');
```

You can also remove components and tags in much the same way:

```javascript
hero.removeComponent(Sprite);
hero.removeTag('player');
```

To determine if an entity has a specific component:

```javascript
if (hero.hasComponent(Transform)) { ... }
```

And to check if an entity has ALL of a set of components:

```javascript
if (hero.hasAllComponents([Transform, Sprite])) { ... }
```

### Querying Entities

The entity manager is setup with indexed queries, allowing extremely fast
querying of the current entities. Querying entities returns an array of
entities.

Get all entities that have a specific set of components:

```javascript
var toDraw = entities.queryComponents([Transform, Sprite]);
```

Get all entities with a certain tag:

```javascript
var enemies = entities.queryTag('enemy');
```

### Removing Entities

```javascript
hero.remove();
```

### Creating Components

Any object constructor can be used as a component, nothing special required.
Components should be lean, primarily data containers, leaving all the heavy
lifting for the systems.

### Creating Systems

In TinyECS, there is no formal notion of a system. A system is considered any
context in which entities and their components are updated. As to how this
occurs will vary depending on your use.

In the example of a game, mainting a list of systems that are instantiated with
some sort of IoC container that request a list of entities seems like a good
idea.

```
function PhysicsSystem(entities)
{
  // Dependency inject -- reference to our EntityManager
  this.entities = entities;
}

PhysicsSystem.prototype.update = function(dt, time)
{
  var toUpdate = this.entities.queryComponents([Transform, RigidBody]);

  toUpdate.forEach(function(entity) { ... });
  ...
}
```

## Tern Support

The source files are all decorated with [JSDoc3](http://usejsdoc.org/)-style
annotations that work great with the [Tern](http://ternjs.net/) code inference
system. Combined with the Node plugin (see this project's `.tern-project`
file), you can have intelligent autocomplete for methods in this library.

## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`.

Automated CI cross-browser testing is provided by
[Testling](http://ci.testling.com/bvalosek/tiny-ecs).


## License
Copyright 2014 Brandon Valosek

**TinyECS** is released under the MIT license.


