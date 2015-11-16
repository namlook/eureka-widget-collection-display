
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

    /*** data export ***/
    allowExportData: Ember.computed.bool('config.export'),

    modelProperties: Ember.computed('routeModel.meta.fieldNames.[]', function() {
        let properties = [];
        for (let name of this.get('routeModel.meta.fieldNames')) {
            let property = this.get(`routeModel.meta.${name}Field`);
            properties.push(property);
        }
        return properties;
    }),

    selectedProperties: Ember.computed(function() {
        return Ember.A();
    }),

    /*** sorting ***/
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

    sortObserver: Ember.observer('sortBy', 'ascendingOrder', function() {
        this.incrementProperty('_updateCollection');
    }),

    /*** divers query options ***/
    offset: 0,
    limit: Ember.computed('config.limit', function() {
        return this.getWithDefault('config.limit', 20);
    }),

    totalResults: null,

    displayPanelHeading: Ember.computed.or('totalResults', 'label'),

    showOptionsControl: Ember.computed.or('sortingEnabled', 'allowExportData'),

    _updateCollection: 0,


    /** return the query **/
    getQuery: function() {
        let queryConfig = this.get('queryConfig');
        let query = this.get('routeModel.query.raw');

        Ember.setProperties(query, queryConfig);

        // var filterTerm = this.get('filterTerm');
        // if (filterTerm) {
        //     query['title[$iregex]'] = '^'+filterTerm;
        // } else if (!query['title[$iregex]']) {
        //     query['title[$iregex]'] = undefined;
        //     filterTerm = null;
        // }

        let sortBy = this.get('sortBy');
        if (sortBy) {
            if (!this.get('ascendingOrder')) {
                sortBy = '-'+sortBy;
            }
            query['_sort'] = sortBy;
        }

        query._limit = this.get('limit');
        query._offset = this.get('offset');

        let jsonApiQuery = {};
        let filters = {};
        Object.keys(query).forEach((key) => {
            if (key[0] === '_') {
                jsonApiQuery[key.slice(1)] = query[key];
            } else {
                filters[key] = query[key];
            }
        });

        jsonApiQuery.filter = filters;

        return jsonApiQuery;
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
        store.count(query).then((total) => {
            this.set('totalResults', total);
        });
        return store.find(query);
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
            console.log('toggleOrder!!!', this.get('ascendingOrder'));
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
        },
        exportData: function(format) {
            let query = this.getQuery();
            var apiEndpoint = this.get('routeModel.meta.store.resourceEndpoint');
            delete query.limit;
            delete query.offset;
            let queryString = '';
            if (query.filter) {
                for (let propertyName of Object.keys(query.filter)) {
                    if (queryString) {
                        queryString = `${queryString}&`;
                    }
                    let value = query.filter[propertyName];

                    if (typeof value === 'object') {
                        for (let operator of Object.keys(value)) {
                            let val = encodeURIComponent(value[operator]);
                            queryString = `${queryString}filter[${propertyName}][${operator}]=${val}`;
                        }
                    } else {
                        value = encodeURIComponent(value);
                        queryString  = `${queryString}filter[${propertyName}]=${value}`;
                    }
                }
            }

            if (query.sort) {
                if (queryString) {
                    queryString = `${queryString}&`;
                }
                queryString = `${queryString}sort=${query.sort}`;
            }

            let selectedLength = this.get('selectedProperties.length');
            if (selectedLength) {
                let selectedFields = this.get('selectedProperties');
                let modelPropertiesLength = this.get('modelProperties.length');
                if (selectedLength !== modelPropertiesLength) {
                    if (queryString) {
                        queryString = `${queryString}&`;
                    }
                    queryString += `fields=${selectedFields.join(',')}`;
                }
            }

            var url = `${apiEndpoint}/i/stream/${format}?${queryString}`;
            window.open(url);
        }
    }


});
