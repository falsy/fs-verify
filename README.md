# Fs-Verify
클라이언트단에서 다양한 엘리먼트의 값을 검증할 수 있습니다.<br>
[필수 라이브러리: jQuery, lodash]<br>
jQuery URL : http://jquery.com/<br>
lodash URL : https://lodash.com/

### example
html
```html
	<script src="jquery.js"></script>
	<script src="lodash.js"></script>
	<script src="fs-verify.js"></script>
	...

	<div id="verify-scope">
		<p data-fv-require>text</p>
		<!-- p 엘리먼트에 내용이 있는지 확인 -->
		<input data-fv-minlength="5" value="12345">
		<!-- value 값이 5자 이상인지 확인 -->
		<span data-fv-atarry="[11,22,33]">11</span>
		<!-- span 엘리먼트의 내용이 배열중에 일치하는 값이 있는지 -->
		<input data-fv-email value="email@email.com">
		<!-- value 값이 이메일 형식을 하고 있는지 확인 -->
		...

	</div>
	<button id="verify-btn">검증</button>
```
javascript
```js
	jQuery(document).ready(function($){
		$.fsVerifyConfig({ alert : true, focus : true });
		// 기본 환결 설정 (검증오류시 경고창을 띄우고 해당 엘리먼트에 포커스)
		$('#verify-btn').on('click', function(){
			var err = $('#verify-scope').fsVerify();
			// #verify-scope 안의 엘리먼트를 대상으로 검증을 실행
			if(err) return console.log(err);
			// 검증에 실패하면 err 객체를 로그로 리턴
			// ex. {el:n.fn.init[1], err: "require", msg: "정보를 입력해주세요."}
		});
	});
```
검증의 확장<br>
html
```html
	<div id="verify-scope">
		<p data-fv-require data-fv-number>123</p>
		<!-- p 엘리먼트에 내용이 있고 그 내용이 숫자인지 확인 -->
		<p data-fv-require data-fv-number data-fv-err="잘못된 값을 입력하셨습니다.">text</p>
		<!-- + 직접 오류 메세지 설정 -->
		<p data-fv-require data-fv-number data-fv-requie-err="잘못된 값을 입력하셨습니다." data-fv-number-err="값은 숫자만 가능합니다.">text</p>
		<!-- + 항목별 오류 메세지 설정 -->
		<p data-fv-number data-fv-number-exc="[',','원']">10,000원</p>
		<!-- 예외 설정 : 숫자만 가능하지만 ',' '원'은 허용-->
	</div>
```



### ChangeLog

#### v0.0.9
1. 값(수)의 크기에 따른 검증을 할 수 있습니다.
(data-fv-minnumbersize, data-fv-maxnumbersize)

#### v0.0.8
1. 엘리먼트 순서대로 검증을 실행합니다.
2. 예제 추가

#### v0.0.3
1. 플러그인의 기본 옵션을 수정할 수 있습니다.
2. 클래스를 검증할 수 있습니다.
3. 체크박스가 체크되어 있는지 검증할 수 있습니다.

#### v0.0.2
1. Lodash 라이브러리를 사용합니다.
2. 추가로 오류 메세지를 개별적으로 선언할 수 있습니다.
3. 대상의 하위 엘리먼트의 이름과 프로퍼티를 검증 할 수 있습니다.
4. 특수문자를 검증할 수 있습니다.
5. 정규 표현식 옵션 추가

#### v0.0.1
1. 플러그인 추가
