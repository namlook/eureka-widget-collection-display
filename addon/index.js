
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';
import QueryParametrableWidgetMixin from 'eureka-mixin-query-parametrable-widget';


export default WidgetCollection.extend(QueryParametrableWidgetMixin, {

    /** set the queryParam (used for the QueryParametrableWidgetMixin),
     * to the widget's `config.filter.queryParam`
     */
    'config.queryParam': Ember.computed.alias('config.filter.queryParam'),

    modelRoute: Ember.computed.alias('modelRoute'),

    /** Make the filterTerm a queryParam if configured in `config` */
    filterTerm: Ember.computed.alias('queryParam'),

    /** if true, display the input filter */
    filterEnabled: Ember.computed.bool('config.filter'),

    emptyPlaceholder: Ember.computed.alias('config.emptyPlaceholder'),


    /** update the `routeModel.query` from `filterTerm` */
    updateQuery: function() {
        var filterTerm = this.get('filterTerm');
        var query = this.getWithDefault('routeModel.query.raw');

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
            return this.get('resource');
        }
        return _label;
    }.property('config.label', 'resource'),


    queryConfig: function() {
        var query = this.get('config.query');
        if (query) {
            query = JSON.parse(query);
        } else {
            query = {};
        }
        return query;
    }.property('config.query'),


    /** update the collection from the `routeModel.query` */
    collection: function() {
        var queryConfig = this.get('queryConfig');
        var routeQuery = this.get('routeModel.query.raw');
        Ember.setProperties(routeQuery, queryConfig);
        return this.get('store').find(routeQuery);
    }.property('routeModel.query.hasChanged', 'queryConfig', 'store'),


    /** update the query when the user hit the enter key */
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
