'use strict';

const content = require('../tpl/index.tpl');
const layout = require('layout');

module.exports = layout.init({
  pageTitle: 'untitled',
  shareTitle: '',
  shareDesc: '',
  shareImgUrl: '',
  extCSS: [],
  extJS: []
}).run(content);
