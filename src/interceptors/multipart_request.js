import { entries } from '../utils';

const _ = require('lodash');
const FormData = require('form-data');
const fs = require('fs');

/**
   Wraps FormData's async getLength fn in a Promise
*/
const getLength = formData =>
  new Promise((resolve, reject) => {
    formData.getLength((err, length) => {
      if (err) {
        reject(err);
      } else {
        resolve(length);
      }
    });
  });

/**
   Takes `params` from `ctx` and converts to `FormData`.

   Accepted param types:

   - A ReadStream that can be used to read a file
   - A string denoting a path to a file


   Changes to `ctx`:

   - Modify `ctx.params`
 */
export default class MultipartRequest {
  enter({ params, headers: ctxHeaders, ...ctx }) {
    if (_.isPlainObject(params)) {
      const formData = entries(params).reduce((fd, entry) => {
        const [key, val] = entry;

        // convert a string param into a stream
        const value = _.isString(val) ? fs.createReadStream(val) : val;

        fd.append(key, value);
        return fd;
      }, new FormData());

      const formDataHeaders = formData.getHeaders();

      return getLength(formData)
        .then(length => ({
          params: formData,
          headers: {
            'Content-Length': length,
            ...formDataHeaders,
            ...ctxHeaders,
          },
          ...ctx,
        }))
        .catch(() => {
          throw new Error('Could not read multipart request payload length.');
        });
    }

    return { params, ...ctx };
  }
}
