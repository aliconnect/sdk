(function () {
  $().on('ready', event => {
    setTimeout(() => {
      $().url('/api/').get().then(event => {
        console.log(event.body);
        const par = {};
        (function loadpar(arr, path = '') {
          if (arr) {
            for (let [key,value] of Object.entries(arr)) {
              if (typeof value === 'object') {
                loadpar(value, `${path}${key}-`);
              } else {
                // console.log(`%${path}${key}%`,value);
                par[`%${path}${key}%`] = value;
              }
            }
          }
        })(event.body);
        $('list').load('/sdk/tools/contract/template/Verwerkers-overeenkomst.md', content => {
          for (let [key,value] of Object.entries(par)) {
            content = content.replace(key,value);
          }
          return content;
        });
      })
    }, 500);
  })
})();
