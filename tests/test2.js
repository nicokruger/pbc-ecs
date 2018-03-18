const EntityManager = require('../manager.js');
var assert = require('assert');
describe('entity manager 2', function() {
    it('should be possible to do stuff', function () {
      function TestComponent() {
        this.bla = 5;
      }
      TestComponent.__name = 'test';
      function TestComponent2() {
        this.bla2 = 5;
      }
      TestComponent2.__name = 'test2';
      const manager = new EntityManager();

      let testHit = 0;
      let testHit2 = 0;
      manager.addSystem(TestComponent, (dt, ent) => {
        testHit++;
      });
      manager.addSystem(TestComponent2, (dt, ent) => {
        testHit2++;
      });

      let entity = manager.createEntity();
      entity.addComponent(TestComponent);
      entity.addComponent(TestComponent2);

      entity = manager.createEntity();
      entity.addComponent(TestComponent);

      manager.runSystems();

      assert.equal(testHit, 2);
      assert.equal(testHit2, 1);
      
      testHit = testHit2 = 0;

      entity.remove();

      manager.runSystems();

      assert.equal(testHit, 1);
      assert.equal(testHit2, 1);
    });

});
