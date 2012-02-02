/**
 * jquery.autosave.js
 *
 *   require jStore
 *   require jQuery
 *
 * @todo 複数要素を同時に保存し、メッセージを出すようにしたい
 *       コールバック定義。targetをどのレベルで保持するか
 */
(function(){
  jQuery.extend(jQuery.jStore.defaults, {
    project: 'jquery.autosave',
    engine: 'flash',
    flash: '../lib/jStore.Flash.html'
  })
  $(function(){
    jQuery.jStore.load();
  });

  var create = function(name){
    return $(document.createElement(name));
  }
  var enabled = function(){
    this.attr('disabled', false);
    this.css('backgroundColor', this.__bg);
  }
  var disabled = function(){
    this.__bg = this.css('backgroundColor');
    this.attr('disabled', true);
    this.css('backgroundColor', '#CCC');
  }
  var df = {
    format: function(date){
      var hoge =
        ([date.getFullYear(), date.getMonth()+1, date.getDay()].join('/')) +
        ' ' +
        ([date.getHours(), date.getMinutes(), date.getSeconds()].join(':'));
      return hoge;
    }
  }
  var date = function(time){
    if (time == null){
      time = new Date();
    }
    return df.format(time);
  }
  var getUniqueId = function(target){
    var id = target.attr('id') || target.attr('name');
    return 'jquery-autosave' + id;
  }
  var defaultParams = {
//    beforeSave: function(){
//
//    },
//    afterSave: function(savedData, target){
//
//    },
//    beforeLoad: function(){
//
//    },
//    afterLoad: function(savedData){
//
//    },
    getOptionData: function(){
      return {url: document.URL, domain: document.domain, created_at: new Date().getTime()};
    },
    isCancelSaving: function(savedData, target){
      return savedData && savedData.body == target.val();
    },
    isAvailable: function(savedData){
      return savedData && savedData.url == document.URL;
    }
  }
  var run = function(engine, target, params){
    params = $.extend({}, defaultParams, params);
    if (!params.uniqueId){
      params.uniqueId = getUniqueId(target);
    }
    var savedData = null;
    var messenger = null;
    var save = function(){
      var value = target.val();

      if (params.isCancelSaving(savedData, target)){
        return false;
      }

      var data = $.extend(params.getOptionData(), {'body': value});

      savedData = engine.set(params.uniqueId, data)

      if (messenger == null){
        messenger = $(document.createElement('span'))
          .insertAfter(target)
          .css({
            fontSize: '10px'
          })
      }
      messenger.text(date() + ' にバックアップを保存しました');
//      params.afterSave(savedData, target);
      return true;
    }
    var observe = function(){
      target.keyup(save);
    }
    var showLoadDialog = function(savedData){
      var dialog = $(document.createElement('div'));
      dialog.text('保存されなかったデータがあります。');
      dialog.appendTo(document.body);
      dialog.css({
        fontSize: '10px',
        backgroundColor: '#FFF',
        border: '1px solid #999',
        textAlign: 'center'
      });
      var offset = target.offset();
      dialog.css({
        position: 'absolute',
        width: target.width() * 2 / 3,
        top: offset.top + target.height() / 2 - dialog.height(),
        left: offset.left + target.width() / 2 - target.width() * 2 / 3 / 2
      });

      disabled.call(target);
      dialog.append(
        $(document.createElement('div'))
        .append(
          $(document.createElement('a')).attr('href', '#').text('復元する').click(function(){
            target.val(savedData.body);
            enabled.call(target);
            dialog.remove();
            return false;
          }).css('margin', '0 5px')
        ).append(
          $(document.createElement('a')).attr('href', '#').text('何もしない').click(function(){
            enabled.call(target);
            dialog.remove();
            return false;
          })
        )
      )
    }
    savedData = engine.get(params.uniqueId);
    if (params.isAvailable(savedData)){
      showLoadDialog(savedData);
    }
    observe();
  }

  jQuery.fn.autosave = function(params){
    var self = this;
    jQuery.jStore.ready(function(engine){
      jQuery.jStore.flashReady(function(){
        engine.ready(function(){
          run(engine, self, params);
        })
      })
    });
    return this;
  }

})();
