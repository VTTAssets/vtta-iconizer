let utils = {
  findByProperty: (arr, property, searchString) => {
    function levenshtein(a, b) {
      var tmp;
      if (a.length === 0) {
        return b.length;
      }
      if (b.length === 0) {
        return a.length;
      }
      if (a.length > b.length) {
        tmp = a;
        a = b;
        b = tmp;
      }

      var i,
        j,
        res,
        alen = a.length,
        blen = b.length,
        row = Array(alen);
      for (i = 0; i <= alen; i++) {
        row[i] = i;
      }

      for (i = 1; i <= blen; i++) {
        res = i;
        for (j = 1; j <= alen; j++) {
          tmp = row[j - 1];
          row[j - 1] = res;
          res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
        }
      }
      return res;
    }

    const maxDistance = 3;
    let minDistance = 100;
    let nearestHit = undefined;

    if (!Array.isArray(arr)) return undefined;
    arr
      .filter((entry) => entry.hasOwnProperty(property))
      .forEach((entry) => {
        let distance = levenshtein(searchString, entry[property]);
        if (distance <= maxDistance && distance < minDistance) {
          nearestHit = entry;
        }
      });

    return nearestHit;
  },
  // Thanks, @Atropos!
  async serverFileExists(src) {
    return fetch(src, { method: 'HEAD' })
      .then((resp) => {
        return resp.status < 400;
      })
      .catch((err) => false);
  },
  loadJSON: (path) => {
    return new Promise((resolve, reject) => {
      var http = new XMLHttpRequest();
      //http.setRequestHeader('Content-Type', 'application/json');
      http.onreadystatechange = function () {
        console.log("++++++++++++++++++');Download started");
        if (this.readyState == 4) {
          console.log('LOAD JSON ++++++++++++++++++');
          console.log(this.status);
          // parse the templates
          if (this.status === 200) {
            console.log(JSON.parse(this.responseText));
            resolve(JSON.parse(this.responseText));
          } else {
            reject(this.status);
          }
        }
      };
      http.open('GET', path, true);
      http.send();
    });
  },
  log: (obj) => {
    const LOG_PREFIX = 'VTTA Iconizer';
    if (CONFIG && CONFIG.debug && CONFIG.debug.vtta && CONFIG.debug.vtta.iconizer)
      switch (typeof obj) {
        case 'object':
        case 'array':
          console.log(`${LOG_PREFIX} | ${typeof obj}`);
          console.log(obj);
          break;
        default:
          console.log(`${LOG_PREFIX} | ${obj}`);
      }
  },
  // checks for a given file
  // serverFileExists: path => {
  //   return new Promise((resolve, reject) => {
  //     let http = new XMLHttpRequest();
  //     http.open("HEAD", path);
  //     http.onreadystatechange = function() {
  //       if (this.readyState == this.DONE) {
  //         if (this.status !== 404) {
  //           resolve(path);
  //         } else {
  //           reject(path);
  //         }
  //       }
  //     };
  //   });
  // }
};

export default utils;
