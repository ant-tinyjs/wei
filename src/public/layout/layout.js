var headerEjs = require('./head.tpl');
var footerEjs = require('./foot.tpl');

var extend = require('extend');
var extCSS = [];
var extJS = [];
var defaulteExtJS = ['https://a.alipayobjects.com/static/fastclick/1.0.6/fastclick.min.js'];

function Template(data) {
  var pf = {
    pageTitle: '',
    shareTitle: '',
    shareImgUrl: '',
    shareDesc: '',
    extCSS: [],
    extJS: []
  };
  data = data || {};
  extend(pf, data);
  if (pf.extCSS.length !== 0) {
    pf.extCSS.forEach(function (link) {
      extCSS.push(`<link rel="stylesheet" type="text/css" href="${link}">`);
    });
    pf.extCSS = extCSS.join('');
  }
  pf.extJS.concat(defaulteExtJS).forEach(function (link) {
    extJS.push(`<script src="${link}"></script>`);
  });
  extJS.push(`<script>
    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
          typeof FastClick !== 'undefined' && FastClick.attach(document.body);
      }, false);
    }
    </script>`);
  this.run = function (contentEjs) {
    var header = headerEjs(pf);
    var footer = footerEjs(pf);
    var content = contentEjs(pf);
    return header + content + extJS.join('') + footer;
  };
}

module.exports.init = function (data) {
  return new Template(data);
};
