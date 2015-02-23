
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';

export default WidgetCollection.extend({

    /** update the filterTerm if there is a queryParam
     */
    filterTerm: Ember.computed.oneWay('queryParam'),

    filterEnabled: Ember.computed.bool('config.filter'),

    /** if there is a `queryParam` specified on the widget's config,
     * use. Otherwise,
     */
     queryParam: function(key, value) {
        var queryParam = this.get('config.filter.queryParam');

        if (queryParam) {
            key = 'currentController.'+queryParam;
        } else {
            key = '_queryParam';
        }

        if (arguments.length === 1) {
            return this.get(key);
        } else {
            this.set(key, value);
            return value;
        }

     }.property('config.filter.queryParam', 'currentController'),


    updateCollection: function() {
        var filterTerm = this.get('filterTerm');
        var query;

        if (filterTerm != null) {
            query = {'title[$iregex]': '^'+filterTerm};
        } else {
            query = {};
        }

        this.set('routeModel.query', query);
        this.set('queryParam', filterTerm);
    }.on('init'),


    label: function() {
        var _label = this.get('config.label');
        if (_label === 'auto') {
            return this.get('modelType');
        }
        return _label;
    }.property('config.label', 'modelType'),


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


    keyPress: function(e) {
        if (e.keyCode === 13) {
            this.updateCollection();
        }
    },


    actions: {
        clear: function() {
            this.set('filterTerm', null);
            this.updateCollection();
        }
    }


});
