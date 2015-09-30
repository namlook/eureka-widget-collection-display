
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
    // filterTerm: null,

    /** if true, display the input filter */
    // filterEnabled: Ember.computed.bool('config.filter'),

    emptyPlaceholder: Ember.computed.alias('config.emptyPlaceholder'),

    sortingEnabled: Ember.computed.bool('sortingProperties'),
    sortBy: Ember.computed('config.sort.by', function() {
        return this.getWithDefault('config.sort.by', 'title');
    }),

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

    offset: 0,
    limit: Ember.computed('config.limit', function() {
        return this.getWithDefault('config.limit', 20);
    }),

    totalResults: null,

    displayPanelHeading: Ember.computed.or('totalResults', 'label'),

    showOptionsControl: Ember.computed.or('sortingEnabled'),//, 'filterEnabled'),

    _updateCollection: 0,


    /** return the query **/
    getQuery: function() {
        var queryConfig = this.get('queryConfig');
        var query = this.get('routeModel.query.raw');

        Ember.setProperties(query, queryConfig);

        // var filterTerm = this.get('filterTerm');
        // if (filterTerm) {
        //     query['title[$iregex]'] = '^'+filterTerm;
        // } else if (!query['title[$iregex]']) {
        //     query['title[$iregex]'] = undefined;
        //     filterTerm = null;
        // }

        var sortBy = this.get('sortBy');
        if (sortBy) {
            if (!this.get('ascendingOrder')) {
                sortBy = '-'+sortBy;
            }
            query['_sortBy'] = sortBy
        }

        var limit = this.get('limit');
        var offset = this.get('offset');
        query._limit = limit;
        query._offset = offset;

        return query;
    },


    queryObserver: Ember.observer('routeModel.query.hasChanged', function() {
        this.set('offset', 0);
        this.updateCollection();
    }),

    paginationObserver: Ember.observer('offset', 'limit', function() {
        this.updateCollection();
    }),

    updateCollection: function() {
        this.incrementProperty('_updateCollection');
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
    collection: Ember.computed('_updateCollection', 'queryConfig', 'store', function() {
        var query = this.getQuery();
        var store = this.get('store');
        var that = this;
        store.count(query).then(function(data) {
            that.set('totalResults', data.total);
        });
        return store.find(query);
    }),


    sortObserver: Ember.observer('sortBy', 'ascendingOrder', function() {
        this.incrementProperty('_updateCollection');
    }),

    displayPreviousButton: Ember.computed('offset', 'limit', function() {
        var offset = this.get('offset');
        if (offset > 0) {
            return true;
        }
    }),

    displayNextButton: Ember.computed('totalResults', 'offset', 'limit', function() {
        var total = this.get('totalResults');
        var offset = this.get('offset');
        var limit = this.get('limit');
        if (total > offset+limit) {
            return true;
        }
    }),

    displayPagination: Ember.computed.or('displayPreviousButton', 'displayNextButton'),


    // /** update the query when the user hit the enter key */
    // keyPress: function(e) {
    //     if (e.keyCode === 13) {
    //         this.incrementProperty('_updateCollection');

    //     }
    // },


    actions: {
        // clear: function() {
        //     this.set('filterTerm', null);
        //     this.incrementProperty('_updateCollection');

        // },
        toggleOrder: function() {
            this.toggleProperty('ascendingOrder');
        },
        goToBeginning: function() {
            this.set('offset', 0);
        },
        goToEnd: function() {
            var totalResults = this.get('totalResults');
            var limit = this.get('limit');
            this.set('offset', totalResults-limit);
        },
        displayPrevious: function() {
            var offset = this.get('offset');
            if (offset > 0) {
                var limit = this.get('limit');
                this.set('offset', offset - limit);
            }
        },
        displayNext: function() {
            var offset = this.get('offset');
            var limit = this.get('limit');
            this.set('offset', offset+limit);
        }
    }


});
