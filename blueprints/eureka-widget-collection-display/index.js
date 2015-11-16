module.exports = {
  description: '',

  normalizeEntityName: function() {
    // allows us to run ember -g eureka-widget-collection-display and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },

  afterInstall: function(options) {
    // return this.addAddonsToProject({
    //   packages: [
    //     'emberek-multiselect',
    //     'ember-bootstrap-hurry',
    //   ]
    // });
  }
};
