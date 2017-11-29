var abcSideBar = {
	messageBox: null,
	pageObj: null,

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;
			this.messageBox = params.pageObj['messageBox'];
		}
	},

	showABCSideBar: function(params){
		var list = params.list || [];
		var panel = params.bindObj;
		var outer;
		var mask;
		var inner;

		if(params.list.length <= 1){
			return false;
		}

		outer = document.createElement('span');
		outer.className = params.css || 'abc-side-bar-outer';
		outer.setAttribute('id', 'abcSideBarOuter')

		mask = document.createElement('div');
		mask.className = 'abc-side-bar-mask';

		inner = document.createElement('span');
		inner.innerHTML = this.getSideBarHtml(list).join('');

		outer.appendChild(mask);
		outer.appendChild(inner);
		panel.appendChild(outer);
	},

	getSideBarHtml: function(list){
		var content = [];
		var height;
		//var floatNumb;

		height = ((1/list.length)*100 + '%');
		//floatNumb = parseFloat(((1/list.length) + '').match(/(\d.\d\d)/g)[0]);
		//height = (floatNumb*100 + '%');

		content.push('<ul id="sideBarLit" class="abc-side-bar-list" ontouchstart="abcSideBar.slideBarScroll(event);" ontouchmove="abcSideBar.touchMoveScroll(event);">');


		list.forEach(function(key){
			var value;

			if(key === '#'){
				value =  'other';
			}else{
				value = key;
			}

			content.push('<li style="height:' + height + ';"><a for-id="ABC_key_' + value + '">' + key + '</a></li>');
		});
		content.push('</ul>');

		return content;
	},

	slideBarScroll: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'a'){
			this.doSlideBarScroll(target);
		}

		event.stopPropagation();
		event.preventDefault();
	},

	touchMoveScroll: function(event){
		var navDom = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);

		if(navDom && navDom.tagName.toLowerCase() === 'a'){
			this.doSlideBarScroll(navDom);
		}

		event.preventDefault();
		event.stopPropagation();
	},

	doSlideBarScroll: function(target){
		var a = document.querySelector('#' + target.getAttribute('for-id'));
		if(a){
			this.getTopForNavigator(a);
		}
	},

	getTopForNavigator: function(node, offset){
		//var gap = document.querySelector('#listContent').offsetTop;
		var gap = 0;

		if(!offset){
			var offset = {};
			offset.top = 0;
			offset.left = 0;
		}

		offset.top += node.offsetTop - gap;
		offset.left += node.offsetLeft;

		this.doNavigatorScroll(offset);
	},

	doNavigatorScroll:function(offset){
		var body = document.querySelector('#patient-list');
		var gap = 3;

		body.scrollTop = offset.top + gap;

	}
};