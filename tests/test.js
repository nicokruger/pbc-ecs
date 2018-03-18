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
      manager.addSystem(TestComponent, () => {
      });
      const entity = manager.createEntity();
      entity.addComponent(TestComponent);
      assert.equal(entity.test.bla,5);
    });

    it('should iterate over the systems', function (done) {
      function TestComponent() {
        this.bla = 5;
      }
      TestComponent.__name = 'test';
      const manager = new EntityManager();
      manager.addSystem(TestComponent, (dt, ent) => {
        assert.equal(ent.test.bla,5);
        done();
      });
      const entity = manager.createEntity();
      entity.addComponent(TestComponent);

      manager.runSystems();
    });

    it('should be possible to remove a component', function () {
      function TestComponent() {
        this.bla = 5;
      }
      TestComponent.__name = 'test';
      const manager = new EntityManager();

      let hit = 0;
      manager.addSystem(TestComponent, (dt, ent) => {
        hit++;
      });

      const entity = manager.createEntity();
      entity.addComponent(TestComponent);
      assert.equal(manager._systemsPools.test.freeList.length, 0);

      entity.removeComponent(TestComponent);

      manager.runSystems();

      assert.equal(hit, 0);
      assert.equal(manager._systemsPools.test.freeList.length, 1);
    });

    it('should be possible to remove an entity', function () {
      function TestComponent() {
        this.bla = 5;
      }
      TestComponent.__name = 'test';
      const manager = new EntityManager();

      let hit = 0;
      manager.addSystem(TestComponent, (dt, ent) => {
        hit++;
      });

      const entity = manager.createEntity();
      entity.addComponent(TestComponent);
      assert.equal(manager._systemsPools.test.freeList.length, 0);

      entity.remove();

      manager.runSystems();

      assert.equal(hit, 0);
      assert.equal(manager._systemsPools.test.freeList.length, 1);
    });


  });
});
