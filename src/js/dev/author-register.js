var authorRegister = {
	ajax: null,
	messageBox: null,
	popWindow: null,
	agreeContract: false,
	validateTarget: null,
	validateCodeActive: false,
	userNameLen:{
		max: 15,
		min: 2
	},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		this.attachEvent();
	},

	handlePanelClick: function(event){
		var target = event.target
		if(target.getAttribute('id') === 'chooseUserType' || target.tagName.toLowerCase() === 'b'){
			if(target.tagName.toLowerCase() === 'b'){
				target = target.parentNode;
			}
			this.changeAgreeStatus(target);

		}else if(target.getAttribute('id') === 'getValidateCode'){
			event.stopPropagation();
			event.preventDefault();

			this.getValidateCode(target);

		}else if(target.getAttribute('id') === 'doRegister'){
			event.stopPropagation();
			event.preventDefault();

			this.doRegister();

		}else if(target.getAttribute('id') === 'checkDorContract'){

			event.stopPropagation();
			this.showContract();

		}
	},

	changeAgreeStatus: function(target){
		var checkBoX = target.querySelectorAll('b')[0];

		if(checkBoX.className.indexOf('selected') >= 0){
			checkBoX.className = '';
			this.agreeContract = false;
		}else{
			checkBoX.className = 'selected';
			this.agreeContract = true;
		}
	},

	getValidateCode: function(target){
		var phoneNo = document.querySelector('#phoneNo').value;

		if(!(phoneNo && phoneNo !== '' && (/^1[0-9][0-9]\d{4,8}$/).test(phoneNo))){
			this.messageBox.show({
				msg:'请输入正确的手机号码', 
				type:'alert', 
				autoClose: true
			});
			return;
		}

		if(!this.validateCodeActive){
			this.sendCodeToUser();
		}
	},

	showContract: function(){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.title = '医生注册协议';
		param.space = {
			top: 20,
			left: 20
		};
		param.content = this.getContractHtml();
		param.buttons.push(
			{
				text: '同 意',
				css: 'save x2',
				callback: 'authorRegister.agreeContractCallback()'
			},

			{
				text: '取 消',
				css: 'cancel x2',
				callback: 'authorRegister.dontAgreeContractCallback()'
			}
			
		);

		this.popWindow.show(param);
	},

	agreeContractCallback: function(){
		document.querySelectorAll('#chooseUserType b')[0].className = 'selected';
		this.agreeContract = true;
		this.popWindow.hide();
	},

	dontAgreeContractCallback: function(){
		this.popWindow.hide();
	},

	getContractHtml: function(){
		var html = [];

		html.push('<section class="dor-contract">');
		//html.push('<h1>医生</h1>');
		//html.push( '<aside>大白云诊使用协议</aside>');
		html.push( '<i>本协议由同意并承诺遵守本协议规定使用七乐康大白云诊端平台服务的法律实体（下称"咨询医师"）、广州七乐康药业连锁有限公司（下称"七乐康"）共同缔结，本协议具有合同效力。</i>');
		html.push( '<h2>一、定义</h2>');
		html.push( '<ol>');
		html.push( '<li>1、服务平台：本协议具体指七乐康的“大白云诊端”和用户（患者）使用的“大白用户端”的合称。</li>');
		html.push( '<li>2、咨询医师：指同意并承诺遵守本协议规定使用“大白云诊端”平台向服务平台的用户提供医疗咨询解答等服务的享有相应资质的医生。</li>');
		html.push( '<li>3、服务：指咨询医师通过本协议服务平台向服务平台用户提供医疗问题解答，医疗知识传播等。</li>');
		html.push( '<li>4、诊所账户：是指咨询医师在服务平台上，用于接收咨询的个人实名账户。</li>');
		html.push( '<li>5、账户：用于接收服务平台上服务费的个人实名银行账户。</li>');
		html.push( '</ol>');

		html.push( '<h2>二、协议内容及生效</h2>');
		html.push( '<ol>');
		html.push( '<li>1、本协议内容包括协议正文及所有服务平台已经发布的或将来可能发布的各类规则。所有规则为协议不可分割的一部分，与协议正文具有同等法律效力。七乐康将就服务平台制定特别规则（下称"特别规则"），如特别规则与服务平台其他规则存在冲突，则以特别规则为准。</li>');
		html.push( '<li>2、咨询医师在使用服务平台提供的各项服务的同时，承诺接受并遵守各项相关规则的规定。七乐康有权根据需要不时地制定、修改本协议或各类规则，如本协议有任何变更，七乐康将在网站、APP上以公示形式通知咨询医师。如咨询医师不同意相关变更，必须立即以书面通知的方式终止本协议。任何修订和新规则一经在服务平台公布即自动生效，成为本协议的一部分。登录或继续使用服务将表示咨询医师接受经修订的协议。除另行明确声明外，任何使服务范围扩大或功能增强的新内容均受本协议约束。</li>');
		html.push( '<li>3、咨询医师签署或在线接受本协议并不导致本协议立即生效，经过七乐康审核通过并向咨询医师发出服务开通通知时，咨询医师首次登陆时本协议即在咨询医师和七乐康之间产生法律效力。本协议不涉及咨询医师与服务平台其它用户之间因网上交易而产生的法律关系及法律纠纷。</li>');
		html.push( '<li>4、七乐康保留在任何时候自行决定对服务及其相关功能、应用软件变更、升级的权利。七乐康进一步保留在服务中开发新的模块、功能和软件或其它语种服务的权利。上述所有新的模块、功能、软件服务的提供，除非七乐康另有说明，否则仍适用本协议。服务随时可能因七乐康的单方判断而被增加或修改，或因定期、不定期的维护而暂缓提供，咨询医师将会得到相应的变更通知。咨询医师在此同意七乐康在任何情况下都无需向其或第三方在使用服务时对其在传输或联络中的迟延、不准确、错误或疏漏及因此而致使的损害负责。</li>');
		html.push( '</ol>');

		html.push( '<h2>三、证明文件提交</h2>');
		html.push( '<ol>');
		html.push( '<li>1、证明文件提交：咨询医师欲使用本协议下服务，必须向七乐康提交其在申请服务时提供信息的相关证明。具体证明信息内容如下：</li>');
		html.push( '<li>');
		html.push( '<p>（1） 执业医师资格证；</p>');
		html.push( '<p>（2）医师职称证书（或工作证、医院聘书）；</p>');
		html.push( '<p>（3）个人证件照（或个人清晰头像）；</p>');
		html.push( '<p>（4）身份证；</p>');
		html.push( '<p>（5）咨询医师出具的证明联系人获得咨询医师授权的证明；</p>');
		html.push( '<p>（6）其他七乐康认为需查验的信息。</p>');
		html.push( '</li>');
		html.push( '<li>2、信息变更的通知：协议期内，上述信息（包括相关证明文件）的任何变更咨询医师都应及时通知七乐康，如上述信息变更后使得咨询医师不再具备履行本协议的情形出现时，七乐康有权立即终止或中止本协议。</li>');
		html.push( '<li>3、责任条款：咨询医师同意为其未及时的通知或更新其信息承担全部责任，咨询医师保证其向七乐康提供的全部证明文件真实、准确且不存在超过时效问题（即保证所有证明文件在整个合同履行期间都处于有效期内）如因上述原因发生纠纷或被相关国家主管机关处罚，咨询医师应当独立承担全部责任，如给七乐康（包括其合作伙伴、代理人、职员等）造成损失的，咨询医师同意赔偿其全部损失。</li>');
		html.push( '</ol>');

		html.push( '<h2>四、申请条件与注册</h2>');
		html.push( '<ol>');
		html.push( '<li>1、申请使用服务的咨询医师必须同时满足以下条件：</li>');
		html.push( '<li>');
		html.push( '<p>（1）咨询医师在完成注册程序或实际使用诊所服务时，应当是具备完全民事权利能力和完全民事行为能力的自然人；</p>');
		html.push( '<p>（2）持有中华人民共和国《执业医师资格证》；</p>');
		html.push( '<p>（3）提交了本协议第三条约定的相关证明文件并获得</p>');
		html.push( '<p>（4）若咨询医师不具备前述主体资格，则咨询医师应承担因此而导致的一切后果，且七乐康有权注销（永久冻结）咨询医师的诊所账户，由此造成的损失，七乐康有权向咨询医师索偿。</p>');
		html.push( '</li>');
		html.push( '<li>2、诊所账户</li>');
		html.push( '<li>');
		html.push( '<p>咨询医师签署本协议，完成注册程序后，七乐康会向咨询医师提供唯一编号的诊所账户。咨询医师可以设置或修改账户密码。咨询医师应对自己的诊所账户和密码的安全负责。除非有法律规定或司法裁定，且征得七乐康的同意，否则，账户不得以任何方式转让、赠与或继承。如果发现任何人不当使用咨询医师账户或有任何其他可能危及咨询医师账户安全的情形时，咨询医师应当立即以有效方式通知七乐康，要求七乐康暂停相关服务。咨询医师向七乐康提供所需注册资料、阅读并同意本协议、完成全部注册程序后，即成为七乐康注册医师。在后续的使用过程中，咨询医师应当及时更新自己的资料，以使之真实、及时，完整和准确。</p>');
		html.push( '</li>');
		html.push( '</ol>');

		html.push( '<h2>五、咨询医师的权利和义务</h2>');
		html.push( '<ol>');
		html.push( '<li>1、应符合咨询医师的申请条件，且向七乐康提供真实、合法、准确、有效的注册资料，并保证其诸如电子邮件地址、联系电话、联系地址、邮政编码等内容的有效性及安全性，保证七乐康及其他用户可以通过上述联系方式与自己进行联系。同时，咨询医师也有义务在相关资料实际变更时及时更新有关注册资料。咨询医师保证不以他人资料在服务平台进行注册。</li>');
		html.push( '<li>2、咨询医师在诊所中的言行需遵守国家法律、法规等规范性文件及七乐康的各项规则和要求，不违背社会公共利益或公共道德，不损害他人的合法权益，不违反本协议及相关规则。如果因此产生任何法律后果的，咨询医师应以自己的名义独立承担法律责任。</li>');
		html.push( '<li>3、咨询医师不得以虚构或歪曲事实的方式不当评价其他咨询医师，不采取不正当方式制造或提高自身的评价度及信用度，不采取不正当方式制造或提高（降低）其他咨询医师的评价度及信用度。七乐康有权对咨询医师违反本条规范的行为进行指正、警告、甚至永久冻结咨询医师的七乐康咨询医师账户。</li>');
		html.push( '<li>4、咨询医师在诊所中的工作不得影响咨询医师在所属医疗机构中的本职工作。咨询医师因此与咨询医师所属医疗结构产生的纠纷，由咨询医师自行承担，七乐康不负任何法律责任。</li>');
		html.push( '<li>5、咨询医师应就其在谈判、签署和履行本协议过程中所知悉或获取的七乐康的有关信息和资料予以保密。未经七乐康书面同意，咨询医师不得向第三方披露该等信息。该保密义务不因本协议的任何可能的无效、解除或终止而无效、解除或终止。如本协议宣布无效、解除或终止，双方应继续持续履行相关的保密义务。</li>');
		html.push( '<li>6、任何咨询医师在线接受本协议并不当然导致本协议发生法律效力，本协议是附条件生效协议，即必须经过七乐康对其提交的全部资料审核通过后方可生效。同时，咨询医师认可七乐康有权独立的对其提供资料、证明文件、权限开通申请进行评估、判断。审核结果以七乐康评估、判断为准，其对此不持有任何异议。</li>');
		html.push( '</ol>');

		html.push( '<h2>六、七乐康的权利和义务</h2>');
		html.push( '<ol>');
		html.push( '<li>1、七乐康承诺在“大白云诊端”和“大白用户端”所开展的业务均取得国家规定的相关资质，并受到中国法律保护；七乐康有义务在现有技术上维护整个服务平台上交易平台的正常运行，并努力提升和改进技术，使咨询医师的服务得以顺利进行</li>');
		html.push( '<li>2、对咨询医师在注册使用服务中所遇到的与服务或注册有关的问题及反映的情况，七乐康应及时做出回复。</li>');
		html.push( '<li>3、因服务平台的特殊性，七乐康没有义务对所有咨询医师的服务行为以及与服务有关的其它事项进行事先审查，但如存在下列情况：</li>');
		html.push( '<li>');
		html.push( '<p>（1）第三方通知七乐康，认为某个具体咨询医师或具体服务事项可能存在重大问题；</p>');
		html.push( '<p>（2）咨询医师或第三方向七乐康告知服务平台上有违法或不当行为的； 七乐康以普通非专业人员的知识水平标准对相关内容进行判别，可以认为这些内容或行为具有违法或不当性质的，七乐康有权根据不同情况选择删除相关信息或停止对该咨询医师提供服务平台，并追究相关法律责任。</p>');
		html.push( '</li>');
		html.push( '<li>4、七乐康有权对咨询医师的注册数据及服务行为进行查阅，发现注册数据或服务行为中存在任何问题或怀疑，均有权向咨询医师发出询问或要求改正的通知，或者直接做出删除等处理。</li>');
		html.push( '<li>5、经国家生效法律文书或行政处罚决定确认咨询医师存在违法行为，或者七乐康有足够事实依据可以认定咨询医师存在违法或违反协议行为的，七乐康有权在服务平台公布咨询医师的违法和/或违规行为。</li>');
		html.push( '<li>6、七乐康负责免费为咨询医师在诊所上搭建以咨询医师姓名冠名的虚拟咨询室，并提供技术与服务支持。同时所有服务平台的用户均可免费或付费向咨询医师的虚拟咨询室发起图文咨询或电话咨询等服务申请。</li>');
		html.push( '<li>7、咨询医师授权甲方在“大白云诊端”和“大白用户端”上开设以咨询医师姓名冠名的虚拟咨询室，并在诊所中开展医疗咨询服务。</li>');
		html.push( '<li>8、七乐康有权根据“大白云诊端”和“大白用户端”用户对咨询医师回答问题质量的评价以及其他专业、学术指标将咨询医师与其他七乐康医生进行排名。</li>');
		html.push( '<li>9、七乐康用户在使用“大白云诊端”和“大白用户端”时，均需接受七乐康的免责协议：“大白云诊端”和“大白用户端”中所有医疗信息、图文影像信息、电话咨询信息等皆不作为诊断结果和医疗的证据，用户只能作为参考。七乐康不承担用户使用和咨询可能产生的医疗风险和责任。</li>');
		html.push( '<li>10、七乐康有义务保护咨询医师的保密资料及隐私信息（需要公布在诊所中的资料和信息除外）的安全，不得泄露咨询医师的隐私，否则，因此造成咨询医师的损失，咨询医师可向七乐康索赔。</li>');
		html.push( '<li>11、七乐康除给咨询医师提供诊所用于进行医疗咨询服务外，双方还可协商，利用七乐康资源为咨询医师个人及诊所品牌进行包装、推广；为咨询医师所拥有的医疗健康方面的学术观点、知识产权、专利、论文等进行推广服务；为咨询医师提供基于其个人诊所积累的信息和数据进行整合分析、数据挖掘的服务，用于临床和科研工作。具体的合作模式可双方另起协议或规则进行约定。</li>');
		html.push( '<li>12、咨询医师在此授予七乐康独家的、全球通用的、永久的、免费的许可使用权利 (并有权对该权利进行再授权)，使七乐康有权(全部或部份地) 使用、复制、修订、改写、发布、翻译、分发、执行和展示咨询医师公示于网站的各类信息或制作其派生作品，和/或以现在已知或日后开发的任何形式、媒体或技术，将上述信息纳入其它作品内。</li>');
		html.push( '<li>13、七乐康有权根据业务调整情况将本协议项下的全部权利义务一并转移给其关联公司，此种情况将会提前30天以网站公告的形式通知咨询医师。咨询医师承诺对此不持有异议。</li>');
		html.push( '</ol>');

		html.push( '<h2>七、费用规定</h2>');
		html.push( '<ol>');
		html.push( '<li>七乐康将按月在每月10日（遇周末和节假日顺延），将咨询医师在诊所赚取的服务费打入咨询医师指定账户，报酬包括：用户支付的咨询费、七乐康给与的奖励。上述报酬七乐康有权按照七乐康制定的服务费结算规则执行。七乐康有权根据需要制定和修改规则，但必须提前一周以短信形式通知咨询医师，同时在“大白云诊端”中进行公示。</li>');
		html.push( '</ol>');

		html.push( '<h2>八、协议的终止</h2>');
		html.push( '<ol>');
		html.push( '<li>1、通知解除：协议任何一方均可以提前七个工作日通知终止本协议。</li>');
		html.push( '<li>2、七乐康单方解除权：</li>');
		html.push( '<li>');
		html.push( '<p>（1）如咨询医师违反七乐康的任何规则或本协议中的任何承诺或保证，包括但不限于本协议项下的任何约定，七乐康都有权立刻终止本协议，且按有关规则对咨询医师进行处罚；</p>');
		html.push( '<p>（2）若咨询医师屡次违反本协议或相关规定，经七乐康提醒仍不改正的；或因咨询医师的言行对七乐康造成人民币1000元以上损失的，七乐康有权终止与咨询医师的协议，并冻结咨询医师的诊所账号、注册账号等。</p>');
		html.push( '</li>');
		html.push( '<li>3、若双方无法达成一致，七乐康无权强制咨询医师使用手机诊所。咨询医师可根据自己意愿，随时、随地终止诊所的使用。咨询医师完全终止诊所使用后一年或咨询医师通过电子邮件形式告知七乐康后七个工作日后，本协议将自动终止。在协议终止前、账号不予注销，咨询医师均可随时、随地自行再次开通诊所的使用。本协议终止后咨询医师的七乐康医生账号将被自动注销。</li>');
		html.push( '<li>4、本协议规定的其他协议终止条件发生或实现，导致本协议终止。</li>');
		html.push( '<li>5、协议终止后有关事项的处理：</li>');
		html.push( '<li>');
		html.push( '<p>（1）协议终止后，七乐康没有义务为咨询医师保留诊所账户中或与之相关的任何信息，或转发任何未曾阅读或发送的信息给咨询医师或第三方。亦不就终止协议而对咨询医师或任何第三者承担任何责任</p>');
		html.push( '<p>（2）无论本协议因何原因终止，在协议终止前的行为所导致的任何赔偿和责任，咨询医师必须完全且独立地承担；</p>');
		html.push( '<p>（3）协议终止后，七乐康有权保留该咨询医师的注册数据及以前的服务行为记录。如咨询医师在协议终止前在服务平台上存在违法行为或违反协议的行为，七乐康仍可行使本协议所规定的权利。</p>');
		html.push( '</li>');
		html.push( '</ol>');

		html.push( '<h2>九、协议期限</h2>');
		html.push( '<ol>');
		html.push( '<li>本协议经咨询医师在线接受且经过七乐康审核通过后（或书面签署后）即告生效，除非本协议规定的终止条件发生，本协议将持续有效。双方另有约定的除外。</li>');
		html.push( '</ol>');

		html.push( '<h2>十、有效通知</h2>');
		html.push( '<ol>');
		html.push( '<li>本协议下所规定的通知有权要求以书面形式通过以下邮址递交收悉，通知的到达以七乐康收悉为准。</li>');
		html.push( '<li>');
		html.push( '<p>七乐康地址：广州市海珠区石榴岗路13-68号301</p>');
		html.push( '<p>邮编：510310 ；</p>');
		html.push( '<p>收件人：七乐康药业（收）</p>');
		html.push( '</li>');
		html.push( '<li>七乐康可自 邮址向咨询医师在七乐康名下网络平台注册时提供的电子邮件地址发出通知。通知的送达以邮件发出为准。</li>');
		html.push( '</ol>');

		html.push( '<h2>十一、保密条款</h2>');
		html.push( '<ol>');
		html.push( '<li>1、本协议所称商业秘密包括但不限于本协议、任何补充协议所述内容及在合作过程中涉及的其他秘密信息。任何一方未经商业秘密提供方同意，均不得将该信息向任何第三方披露、传播、编辑或展示。协议方承诺，本协议终止后仍承担此条款下的保密义务，保密期将另持续三年。</li>');
		html.push( '<li>2、因对方书面同意以及国家、行政、司法强制行为而披露商业秘密的，披露方不承担责任；该商业秘密已为公众所知悉的，披露方不承担责任。</li>');
		html.push( '</ol>');

		html.push( '<h2>十二、有限责任</h2>');
		html.push( '<ol>');
		html.push( '<li>1、不论在何种情况下，七乐康均不对由于Internet连接故障，电脑，通讯或其他系统的故障，电力故障，罢工，劳动争议，暴乱，起义，骚乱，生产力或生产资料不足，火灾，洪水，风暴，爆炸，不可抗力，战争，政府行为，国际、国内法院的命令或第三方的不作为而造成的不能服务或延迟服务承担责任。</li>');
		html.push( '<li>2、不论是否可以预见，不论是源于何种形式的行为，七乐康不对由以下原因造成的任何特别的，直接的，间接的，惩罚性的，突发性的或有因果关系的损害或其他任何损害（包括但不限于利润或利息的损失，服务中断，资料灭失）承担责任。</li>');
		html.push( '<li>3、使用或不能使用服务平台。</li>');
		html.push( '<li>4、未经授权的存取或修改数据或数据的传输。</li>');
		html.push( '<li>5、第三方通过服务所作的陈述或行为。</li>');
		html.push( '<li>6、其它与服务相关事件，包括疏忽等，所造成的损害。</li>');
		html.push( '</ol>');

		html.push( '<h2>十三、违约责任</h2>');
		html.push( '<ol>');
		html.push( '<li>1、咨询医师同意赔偿由于使用服务（包括但不限于将咨询医师资料展示在网站上）或违反本协议而给七乐康造成的任何损失（包括由此产生的全额的诉讼费用和律师费）。咨询医师同意七乐康不对任何其张贴的资料，包括诽谤性的，攻击性的或非法的资料，承担任何责任；由于此类材料对其它用户造成的损失由咨询医师自行全部承担。</li>');
		html.push( '<li>2、咨询医师承诺，不会采取任何手段或措施，包括但不限于明示或暗示用户或通过其他方式转移其可以通过服务平台在线达成的服务交易，或达成交易后不经由七乐康收取交易金额，以规避七乐康获取服务费。否则将视为严重违约，七乐康将有权立即终止本协议，暂扣应向咨询医师支付的服务费，还可就违约行为向咨询医师追偿。</li>');
		html.push( '<li>3、除本协议及服务平台规则另有约定之外，如一方发生违约行为，守约方可以书面通知方式要求违约方在指定的时限内停止违约行为，并就违约行为造成的损失进行索赔，如违约方未能按时停止违约行为，则守约方有权立即终止本协议。</li>');
		html.push( '</ol>');

		html.push( '<h2>十四、争议解决及其他</h2>');
		html.push( '<ol>');
		html.push( '<li>1、本协议之解释与适用，以及与本协议有关的争议，均应依照中华人民共和国法律予以处理，并以广州市海珠区人民法院为第一审管辖法院。</li>');
		html.push( '<li>2、如本协议的任何条款被视作无效或无法执行，则上述条款可被分离，其余部份则仍具有法律效力。</li>');
		html.push( '<li>3、七乐康于咨询医师过失或违约时放弃本协议规定的权利的，不得视为其对咨询医师的其他或以后同类之过失或违约行为弃权。</li>');
		html.push( '</ol>');

		html.push( '</section>');

		return html.join('');
	},

	sendCodeToUser: function(){
		var phoneNo = document.querySelector('#phoneNo').value;

		var param = {
			sendParameters:{
				'actionType': '1',
				'phoneNum': document.querySelector('#phoneNo').value
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_sms/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderSendSMSSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;
		this.ajax.send(param);
	},
	
	hanlderSendSMSSuccess:function(responseText) {

		if(responseText.code === 0) {
			this.messageBox.show({
				msg:'短信已发送到您的手机，请注意查收', 
				type:'alert', 
				autoClose: true
			});
			
			this.validateTarget = document.querySelector('#getValidateCode');
			this.validateTarget.className = 'actived';
			this.startCutDownTimer();

			this.validateCodeActive = true;
		} else {
			this.onError(responseText);
		}
	},

	startCutDownTimer: function(){
		var count = 60;

		this.validateTarget.innerHTML = '<b>' + count + '</b>秒后重试';

		var timer = setInterval(function(){
			if(count >= 0){
				this.validateTarget.innerHTML = '<b>' + count + '</b>秒后重试';
				count --;
			}else{
				this.validateTarget.innerHTML = '获取验证码';
				this.validateTarget.className = '';
				this.validateCodeActive = false;
				clearInterval(timer);
			}
			
		}.bind(this), 1000);
	},


	doRegister: function(){
		var res = this.validate();
		if(!res.res) {
			this.messageBox.show({
				msg:res.msg, 
				type:'alert', 
				autoClose: true
			});			
			return;
		}

		var param = {
			sendParameters:{
				'name': res.name,
				'phoneNum' : res.phoneNum,
				'verifyCode' : res.verifyCode,
				'password' : res.password
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/register/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.onSuccess.bind(this);
		param.onError = this.onError.bind(this);
		//param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	validate: function(){
		var realName = document.querySelector('#realName').value;
		var phoneNo = document.querySelector('#phoneNo').value;
		var validateCode = document.querySelector('#validateCode').value;
		var password = document.querySelector('#password').value;
		var confirmPass = document.querySelector('#confirmPass').value;

		if(!(realName && realName !== '')){
			return {
				res: false,
				msg:'请输入您的姓名'
			}
		}

		if(!realName.isNormalText(this.userNameLen.min, this.userNameLen.max)){
			return {
				res: false,
				msg:'请输入正确的姓名'
			}
		}

		if(!(phoneNo && phoneNo !== '' && phoneNo.isPhoneNumber())){
			return {
				res: false,
				msg:'请输入正确的手机号码'
			}
		}

		if(!(validateCode && validateCode !== '' && validateCode.isNumber(4, 6))){
			return {
				res: false,
				msg:'请输入正确的验证码'
			}
		}

		if(!(password && password !== '' && password.isPassword(6, 16))){
			return {
				res: false,
				msg:'请用6~16个字符作为您的登录密码'
			}
		}

		if(!(confirmPass && confirmPass !== '' && confirmPass.isPassword(6, 16))){
			return {
				res: false,
				msg:'请确认您的密码'
			}
		}

		if(confirmPass !== password){
			return {
				res: false,
				msg:'两次输入的密码不一至，请检查'
			}
		}

		if(this.agreeContract !== true){
			return {
				res: false,
				msg:'请先查看《医生注册协议》并接受'
			}
		}

        return {
			res: true,
			msg: '',
			'name': realName,
			'phoneNum' : phoneNo,
			'verifyCode' : validateCode,
	        'password' : password
        };
	},

	onSuccess: function(responseText){
		if(responseText.code === 0){
			var params = window.location.search;
			var reg = new RegExp("redirect_uri=([^&?]*)", "ig");
			if(params.match(reg)) {
				var redirect_uri = params.match(reg)[0].substring("redirect_uri".length + 1);
				window.location.href = redirect_uri;
			} else {
				window.location.href = '../my/my-information.html';
			}  
		}else{
			this.onError(responseText);
		}
	},

	onError: function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络故障，请稍后再试。';
		}
		clearTimeout(this.messageBox.timer);
		
		setTimeout(function(){
			this.messageBox.show({
				msg: msg,
				type:'alert', 
				autoClose: true
			});
		}.bind(this), 0);
	},


	attachEvent: function(){
		var authorRegisterPanel = document.querySelector('#authorRegisterPanel');

		authorRegisterPanel.addEventListener('click', function(event){
			this.handlePanelClick(event);
		}.bind(this), false);
	}
};

authorRegister.init();