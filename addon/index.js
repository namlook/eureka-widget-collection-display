
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';
import QueryParametrableWidgetMixin from 'eureka-mixin-query-parametrable-widget';


export default WidgetCollection.extend(QueryParametrableWidgetMixin, {

    /** set the queryParam (used for the QueryParametrableWidgetMixin),
     * to the widget's `config.filter.queryParam`
     */
    // 'config.queryParam': Ember.computed.alias('config.filter.queryParam'),

    /** Make the filterTerm a queryParam if configured in `config` */
    // filterTerm: Ember.computed.alias('queryParam'),
    filterTerm: null,

    /** if true, display the input filter */
    filterEnabled: Ember.computed.bool('config.filter'),

    emptyPlaceholder: Ember.computed.alias('config.emptyPlaceholder'),

    sortingEnabled: Ember.computed.bool('sortingProperties'),
    sortBy: Ember.computed.alias('config.sort.by'),
    ascendingOrder: Ember.computed('config.sort.ascendingOrder', function() {
        return !!this.get('config.sort.ascendingOrder') || true;
    }),

    sortingProperties: Ember.computed('config.sort.allowedProperties',
     'routeModel.meta.fieldNames.[]', function() {
        var allowedProperties = this.get('config.sort.allowedProperties');
        if (allowedProperties === '*') {
            return this.get('routeModel.meta.fieldNames');
        }
        return allowedProperties;
    }),

    showOptionsControl: Ember.computed.or('sortingEnabled', 'filterEnabled'),

    _updateCollection: 0,


    /** return the query **/
    getQuery: function() {
        var queryConfig = this.get('queryConfig');
        var query = this.get('routeModel.query.raw');

        Ember.setProperties(query, queryConfig);

        var filterTerm = this.get('filterTerm');
        if (filterTerm) {
            query['title[$iregex]'] = '^'+filterTerm;
        } else if (!query['title[$iregex]']) {
            query['title[$iregex]'] = undefined;
            filterTerm = null;
        }

        var sortBy = this.get('sortBy');
        if (sortBy) {
            if (!this.get('ascendingOrder')) {
                sortBy = '-'+sortBy;
            }
            query['_sortBy'] = sortBy
        }

        return query;
    },


    label: Ember.computed('config.label', 'resource', function() {
        var _label = this.get('config.label');
        if (_label === 'auto') {
            return this.get('resource');
        }
        return _label;
    }),


    queryConfig: Ember.computed('config.query', function() {
        var query = this.get('config.query');
        if (query) {
            query = JSON.parse(query);
        } else {
            query = {};
        }
        return query;
    }),


    /** update the collection from the `routeModel.query` */
    collection: Ember.computed('routeModel.query.hasChanged', '_updateCollection', 'queryConfig', 'store', function() {
        var query = this.getQuery();
        return this.get('store').find(query);
    }),


    sortObserver: Ember.observer('sortBy', 'ascendingOrder', function() {
        this.incrementProperty('_updateCollection');
    }),


    /** update the query when the user hit the enter key */
    keyPress: function(e) {
        if (e.keyCode === 13) {
            this.incrementProperty('_updateCollection');

        }
    },


    actions: {
        clear: function() {
            this.set('filterTerm', null);
            this.incrementProperty('_updateCollection');

        },
        toggleOrder: function() {
            this.toggleProperty('ascendingOrder');
        },
    }


});
