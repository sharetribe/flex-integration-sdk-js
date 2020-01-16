const _ = require('lodash');
const FormData = require('form-data');

/**
   Wraps FormData's async getLength fn in a Promise
*/
const getLength = formData =>  new Promise((resolve, reject) => {
  formData.getLength((err, length) => {
    if (err) {
      reject(err);
    } else {
      resolve(length);
    }
  });
});

/**
   Takes `params` from `ctx` and converts to `FormData`

   Changes to `ctx`:

   - Modify `ctx.params`
 */
export default class MultipartRequest {
  enter({ params, headers: ctxHeaders, ...ctx }) {
    if (_.isPlainObject(params)) {
      /* eslint-disable no-undef */
      const formData = _.reduce(
        params,
        (fd, val, key) => {
          fd.append(key, val);
          return fd;
        },
        new FormData()
      );
      /* eslint-enable no-undef */

      const formDataHeaders = formData.getHeaders();

      return getLength(formData)
        .then(length => ({
          params: formData,
          headers: {
            'Content-Length': length,
            ...formDataHeaders,
            ...ctxHeaders
          },
          ...ctx
        }))
        .catch(() => {
          throw new Error("Could not read multipart request payload length.");
        });
    }

    return { params, ...ctx };
  }
}
