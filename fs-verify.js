/*!
 * @license
 * Fs-Verify v0.0.9
 * Required library - jQuery, lodash
 * Author - Falsy <https://falsy.me>
 * MIT License. <http://www.opensource.org/licenses/MIT>
 */


;(function($, _){
  "use strict";

  var VERSION,
      CONFIG,
      fsVerify;

  VERSION = '0.0.9';

  CONFIG = {
    options : {
      alert : false,
      focus : false,
      lang : 'koKR',
      verify : {
        element : ['IFRAME', 'SCRIPT', 'META', 'FRAMESET', 'FRAME', 'EMBED', 'OBJECT', 'MAP', 'AREA'],
        property : ['onclick', 'ondblclick', 'onload', 'onsubmit', 'onscroll', 'onblur', 'onfocus', 'onclose', 'ondrag']
      },
      regexp : {
        date : /[1-2][0-9][0-9][0-9]\-(([0][0-9])|([1][0-2]))\-(([0-2][0-9])|([3][0-1]))$/,
        time : /^(([0-1][0-9])|([2][0-4]))\:([0-5][0-9])$/,
        email : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        sign : /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/
      }
    },
    lang : {
      koKR : {
        require : '정보를 입력해주세요.',
        minlength : '자 이상 입력 해주세요.',
        maxlength : '자 이하로 입력 해주세요.',
        atarray : '잘못된 값을 입력하셨습니다.',
        date : '잘못된 날짜 형식입니다. (ex. 2016.03.21)',
        time : '잘못된 시간 형식입니다. (ex. 13:40)',
        email : '잘못된 이메일 형식입니다. (ex. mail@email.com)',
        number : '숫자만 입력할 수 있습니다.',
        element : '는 사용할 수 없습니다.',
        property : '속성은 사용할 수 없습니다.',
        nonsign : '특수문자를 사용할 수 없습니다.',
        hasclass : '지정된 클레스가 없습니다 (attribute)',
        hascheck : '필수 선택 사항입니다.',
        minnumbersize : ' 이상의 수를 입력해주세요.',
        maxnumbersize : ' 이하의 수를 입력해주세요.'
      }
    },
    VERSION : VERSION
  };


  // 네이밍 중첩 확인
  if(!(_.isUndefined($.fsVerifyConfig) && _.isUndefined($.fn.fsVerify))) {
    return console.log('error : plugin function name overlap');
  }

  /**
   * 전체의 기본 플러그인의 옵션을 수정 선언합니다.
   *
   * @static
   * @since 0.0.1
   * @param {Object} 기본 옵션을 수정합니다.
   * @param {Object} 기본 오류 메세지를 수정합니다.
   * @returns {Object} 옵션 객체를 리턴합니다.
   */
  $.fsVerifyConfig = function(options, lang) {
    if(options) {
      CONFIG.options = _.defaultsDeep(options, CONFIG.options);
    }
    if(lang) {
      CONFIG.lang = _.defaultsDeep(lang, CONFIG.lang);
    }
    return CONFIG;
  };

  /**
   * 플러그인의 실행 메서드입니다. 개별적으로 옵션을 수정하여 실행 할 수 있습니다.
   *
   * @static
   * @since 0.0.1
   * @param {Object} 기본 옵션을 수정합니다.
   * @param {Object} 기본 오류 메세지를 수정합니다.
   * @returns {Function} 플러그인을 실행합니다.
   */
  $.fn.fsVerify = function(options, lang) {
    CONFIG = $.fsVerifyConfig(options, lang);
    return fsVerify(this);
  };

  /**
   * 대상의 하위 엘리먼트들에 검증을 실행합니다.
   *
   * @private
   * @since 0.0.1
   * @param {Object} 대상 엘리먼트
   * @returns {Object | null} 오류가 있다면 오류 객체를 리턴합니다.
   */
  fsVerify = function(_this) {

    // Prefix
    var ATTR_PREFIXES = 'data-fv-';


    // Language
    var LANGUAGE = CONFIG.lang[CONFIG.options.lang];


    // Options
    var VERIFY = CONFIG.options.verify,
      REGEXP = CONFIG.options.regexp;


    // Err
    var error;


    // Select Element
    var $verifScope = $(_this),
      verifFnc = {},
      verifList = [
        'require', 'email', 'date', 'time', 'minlength', 'maxlength', 'atarray',
        'number', 'element', 'property', 'nonsign', 'hasclass', 'hascheck', 'minnumbersize',
        'maxnumbersize'
      ];


    /**
     * ---------------------------------------------------------------------------------------------
     * 입력받은 값 검증에 필요한 함수입니다.
     */

    /**
     * 엘리먼트의 타입을 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @returns {String} 대상 엘리먼트의 값을 리턴합니다.
     */
    function isElementType(el) {
      if($(el).length > 0 && ($(el)[0].nodeName === 'INPUT' || $(el)[0].nodeName === 'TEXTAREA')) {
        return $(el).val();
      }
      return $(el).text();
    }

    /**
     * 검증시 예외를 추가합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {String} 예외로 선언된 것들을 제외한 문자열을 리턴합니다.
     */
    function isException(target, verifName) {
      var value = isElementType(target);

      if($(target).attr(ATTR_PREFIXES + verifName + '-exc')) {
        var exc = setArray($(target).attr(ATTR_PREFIXES + verifName + '-exc')),
          excValue = '',
          key,
          reg;

        for(key in exc){
          if(exc.hasOwnProperty(key)){
            if(key == 0) {
              excValue = exc[key];
            } else {
              excValue = excValue + '|' + exc[key];
            }
          }
        }

        reg = new RegExp(excValue, 'g');
        value = value.replace(reg, '');
      }
      return value;
    }

    /**
     * 배열 검증시 예외를 추가합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {Array} 검증에 사용한 허용 문자열의 배열
     * @param {String} 검증할 항목 이름
     * @returns {Array} 예외 항목을 제외한 배열을 리턴합니다.
     */
    function isArrayException(target, dataArray, verifName) {
      if($(target).attr(ATTR_PREFIXES + verifName + '-exc')) {
        var exc = setArray($(target).attr(ATTR_PREFIXES + verifName + '-exc'));
        return _.union(exc, dataArray);
      } else {
        return dataArray;
      }
    }

    /**
     * 배열 형태의 문자열을 배열로 바꾸어 리턴합니다.
     *
     * @private
     * @since 0.0.1
     * @param {String} 배열 형태의 문자열
     * @returns {Array} 인자로 받은 값을 배열로 리턴하며 잘못된 값이거나 빈 값일 경우 빈 배열을 리턴합니다.
     */
    function setArray(str) {
      if(typeof(str) === 'string' && str !== '') {
        str = str.replace(/'/g, '"');
        str = JSON.parse(str);
      } else if(str === '') {
        str = [];
      }
      return str;
    }


    /**
     * ---------------------------------------------------------------------------------------------
     * 검증에 실패할 경우 오류 결과를 리턴하는 함수 입니다.
     */

    /**
     * 대상 엘리먼트에 선언된 오류 메세지를 확인하여 리턴합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @param {Object} 추가할 메세지 문자열 객체
     * @returns {String | Function} 추가로 선언된 메세지가 있다면 그 메세지를 출력하며 없다면 기본 메세지를 출력합니다.
     */
    function errMessage(target, verifName, addMsg) {
      var basicErr = ATTR_PREFIXES + 'err',
        detailErr = ATTR_PREFIXES + verifName + '-err';

      if($(target).attr(detailErr)) {
        return $(target).attr(detailErr);
      }
      if($(target).attr(basicErr)) {
        return $(target).attr(basicErr);
      }
      return errMessageBeforeAfter(verifName, addMsg);
    }

    /**
     * 오류 메시지 전, 후에 추가 메세지 문자열을 더합니다.
     *
     * @private
     * @since 0.0.1
     * @param {String} 검증할 항목 이름
     * @param {Object} 추가할 메세지 문자열 객체
     * @returns {String} 추가할 메세지 문자열 있다면 더해서 리턴합니다.
     */
    function errMessageBeforeAfter(verifName, addMsg) {
      var errMsg;

      errMsg = LANGUAGE[verifName];
      errMsg = addMsg && addMsg.beforeMsg ? addMsg.beforeMsg + errMsg : errMsg;
      errMsg = addMsg && addMsg.afterMsg ? errMsg + addMsg.afterMsg : errMsg;
      return errMsg;
    }

    /**
     * 옵션에 포커스가 선택되어 있다면 검증이 실패한 엘리먼트에 포커스를 주고 오류 객체를 리턴합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @param {String} 오류 메세지
     * @returns {Object} 검증이 실패한 항목과 오류메세지 그리고 대상 엘리먼트를 객체로 리턴합니다.
     */
    function errResult(target, verifName, msg) {
      if(CONFIG.options.focus) {
        $(target).focus();
      }
      return error = {err : verifName, msg : msg, el : $(target)};
    }

    /**
     * 옵션에 얼랏이 선택되어 있다면 오류 메세지의 경고창을 띄우고 오류 객체를 리턴합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 검증된 오류 객체
     * @returns {Object} 검증이 실패한 항목과 오류메세지 그리고 대상 엘리먼트를 객체로 리턴합니다.
     */
    function returnVerification(error) {
      if(CONFIG.options.alert) {
        alert(error.msg);
      }
      return error;
    }


    /**
     * ---------------------------------------------------------------------------------------------
     * 검사 항목을 검증하는 함수 입니다.
     */

    /**
     * 해당 엘리먼트의 값이 있는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _require(target, verifName) {
      if(isElementType(target) === '') {
        return errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값의 최소 길이 이상인지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _minlength(target, verifName) {
      var minLength = Number($(target).attr(ATTR_PREFIXES + verifName));

      if(isNaN(minLength) || minLength === '') {
        return console.log(ATTR_PREFIXES + verifName + ' : NaN', $(target));
      }
      if(String(isElementType(target)).length < minLength) {
        errResult(target, verifName, errMessage(target, verifName, {beforeMsg : minLength}));
      }
    }

    /**
     * 해당 엘리먼트의 값의 최대 길이 이하인지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _maxlength(target, verifName) {
      var maxLength = Number($(target).attr(ATTR_PREFIXES + verifName));

      if(isNaN(maxLength) || maxLength === '') {
        return console.log(ATTR_PREFIXES + verifName +' : NaN', $(target));
      }
      if(String(isElementType(target)).length > maxLength) {
        errResult(target, verifName, errMessage(target, verifName, {beforeMsg : maxLength}));
      }
    }

    /**
     * 해당 엘리먼트의 값이 검증에 선언된 배열안에 일치하는 항목이 있는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _atarray(target, verifName) {
      var dataArray;
      dataArray = setArray($(target).attr(ATTR_PREFIXES + verifName));
      dataArray = isArrayException(target, dataArray, verifName);

      if(_.indexOf(dataArray, isElementType(target)) === -1) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값이 날짜 형식이 맞는지 확인합니다. (ex. 2000-01-02)
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _date(target, verifName) {
      if(isElementType(target) === '') {
        return;
      }
      if(!(REGEXP.date.test(isElementType(target)))) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값이 시간 형식이 맞는지 확인합니다. (ex. 14:25)
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _time(target, verifName) {
      if(isElementType(target) === '') {
        return;
      }
      if(!(REGEXP.time.test(isElementType(target)))) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값이 이메일 형식이 맞는지 확인합니다. (ex. mail@mail.com)
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _email(target, verifName) {
      if(!(REGEXP.email.test(isElementType(target)))) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값이 숫자이 맞는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _number(target, verifName) {
      var value = isException(target, verifName);

      if(isNaN(Number(value))) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 안에 검증할 엘리먼트의 이름이 있는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _element(target, verifName) {
      var $elList = $(target).find('*');

      _($elList).forEach(function(value){
        if(!(_.indexOf(VERIFY.element, value.nodeName) < 0)) {
          errResult(target, verifName, errMessage(target, verifName, {beforeMsg : '<'+value.nodeName+'>'}));
        }
      });
    }

    /**
     * 해당 엘리먼트의 안에 검증할 프로퍼티를 가진 엘리먼트가 있는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _property(target, verifName) {
      var $elList = $(target).find('*'),
        listLeng = $elList.length,
        i;

      for(i=0; i<listLeng; i++) {
        _($elList[i].attributes).forEach(function(value) {
          if(!(_.indexOf(VERIFY.property, value.nodeName) < 0)) {
            errResult(target, verifName, errMessage(target, verifName, {beforeMsg : value.nodeName}));
          }
        });
      }
    }

    /**
     * 해당 엘리먼트의 값에 특수 문자가 사용되었는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _nonsign(target, verifName) {
      var value = isException(target, verifName);

      if(REGEXP.sign.test(value)) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트가 검증할 클래스를 포함했는지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _hasclass(target, verifName) {
      var className = $(target).attr(ATTR_PREFIXES + verifName);

      if(!$(target).hasClass(className)) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트가 체크되어 있는지 확인합니다.
     * (input 타입 radio / checkbox 만 해당됩니다.)
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _hascheck(target, verifName) {
      if(!$(target)[0].checked) {
        errResult(target, verifName, errMessage(target, verifName));
      }
    }

    /**
     * 해당 엘리먼트의 값(수)가 지정된 값(수)보다 큰지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _minnumbersize(target, verifName) {
      var minSize = Number($(target).attr(ATTR_PREFIXES + verifName));

      if(isNaN(minSize) || minSize === '' || isNaN(Number(isElementType(target)))) {
        return console.log(ATTR_PREFIXES + verifName +' : NaN', $(target));
      }
      if(Number(isElementType(target)) < minSize) {
        errResult(target, verifName, errMessage(target, verifName, {beforeMsg : minSize}));
      }
    }

    /**
     * 해당 엘리먼트의 값(수)가 지정된 값(수)보다 작은지 확인합니다.
     *
     * @private
     * @since 0.0.1
     * @param {Object} 대상 엘리먼트
     * @param {String} 검증할 항목 이름
     * @returns {Function} 검증 실패 함수를 실행합니다.
     */
    function _maxnumbersize(target, verifName) {
      var maxSize = Number($(target).attr(ATTR_PREFIXES + verifName));

      if(isNaN(maxSize) || maxSize === '' || isNaN(Number(isElementType(target)))) {
        return console.log(ATTR_PREFIXES + verifName +' : NaN', $(target));
      }
      if(Number(isElementType(target)) > maxSize) {
        errResult(target, verifName, errMessage(target, verifName, {beforeMsg : maxSize}));
      }
    }


    // Insert Functions
    verifFnc.require = _require;
    verifFnc.minlength = _minlength;
    verifFnc.maxlength = _maxlength;
    verifFnc.atarray = _atarray;
    verifFnc.date = _date;
    verifFnc.time = _time;
    verifFnc.email = _email;
    verifFnc.number = _number;
    verifFnc.element = _element;
    verifFnc.property = _property;
    verifFnc.nonsign = _nonsign;
    verifFnc.hasclass = _hasclass;
    verifFnc.hascheck = _hascheck;
    verifFnc.minnumbersize = _minnumbersize;
    verifFnc.maxnumbersize = _maxnumbersize;


    /**
     * 플러그인 검증을 실행합니다. 플러그인 메서드를 실행한 영역안에서 하위 엘리먼트를 순회하며 순차적으로 검증 프로퍼티가 있는지
     * 확인, 값이 일치하지 않을 경우 오류 객체를 리턴합니다.
     *
     * @private
     * @since 0.0.1
     * @returns {Function | boolean} 검증 오류가 있다면 오류 객체를 리턴하며 없다면 'false'를 리턴합니다.
     */
    function init() {
      var verifLeng = verifList.length,
          $targetEl = $verifScope.find('*'),
          elLeng = $targetEl.length,
          i, j;

      for(i=0;i<elLeng;i++) {
        for(j=0;j<verifLeng;j++) {
          var $targetElement = $($targetEl[i]),
            verifName = verifList[j];

          if(!_.isUndefined($targetElement.attr(ATTR_PREFIXES+verifName))) {
            error = false;
            verifFnc[verifName]($targetElement, verifName);
            if(error) {
              return returnVerification(error);
            }
          }
        }
      }

      return false;
    }

    return init();
  };

})(jQuery, _);