const EntityManager = require('../manager.js');
var assert = require('assert');
describe('entity managerj', function() {
  describe('should return an entity', function() {
    it('should return a new entity', function() {
      const manager = new EntityManager();
      const entity = manager.createEntity();
      assert.notEqual(0,entity.id);
    });
    it('should have the component', function() {
      function TestComponent() {
        this.bla = 5;
      }
      TestComponent.__name = 'test';
      const manager = new EntityManager();
      const entity = manager.createEntity();
      entity.addComponent(TestComponent);
      assert.equal(entity.test,5);
    });
  });
});
