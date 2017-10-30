'use strict';
import '../css/index.less';

const config = {
  showFPS: true, // 显示帧频
  dpi: 2, // 分辨率
  renderOptions: {
    backgroundColor: 0x2a3145 // 画布背景色
  }
};
const app = new Tiny.Application(config);

class layer extends Tiny.Container {
  constructor() {
    super();
    const txt = new Tiny.Text('你好，Tiny.js！', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 'white'
    });
    const antSprite = new Tiny.Sprite(Tiny.Loader.resources[RESOURCE['s_Tiny.js_png']].texture);
    const {width, height} = Tiny.WIN_SIZE;
    const action1 = Tiny.MoveTo(3000, Tiny.point(width - antSprite.width, height - antSprite.height));

    antSprite.runAction(Tiny.RepeatForever(Tiny.Back(action1)));
    txt.setAnchor(0.5);
    txt.setPosition(Tiny.WIN_SIZE.width / 2, Tiny.WIN_SIZE.height / 2);
    this.addChild(antSprite, txt);
  }
}

Tiny.Loader.run({
  resources: Object.values(RESOURCE),
  onProgress: function (pre, res) {
    console.log('percent:', pre + '%', res.name);
  },
  onAllComplete: function () {
    /* eslint-disable new-cap */
    app.run(new layer());
  }
});

