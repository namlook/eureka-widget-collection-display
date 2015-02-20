# Eureka-widget-collection-display

An Eureka widget to display a collection. Usage:

    {
        BlogPost: {
            views: {
                collection: {
                    index: {
                        widgets: [
                            {
                                type: "collection-display",
                                // customise the header. If `header` is `auto`
                                // then display the pod type
                                header: "All the blog posts"
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
