## Kanso.js support for the Stripe API and webhooks

`stripe_kanso` is a [Kanso][kanso] Couch app to work with the Stripe payments system, in particular, the webhooks events.

## Using webhooks

Stripe webhooks *can* work directly with CouchDB; however, the `stripe_webhook` update function adds some features.

In your Stripe settings, set the webhook URL:

* Test: `http://user:password@example.iriscouch.com/db/_design/stripe/_update/stripe_webhook?debug=true&keep=true`
* Live: `https://user:password@example.iriscouch.com/db/_design/stripe/_update/stripe_webhook`

For security, `stripe_webhook` strips all information from the incoming JSON except the event ID. To keep this data, add `?keep=true` to the URL.

## Views

This app includes a few views to dig through events (if you used `?keep=true`).

* *stripe_created* sorts events by their creation timestamp
* *stripe_mode_created* sorts events
  1. First, by their `livemode` status (either `true` or `false`)
  2. Second, by their creation timestamp

## License

Apache 2.0

[kanso]: http://kan.so
