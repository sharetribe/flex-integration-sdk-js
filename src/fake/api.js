export const marketplace = {
  show: (config, resolve) => {
    const res = `["^ ",
                     "~:data", ["^ ",
                       "~:id", "~u${config.params.id}",
                       "~:type", "~:marketplace",
                       "~:attributes", ["^ ",
                         "~:name", "Awesome skies.",
                         "~:description", "Meet and greet with fanatical sky divers."],
                       "~:relationships", ["^ "]],
                     "~:meta", ["^ "],
                     "~:included", []]`;

    return resolve({
      data: res,
      headers: { 'content-type': 'application/transit+json;charset=UTF-8' },
    });
  },
};

export const users = {
  show: (config, resolve) => {
    const res = `["^ ",
                   "~:data", ["^ ",
                     "~:id", "~u0e0b60fe-d9a2-11e6-bf26-cec0c932ce01",
                     "~:type", "~:user",
                     "~:attributes", ["^ ",
                       "~:email", "user@sharetribe.com",
                       "~:description", "A team member"],
                     "~:relationships", ["^ "]],
                   "~:meta", ["^ "],
                   "~:included", []]`;

    return resolve({
      data: res,
      headers: { 'content-type': 'application/transit+json;charset=UTF-8' },
    });
  },
};

export const listings = {
  query: (config, resolve) => {
    const res = `["^ ",
                   "~:data", [
                     ["^ ",
                       "~:id", "~u9009efe1-25ec-4ed5-9413-e80c584ff6bf",
                       "~:type", "~:listing",
                       "~:links", ["^ ",
                         "~:self", "/v1/api/listings/show?id=9009efe1-25ec-4ed5-9413-e80c584ff6bf"],
                       "~:attributes", ["^ ",
                         "~:title", "Nishiki 401",
                         "~:description", "27-speed Hybrid. Fully functional.",
                         "~:address", "230 Hamilton Ave, Staten Island, NY 10301, USA",
                         "~:geolocation", [
                           "~#geo", [40.64542, -74.08508]]],
                       "~:relationships", ["^ ",
                         "~:author", ["^ ",
                           "^4", ["^ ",
                             "~:related", "/v1/api/users/show?id=3c073fae-6172-4e75-8b92-f560d58cd47c"]],
                         "~:marketplace", ["^ ",
                           "^4", ["^ ",
                             "^>", "/v1/api/marketplace/show"]]]],
                     ["^ ",
                       "^1", "~u5e1f2086-522c-46f3-87b4-451c6770c833",
                       "^2", "^3",
                       "^4", ["^ ",
                         "^5", "/v1/api/listings/show?id=5e1f2086-522c-46f3-87b4-451c6770c833"],
                       "^6", ["^ ",
                         "^7", "Pelago Brooklyn",
                         "^8", "Goes together perfectly with a latte and a bow tie.",
                         "^9", "230 Hamilton Ave, Staten Island, NY 10301, USA",
                         "^:", [
                           "^;", [40.64542, -74.08508]]],
                       "^<", ["^ ",
                         "^=", ["^ ",
                           "^4", ["^ ",
                             "^>", "/v1/api/users/show?id=3c073fae-6172-4e75-8b92-f560d58cd47c"]],
                         "^?", ["^ ",
                           "^4", ["^ ",
                             "^>", "/v1/api/marketplace/show"]]]]],
                   "~:meta", ["^ "],
                   "~:included", []]`;

    return resolve({
      data: res,
      headers: { 'content-type': 'application/transit+json;charset=UTF-8' },
    });
  },

  show: (config, resolve, reject) => {
    if (config.params.id === 'eeeeeeee-eeee-eeee-eeee-000000000500') {
      return reject({
        status: 500,
        statusText: 'Internal server error',
        data: 'Internal server error',
        headers: { 'content-type': 'text/plain' },
      });
    }

    throw new Error('Not implemented');
  },
};
