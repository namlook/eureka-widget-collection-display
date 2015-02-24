
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';



export default WidgetCollection.extend({

    /** add the `controllerQueryParam` as an alias of the
     *  controller's queryParam. The name of the attribute is
     * taken from `config.queryParam`
     */
    _addControllerQueryParamProperty: function() {
        var queryParam = this.get('config.queryParam');
        if (queryParam) {
            this.reopen({
                controllerQueryParam: Ember.computed.alias('currentController.'+queryParam)
            });
            this.set('queryParam', this.get('controllerQueryParam'));
            this.updateQuery();
        }
     }.on('init'),


    /** if the `controllerQueryParam` changed (url is modified via the back button),
     * update the filterTerm to match the changes and update the query
     */
    _controllerQueryParamObserver: function() {
        var controllerQueryParam = this.get('controllerQueryParam');
        if (this.get('queryParam') !== controllerQueryParam) {
            this.set('queryParam', controllerQueryParam);
            this.updateQuery();
        }
    }.observes('controllerQueryParam'),


    /** when the query has been update,
     *  if the filterTerm doesn't match the
     *  controllerQueryParam, update the later.
     */
    _routeModelQueryObserver: function() {
        var queryParam = this.get('queryParam');
        if (queryParam !== this.get('controllerQueryParam')) {
            this.set('controllerQueryParam', queryParam);
        }
    }.observes('routeModel.query.hasChanged'),



    /** update the filterTerm if there is a queryParam
     */
    filterTerm: Ember.computed.alias('queryParam'),

    filterEnabled: Ember.computed.bool('config.filter'),


    updateQuery: function() {
        var filterTerm = this.get('filterTerm');
        var query = this.get('routeModel.query.raw');

        if (filterTerm) {
            query['title[$iregex]'] = '^'+filterTerm;
        } else {
            query['title[$iregex]'] = undefined;
            filterTerm = null;
        }

        this.set('routeModel.query.raw', query);
    },



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
        var routeQuery = this.get('routeModel.query.raw');
        Ember.setProperties(routeQuery, queryConfig);
        return this.get('modelStore').find(routeQuery);
    }.property('routeModel.query.hasChanged', 'queryConfig'),


    keyPress: function(e) {
        if (e.keyCode === 13) {
            this.updateQuery();
        }
    },


    actions: {
        clear: function() {
            this.set('filterTerm', null);
            this.updateQuery();
        }
    }


});
