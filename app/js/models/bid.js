BidManager.Models.BidModel = Fulcrum.Model.extend({
  url: function() {
    return BidManager.apiRoot + 'Bids/' + this.id;
  },

  defaults: {
    name: 'My Default Name',
    status: 'Open'
  },

  validate: {
    name: 'required'
  },

  // gets called upon `new BidManager.Models.BidModel()`
  // any args passed in get piped to this initialize fn  
  initialize: function() {

  },

  // parse gets called after every remote call that receives a response
  // `sync` and `fetch` will process the response and update model properties
  // as necessary
  parse: function(response) {
    return response.Bid;
  }

});

var response = {
  Bid: {
    name: 'My Bid Name',
    status: 'Open'
  }
};

var bid = new BidManager.Models.BidModel(response.Bid);