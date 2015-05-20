# Eureka-widget-collection-display

An Eureka widget to display a collection. Usage:

    {
        BlogPost: {
            views: {
                collection: {
                    index: {
                        // if you want to persiste the filter on the url,
                        // set the queryParams here
                        queryParams: ['search'],
                        widgets: [
                            {
                                type: "collection-display",

                                // Customise the label. If `label` is `auto`
                                // then display the pod type
                                label: "All the blog posts"

                                // if `filter` exists , an input will be displayed
                                // to filter the collection
                                filter: {
                                    queryParam: 'search' // should be in the view's queryParams
                                },

                                limit: 20,

                                sort: {
                                    // the property name to sort the results
                                    by: 'title',

                                    // if true, the results, will be sorted by ascending order
                                    ascendingOrder: true,

                                    // if allowedProperties is not null, the user can sort the
                                    // results by itself by the property he wants.
                                    // If `allowedProperties` is '*', the results can be sorted
                                    // by all properties. You can restrict the properties by
                                    // specifing a property names list
                                    allowedProperties: '*'
                                },


                                // what to display if the collection is empty
                                emptyPlaceholder: 'nothing to display here'
                            }
                        ]
                    }
                }
            }
        }
    }


## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
