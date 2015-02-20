import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';

export default WidgetCollection.extend({

    header: function() {
        var headerTitle = this.get('config.header');
        if (headerTitle === 'auto') {
            return this.get('modelType');
        }
        return this.get('config.header');
    }.property('config.header', 'modelType'),

    queryConfig: function() {
        var query = this.get('config.query');
        if (query) {
            query = JSON.parse(query);
        } else {
            query = {};
        }
        return query;
    }.property('config.query'),

    collection: function() {
        var queryConfig = this.get('queryConfig');
        var routeQuery = this.get('routeModel.query') || {};
        routeQuery = JSON.parse(JSON.stringify(routeQuery));
        Ember.setProperties(routeQuery, queryConfig);
        return this.get('modelStore').find(routeQuery);
    }.property('routeModel.query', 'queryConfig'),

});
