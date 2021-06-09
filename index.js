'use strict';
var instance_skel = require('../../instance_skel');
var OSC = require('osc');
var stripDef = require('./defstrip.json');
var monDef = require('./defmons.json');
var actDef = require('./defaction.json');
var busDef = require('./defbus.json');

var debug;
var log;


function instance(system, id, config) {
	var self = this;
	var po = 0;

	// self.currentSnapshot = {
	// 	name: '',
	// 	index: 0
	// };

	self.myMixer = {
		ip: '',
		name: '',
		model: '',
		serial: '',
		fw: ''
	};

	// mixer state
	self.xStat = {};
	// level/fader value store
	self.tempStore = {};
	// stat id from mixer address
	self.fbToStat = {};

	self.actionDefs = {};
	self.toggleFeedbacks = {};
	self.colorFeedbacks = {};
	self.variableDefs = [];
	self.soloList = new Set();
	self.fLevels = {};
	self.FADER_STEPS = 1540;
	self.fLevels[self.FADER_STEPS] = [];
	self.blinkingFB = {};
	self.crossFades = {};
	self.needStats = true;

	self.PollTimeout = 800;
	self.PollCount = 7;

	self.build_choices();

	// super-constructor
	instance_skel.apply(this, arguments);

	if (process.env.DEVELOPER) {
		self.config._configIdx = -1;
	}

	// each instance needs a separate local port
	id.split('').forEach(function (c) {
		po += c.charCodeAt(0);
	});
	self.port_offset = po;

	self.debug = debug;
	self.log = log;

	return self;
}

instance.GetUpgradeScripts = function() {
	return [
		function() {
			// 'old' script that does nothing, but cannot be removed
			return false
		}
	]
}

instance.prototype.ICON_SOLO =
	'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUcSURBVHic7ZpLaFxVGIC//96ZTNKkqSnGN+JzUS3oyqi1ogstqKAIuhIVFEUUtOBGhC5UxI2FgigYKLqpFRdV8FFsN1rFbtoGWwyl1lStsa+0NjNJzsy5M7+LuXdyZzKT00zSJpTzwYU573O/+c859w4jeQ0UTytMsNgzWOp4QQ4y6YQijyrl4cWazFIgIHgHeDJJ1wkKKf/dLRy64LNaQuSV8XTaLzEHXpADL8iBF+TAC3LgBTnwghx4QQ68IAdekAMvyIEX5MALcuAFOfCCHHhBDrwgB16QAy/IgRfkwAty4AU58IIceEEOvCAHXpADL8iBF+TAC3LgBTnwghx4QQ68IAcNf8GjfzEmoUpfucgalJUIY2VhpKODYRHa+gduZPhY4XpVjnd08dS8JpfXQJNrXIORgnL5vDqcIyXDC9ZQsAZtuE5Ehofa6dMafrUGLRlG5to2r8FgyslUbYmJgsB1SrBzXLm0nYnNldIkAwIfAd1NivsryhUXYh6zURPUYStINaBXC8GOs8rK8z54wLOpOWxEuVfgEYQ3YYn8mTQJpzgkdaJcC699/yl953Nsa9gRL6eTjWWqBKqsaMjrskXesIY91jBqDfut4T1tmGerJaZKr53i7bh81BqGbJENqtMR3LjE6gTNlBT+clJZvtBiUjeyLR43iqZ4WpVsq7qqdFjDj032KrWG31S5JNXvDEGqLLeGoabti+xWpbOZoBnHvABZWyGoKKB3dhJuP6H0LKya2mB74k+hCp9GJf61hi+iIk+okktXjYq8CqyN5/g7yrvAUFy8qlzkrdmGiopsAG6Lkwfi9gcBUAaiEq83bZjXQAupCEpfE2VJImnXMW26kc4LVfoiw+EWUbHfGG5I6iZRYQ1lY7gxbr/CGsbj/NOq1f2sWQRZw7G43pSOVw8hneQaa7Bx/sHYx+wRlKbDKmE1ku7pRrYlYbhQiHAmLHEHsAk401C8OqzmEy+9W+P84c5ODsftzwI/xfl9xnBts3F0giuh9viyW3o5BSDLOIrWovBmbRIEVUGzPI5la5LkgQLyZWPozxfpZSzbyWuZHJeh3CfC5lTxOlVCoIfp024s3V6lerMAYVi/qScUQ3pTyVN1hVLrT5isqwec46tG1iphWQFZV0C2zraZtosIUbaLHzI5ngN2JUMzQT8wwfTXWHdiSeoEq1TIN+s7V6GQStafzOkTcNnM9uf8LpaNapIeiyVlnI0cWMPGkuFlVTpq863KTx5UK3QzLkKJZEOFW3SSq+O6XcCaOH88l+PPpgN1MZqKlAGNT2bN049wO4DAiEidSGCOL6spSY8XCLbMV5IqVwl8EBX5xxq+iopsjooMAaviKvtEmKR6B1vivDAK+LpkWB8V+Y44IgQ+F6HcbBwRVJTP4mRPVGJ7ybA+yvAtVL8c1Vr/9eQ10EKl+SnW6pqMJHl3+yQ5OdqhNMXWWcYpR4aHUzKXWcPeZnVLhiNamH6HbPEctDIyHGox1oEkquZ0irUiiSSBZyYIBtuVlLW8ovAS8L3AH0CJ6mm2A+XBTCffJHVFmMzkuB94X+EIYIFRgcFsmbukh+O1urAb2Inyc6r96dByt8CHwFHAKvwFbMrkWCvSfP+SvAYqCrlSZc43GGWEKBSAwR4qL7b788RSIq/BIPB8nDTzEgQQhUKUEUCHQfYu1EQXkQHgpvjztKDqq0V7VAJBZUEmt9QwGQAVKIcX5x3Ol4xUH8LaRqt9CNVN86JCYep/T6xGm2u0hEsAAAAASUVORK5CYII=';


instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	if (config.analyze) {
		self.analyzing = true;
		self.detVars = { startCount: 5, startTimeout: 200, endCount: 12, endTimeout: 4000 }
		self.passCount = 5;
		self.PollCount = 5;
		self.passTimeout = 200;
		self.PollTimeout = 200;
		self.varCounter = 0;
		self.firstPoll();
		self.log('info', `Sync Started (${self.PollCount}/${self.PollTimeout})`);
		self.config.analyze = false;
	} else {
		self.PollCount = 7;
		self.PollTimeout = 800;
		self.init();
	}
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	// cross-fade steps per second
	self.fadeResolution = 20;

	self.build_strips();
	self.build_monitor();
	self.build_talk();
	self.init_actions();
	self.init_variables();
	self.init_feedbacks();
//	self.init_presets();
	debug(Object.keys(self.xStat).length + " status addresses generated");
	self.init_osc();

};

/**
 * heartbeat to request updates, subscription expires every 10 seconds
 */
instance.prototype.pulse = function () {
	var self = this;
	self.sendOSC("/*s", []);
	self.debug('re-subscribe');
	// any leftover status needed?
	if (self.myMixer.model == '') {
		self.sendOSC("/?", []);
	}
	if (self.needStats) {
		self.pollStats();
	}

};

/**
 * blink feedbacks
 */
instance.prototype.blink = function () {
	var self = this;
	for (var f in self.blinkingFB) {
		self.checkFeedbacks(f);
	}
};

/**
 * timed fades
 */
instance.prototype.doFades = function () {
	var self = this;
	var arg = { type: 'f' };
	var fadeDone = [];

	for (var f in self.crossFades) {
		var c = self.crossFades[f];
		c.atStep++;
		var atStep = c.atStep;
		var newVal = c.startVal + (c.delta * atStep)
		var v = (Math.sign(c.delta)>0) ? Math.min(c.finalVal, newVal) : Math.max(c.finalVal, newVal);

		arg.value = self.faderToDB(v);

		self.sendOSC(f, arg);
		self.debug(f + ": ", arg);
		self.setVariable(self.xStat[f].dvID + '_p',Math.round(v * 100));
		self.setVariable(self.xStat[f].dvID + '_d',self.faderToDB(v,true));

		if (atStep > c.steps) {
			fadeDone.push(f);
		}
	}

	// delete completed fades
	for (f in fadeDone) {
		self.sendOSC(fadeDone[f],[]);
		delete self.crossFades[fadeDone[f]];
	}
}

instance.prototype.init_presets = function () {
	var self = this;

	var presets = [
		{
			category: 'Channels',
			label: 'Channel 1 Label\nIncludes Label, Color, Mute toggle, Mute feedback, Solo feedback',
			bank: {
				style: 'png',
				text: '$(wing:l_ch1)',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: 0
			},
			actions: [
				{
					action: 'mute',
					options: {
						type: '/ch/',
						num: 1,
						mute: 2
					}
				}
			],
			feedbacks: [
				{
					type: 'c_ch',
					options: {
						theChannel: 1
					}
				},
				{
					type: 'ch',
					options: {
						fg: 16777215,
						bg: self.rgb(128,0,0),
						theChannel: 1
					}
				},
				{
					type: 'solosw_ch',
					options: {
						theChannel: 1
					}
				}
			]
		},
		{
			category: 'Channels',
			label: 'Channel 1 Level\nIncludes Fader dB, Color, Solo toggle, Solo feedback',
			bank: {
				style: 'png',
				text: '$(wing:f_ch1_d)',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: 0
			},
			actions: [
				{
					action: 'solosw_ch',
					options: {
						num: 1,
						solo: 2
					}
				}
			],
			feedbacks: [
				{
					type: 'c_ch',
					options: {
						theChannel: 1
					}
				},
				{
					type: 'solosw_ch',
					options: {
						theChannel: 1
					}
				}
			]
		}
	];
	// self.setPresetDefinitions(presets);
};


instance.prototype.build_strips = function () {
	var self = this;

	var i, b;

	var stat = {};
	var fb2stat = {};
	var defVariables = [];

	function capFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function deslash(s) {
		return s.split('/').join('');
	}

	function undollar(s) {
		return s.split('$').join('_');
	}

	function cloneObject(oldObject) {
		return JSON.parse(JSON.stringify(oldObject));
	}

	var baseAct = actDef['baseActions'];
	var mgrpAct = actDef['mgrpActions'];
	var sendAct = actDef['sendActions'];
	var sendOpt = actDef['sendOptions'];

	var a, i, s, b;
	var strip, busStrip, statActs, busActs, buses, act, path, fbStatID, fbID, dvID, defaultLabel;

	// build stats & dynamic variables
	for (s in stripDef) {
		strip = stripDef[s];
		defaultLabel = strip.label + ' ';
		statActs = actDef[strip.act];
		// console.log(`action: ${strip.act}`);
		for (i = strip.min; i<= strip.max; i++) {
			for (a in statActs) {
				if (!a.match(/_/)) {	// fader has extra actions
					act = statActs[a];
					path = `/${strip.id}/${i}/${a}`;
					dvID = `${strip.id}${i}`
					fbStatID = `${strip.id}${i}_${act.fSfx}`;
					fbID = act.fSfx;
					if (act.fSfx) {
						fb2stat[fbStatID] = path;
					}
					stat[path] = {
						valid: false,
						polled: 0
					}
					switch (a) {
					case 'fdr':
						stat[path].idx = 0;
						stat[path].fdr = 0.0;
						defVariables.push({
							label: strip.description + ' ' + i + ' dB',
							name: dvID + "_d"
						});
						defVariables.push({
							label: strip.description + ' ' + i + ' %',
							name: dvID + "_p"
						});
						stat[path].dvID = dvID;
						if (strip.hasRel) {
							// add relative $fdr variable here
						}
						break;
					case 'name':
						dvID = dvID + '_' + act.vSfx;
						stat[path].defaultName = defaultLabel + i;
						stat[path].name = defaultLabel + 1;
						stat[path].dvID = dvID;
						defVariables.push( {
							label: strip.description + ' ' + i + ' ' + act.label,
							name: dvID
						});
						break;

					case 'col':
						stat[path].color = 1;
						stat[path].fbID = fbID;
						break;
					case 'icon':
						stat[path].icon = 0;
						stat[path].fbID = fbID;
						break
					case 'led':
					case '$solo':
					case 'mute':
						stat[path].isOn = false;
						stat[path].fbID = fbID;
						break;
					}
				}
			}
			buses = busDef[strip.send];
			for (b in buses){
				busStrip = stripDef[b];
				var fbIDbase = `${strip.send}_`;
				for (var bs=1; bs <= buses[b]; bs++) {
					busActs = actDef['sendOptions'];
					for (a in busActs) {
						if (!a.match('_')) {
							act = busActs[a];
							path = 	`/${strip.id}/${i}/${busStrip.sendID}${bs}/${a}`;
							fbID = fbIDbase + a;
							dvID = `${strip.id}${i}_${b}${bs}`;
							if (act.fSfx) {
								fb2stat[fbID] = path;
							}
							stat[path] = {
								valid: false,
								polled: 0
							}
							switch (a) {
							case 'lvl':
								stat[path].idx = 0;
								stat[path].lvl = 0.0;
								defVariables.push({
									label: strip.description + ' ' + i + ' to ' + busStrip.label + ' ' + bs + ' dB',
									name: dvID + "_d"
								});
								defVariables.push({
									label: strip.description + ' ' + i + ' to ' + busStrip.label + ' ' + bs + ' %',
									name: dvID + "_p"
								});
								stat[path].dvID = dvID;
								break;
							case 'on':
								stat[path].isOn = false;
								stat[path].fbID = fbID;
							}
						}
					}
				}
			}
		}
	}

	var acts = {};
	var newAct;
	var newMute;
	var newColor;
	var newOn;
	var lbl;
	var toggleFeedbacks = {};
	var colorFeedbacks = {};
	var onFeedbacks = {};

	// build channel actions
	for (var a in baseAct) {
		lbl = baseAct[a].label;
		newAct = {
			id: a,
			label: lbl,
			options: [ ]
		};
		newMute = undefined;
		newColor = undefined;
		newOn = undefined;
		if (mgrpAct[a] === undefined) {
			newAct.options.push(self.OPTIONS_STRIP_BASE);
		} else {
			newAct.options.push(self.OPTIONS_STRIP_ALL);
		}
		var newOpts = null;
		switch (baseAct[a].inType) {
		case 'fader':
			newOpts =  {
				type:	'number',
				label:	'Fader Level',
				id:		'fad',
				default: 0.0,
				min: -144,
				max: 10
			};
		case 'fader_a':
			if (newOpts === null) {
				newOpts = {
					type:	 'number',
					tooltip: 'Adjust fader +/- percent.\n0% = -oo, 75% = 0db, 100% = +10db',
					label:	 'Adjust',
					id:		 'ticks',
					min:	 -100,
					max:	 100,
					default: 1
				}
			}
		case 'fader_r':
			if (newOpts === null) {
				newOpts =  {
					type:	 'dropdown',
					tooltip: 'Recall stored fader value',
					label:	 'From',
					id:		 'store',
					default: 'me',
					choices: [
						{ 	id: 'me',
							label: "This Strip"
						},
						...self.STORE_LOCATION
					]
				}
			}
			newAct.options.push(
				newOpts,
				{
					type: 'number',
					label: 'Fade Duration (ms)',
					id: 'duration',
					default: 0,
					min: 0,
					step: 10,
					max: 60000
				});
			break;
		case 'fader_s':
			newAct.options.push( {
				type:	 'dropdown',
				tooltip: 'Store fader value for later recall',
				label:	 'Where',
				id:		 'store',
				default: 'me',
				choices: [
					{ 	id: 'me',
						label: "This Strip"
					},
					...self.STORE_LOCATION
				]
			});
			break;
		case 'color':
			newColor = cloneObject(newAct);
			newColor.id = a;
			newColor.label = 'Color of Strip';
			newColor.description = 'Set button text to Color of Strip';
			newColor.callback = function(feedback, bank) {
					var theChannel = feedback.options.strip + '/' + feedback.type;
					var stat = self.xStat[theChannel];
					return { color: self.COLOR_VALUES[stat.color - 1].fg };
				};

			newAct.options.push( {
				id: a,
				type: 'dropdown',
				label: baseAct[a].label,
				default: baseAct[a].default,
				choices: self.COLOR_VALUES
			});
			break;
		case 'led':
			newColor = cloneObject(newAct);
			newColor.id = a;
			newColor.label = 'Color on LED';
			newColor.description = 'Set button color when LED On';
			newColor.callback = function(feedback, bank) {
				var color = self.xStat[feedback.options.strip + '/col'].color;
				var stat = self.xStat[feedback.options.strip + '/led']
				if (stat.isOn) {
					return { bgcolor: self.COLOR_VALUES[color - 1].fg };
				}
			};
			newAct.options.push({
				id: 'on',
				type: 'dropdown',
				label: 'State',
				choices: self.CHOICES_ON_OFF,
				default: '1'
			});
			break;
		case 'number':
			newAct.options.push( {
				id: a,
				type: 'number',
				label: baseAct[a].label + ' ID',
				min: baseAct[a].inMin,
				max: baseAct[a].inMax,
				default: baseAct[a].default,
				range: false,
				required: true
			});
			break;
		case 'solo':
			newMute = cloneObject(newAct);
			newMute.id = a;
			newMute.label = `Show Strip ${lbl}`;
			newMute.description = `Show border if Strip is Soloed`
			newMute.callback = function(feedback, bank) {
				var theNode = feedback.options.strip + '/' + feedback.type;
				var stat = self.xStat[theNode];
				if (stat.isOn) {
					return {  png64: self.ICON_SOLO };
				}
			};
			newAct.options.push({
				id: 'on',
				type: 'dropdown',
				label: 'State',
				choices: self.CHOICES_ON_OFF,
				default: '1'
			});
			break;
		case 'onoff':
			newMute = cloneObject(newAct);
			newMute.id = a;
			newMute.label = `Color on Strip ${lbl}`;
			newMute.description = `Set button color if Strip ${lbl} is On`
			newMute.options.push(
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: self.rgb(128,0, 0)
				}
			);
			newMute.callback = function(feedback, bank) {
				var theNode = feedback.options.strip + '/' + feedback.type;
				var stat = self.xStat[theNode];
				if (stat.isOn) {
					return { color: feedback.options.fg, bgcolor: feedback.options.bg };
				}
			};
			newAct.options.push({
				id: 'on',
				type: 'dropdown',
				label: 'State',
				choices: self.CHOICES_ON_OFF,
				default: '1'
			});
			break;
		case 'textinput':
			newAct.options.push( {
				id: a,
				type: 'textinput',
				label: baseAct[a].label,
				tooltip: 'Maximum ' + baseAct[a].inMax + ' characters'
			});
			break;
		}
		acts[a] = newAct;
		if (newColor) {
			colorFeedbacks[newColor.id] = newColor;
		}
		if (newMute) {
			toggleFeedbacks[newMute.id] = newMute;
		}
	}

	// build send actions
	for (a in sendAct) {
		newAct = {
			id: a,
			label: sendAct[a].label,
			options: [ ]
		};
		var st = sendAct[a].sendType;
		switch (st) {
		case 'send_bm':
			newAct.options.push(
				{
					type: 'dropdown',
					tooltip: 'Source strip',
					label: 'source',
					id: 'source',
					default: self.CHOICES_STRIP['ch'][0].id,
					choices: [
						...self.CHOICES_STRIP['ch'],
						...self.CHOICES_STRIP['aux']
					]
				},
				{
					type: 'dropdown',
					tooltip: 'Destination',
					label: 'Destination',
					id: 'bus',
					default: self.CHOICES_BUS[st][0].id,
					choices: self.CHOICES_BUS[st]
				}
			);
			break;
		case 'send_bmm':
			newAct.options.push(
				{
					type: 'dropdown',
					tooltip: 'Source bus',
					label: 'source',
					id: 'source',
					default: self.CHOICES_STRIP['bus'][0].id,
					choices: self.CHOICES_STRIP['bus']
				},
				{
					type: 'dropdown',
					tooltip: 'Destination',
					label: 'Destination',
					id: 'bus',
					default: self.CHOICES_BUS[st][0].id,
					choices: self.CHOICES_BUS[st]
				}
			);
			break;
		case 'send_m':
			newAct.options.push(
				{
					type: 'dropdown',
					tooltip: 'Source Main',
					label: 'source',
					id: 'source',
					default: self.CHOICES_STRIP['main'][0].id,
					choices: self.CHOICES_STRIP['main']
				},
				{
					type: 'dropdown',
					tooltip: 'Destination',
					label: 'Destination',
					id: 'bus',
					default: self.CHOICES_BUS[st][0].id,
					choices: self.CHOICES_BUS[st]
				}
			);
			break;
		case 'direct':
			newAct.options.push(
				{
					type: 'dropdown',
					tooltip: 'Matrix',
					label: 'Matrix',
					id: 'matrix',
					default: self.CHOICES_STRIP['mtx'][0].id,
					choices: self.CHOICES_STRIP['mtx']
				},
				{
					TYPE: 'dropdown',
					tooltip: 'Direct Input',
					label: 'Input',
					id: 'source',
					default: self.CHOICES_BUS[st][0].id,
					choices: self.CHOICES_BUS[st]
				}
			);
			break;
		}

		for (var sub in sendOpt) {
			var subAct = cloneObject(newAct);
			subAct.id = subAct.id + '_' + sub;
			subAct.label = subAct.label + ' ' + sendOpt[sub].label;
			newOpts = null;
			newOn = undefined;
			switch (sendOpt[sub].sendType) {
			case 'onoff':
				newOn = cloneObject(subAct);
				newOn.id = subAct.id;
				newOn.label = `Color on ${newAct.label} OFF`;
				newOn.description = `Set button color if ${newAct.label} is OFF`
				newOn.options.push(
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: '16777215'
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: self.rgb(128,0, 0)
					}
				);
				newOn.callback = function(feedback, bank) {
					var theNode = feedback.options.source + feedback.options.bus + '/on';
					var stat = self.xStat[theNode];
					if (!stat.isOn) {
						return { color: feedback.options.fg, bgcolor: feedback.options.bg };
					}
				};
				subAct.options.push(
					{
						id: 'on',
						type: 'dropdown',
						label: 'State',
						choices: self.CHOICES_ON_OFF,
						default: '1'
					}
				);
				break;
			case 'lvl_s':
				subAct.options.push( {
					type:	 'dropdown',
					tooltip: 'Store level for later recall',
					label:	 'Where',
					id:		 'store',
					default: 'me',
					choices: [
						{ 	id: 'me',
							label: "This Send"
						},
						...self.STORE_LOCATION
					]
				});
				break;
			case 'lvl':
				newOpts =  {
					type:	'number',
					label:	'Level',
					id:		'fad',
					default: 0.0,
					min: -144,
					max: 10
				};
				// no break
			case 'lvl_a':
				if (newOpts === null) {
					newOpts = {
						type:	 'number',
						tooltip: 'Adjust level +/- percent.\n0% = -oo, 75% = 0db, 100% = +10db',
						label:	 'Adjust',
						id:		 'ticks',
						min:	 -100,
						max:	 100,
						default: 1
					}
				}
				// no break
			case 'lvl_r':
				if (newOpts === null) {
					newOpts =  {
						type:	 'dropdown',
						tooltip: 'Recall stored value',
						label:	 'From',
						id:		 'store',
						default: 'me',
						choices: [
							{ 	id: 'me',
								label: "This Send"
							},
							...self.STORE_LOCATION
						]
					}
				}
				subAct.options.push(
					newOpts,
					{
						type: 'number',
						label: 'Fade Duration (ms)',
						id: 'duration',
						default: 0,
						min: 0,
						step: 10,
						max: 60000
					});
				break;
			}
			acts[subAct.id] = subAct;
			if (newOn) {
				onFeedbacks[newOn.id] = newOn;
			}
		}
	}

	self.xStat = stat;
	self.variableDefs = defVariables;
	self.actionDefs = acts;
	self.fbToStat = fb2stat;
	self.colorFeedbacks = colorFeedbacks;
	self.toggleFeedbacks = toggleFeedbacks;
	Object.assign(self.toggleFeedbacks, onFeedbacks);

};

instance.prototype.build_monitor = function () {
	var self = this;
	var c, i, ch, cm, cMap, id, actID, soloID, cmd, pfx;

	var stat = {};
	var fb2stat = self.fbToStat;
	var soloActions = {};
	var soloFeedbacks = {};

	var def = monDef;

	for (id in def) {
		cmd = def[id];
		pfx = cmd.prefix;
		cMap = cmd.cmdMap;
		for (cm in cmd.cmdMap) {
			ch = cMap[cm];
			actID = 'solo_' + ch.actID;
			soloID = 'f_solo';
			c = pfx + ch.actID;
			stat[c] = {
				fbID: actID,
				varID: soloID,
				valid: false,
				polled: 0
			};
			fb2stat[actID] = c;
			soloActions[actID] = {
				label: "Solo " + ch.description,
				options: []
			};
			soloActions[actID].options.push( {
				type:	'dropdown',
				label:	'Value',
				id:		'set',
				default: '2',
				choices: [
					{id: '1', label: 'On'},
					{id: '0', label: 'Off'},
					{id: '2', label: 'Toggle'}
				]
			} );
			stat[c].isOn = false;
			soloFeedbacks[actID] = {
				label: 		 "Solo Bus" + ch.description + " on",
				description: "Color on Solo Bus" + ch.description,
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: '16777215'
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: self.rgb.apply(this, ch.bg)
					},
				],
				callback: function(feedback, bank) {
					var fbType = feedback.type;
					var stat = self.xStat[fb2stat[fbType]];
					if (stat.isOn) {
						return { color: feedback.options.fg, bgcolor: feedback.options.bg };
					}
				}
			};
		}
	}
	actID = 'clearsolo';
	soloID = '/$stat/solo'
	soloActions[actID] = {
		label: 'Solo Clear',
		description: 'Clear all active Solos',
		options: []
	};
	stat[soloID] = {
		fbID: actID,
		isOn: false,
		valid: false,
		polled: 0
	};
	self.fbToStat[actID] = soloID;
	soloFeedbacks[actID] = {
		label: 		 'Any Solo Active',
		options: [
			{
				type: 	'checkbox',
				label: 	'Blink?',
				id:		'blink',
				default: 0
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: 0
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(168, 168, 0)
			},
		],
		callback: function(feedback, bank) {
			var opt = feedback.options;
			var fbType = feedback.type;
			var stat = self.xStat[self.fbToStat[fbType]];

			if (stat.isOn) {
				if (opt.blink) {		// wants blink
					if (self.blinkingFB[stat.fbID]) {
						self.blinkingFB[stat.fbID] = false;
						// blink off
						return;
					} else {
						self.blinkingFB[stat.fbID] = true;
					}
				}
				return { color: opt.fg, bgcolor: opt.bg };
			} else if (self.blinkingFB[stat.fbID]) {
				delete self.blinkingFB[stat.fbID];
			}

		}
	};

	Object.assign(self.xStat, stat);
	Object.assign(self.actionDefs, soloActions);
	Object.assign(self.toggleFeedbacks, soloFeedbacks);
};

instance.prototype.build_talk = function () {
	var self = this;
	var basePfx = '/cfg/talk/'
	var baseID = 'talk';
	var talkActions = {};
	var stat = {};
	var talkFeedbacks = {};
	var newAct;
	var newFB;

	var talkBus =	{
		id: 'bus',
		type: 'dropdown',
		label: 'Bus',
		default: 'A',
		choices: [
			{ id: 'A', label: 'Talkback A' },
			{ id: 'B', label: 'Talkback B' }
		]
	}

	var talkDest = {
		id: 'dest',
		type: 'dropdown',
		label: 'Destination',
		choices: []
	}

	for (var bus of ['A','B']) {
		stat[basePfx + bus + '/$on'] = {
			fbID: baseID,
			isOn: false,
			polled: 0,
			valid: false
		}
		for (var n=1; n<=16; n++) {
			var dest = 'B' + n;
			stat[basePfx + bus + '/' + dest ] ={
				fbID: baseID + '_d',
				isOn: false,
				polled: 0,
				valid: false
			};
			if ('A' == bus) {
				talkDest.choices.push({
					id: dest,
					label: 'Bus ' + n
				});
			}
		}
		for (var n=1; n<=4; n++) {
			var dest = 'M' + n;
			stat[basePfx + bus + '/' + dest ] = {
				fbID: baseID + '_d',
				isOn: false,
				polled: 0,
				valid: false
			};
			if ('A' == bus) {
				talkDest.choices.push({
					id: dest,
					label: 'Main ' + n
				});
			}
		}
	}

	talkDest.default = 'B1';

	// TB A/B on/off
	newAct = {
		id:	'talk',
		label: 'Talkback',
		description: 'Turn Talkback On/Off',
		options: [
			talkBus,
			{
				id: 'on',
				type: 'dropdown',
				label: 'State',
				default: '1',
				choices: self.CHOICES_ON_OFF
			}
		]
	}

	talkActions[newAct.id] = newAct;
	newAct = {
		id:	'talk_d',
		label: 'Talkback Destination',
		description: 'Enable Talkback Destination',
		options: [
			talkBus,
			talkDest,
			{
				id: 'on',
				type: 'dropdown',
				label: 'State',
				default: '1',
				choices: self.CHOICES_ON_OFF
			}
		]
	}
	talkActions[newAct.id] = newAct;

	var newFB = {
		id: 'talk',
		label: 'Color for Talkback On',
		options: [
			talkBus,
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(128, 0, 0)
			}
		],
		callback: function(feedback, bank) {
			var theNode = '/cfg/talk/' + feedback.options.bus + '/$on';
			var stat = self.xStat[theNode];
			if (stat.isOn) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
	}

	talkFeedbacks[newFB.id] = newFB;

	newFB = {
		id: 'talk_d',
		label: 'Color for Talkback Destination On',
		options: [
			talkBus,
			talkDest,
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0 , 102, 0)
			}
		],
		callback: function(feedback, bank) {
			var theNode = '/cfg/talk/' + feedback.options.bus + '/' + feedback.options.dest;
			var stat = self.xStat[theNode];
			if (stat.isOn) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
	};

	talkFeedbacks[newFB.id] = newFB;

	Object.assign(self.xStat, stat);
	Object.assign(self.actionDefs, talkActions);
	Object.assign(self.toggleFeedbacks, talkFeedbacks);
};

instance.prototype.pollStats = function () {
	var self = this;
	var stillNeed = false;
	var counter = 0;
	var timeNow = Date.now();
	var timeOut = timeNow - self.PollTimeout;
	var varCounter = self.varCounter;

	function ClearVars() {
		for (var id in self.xStat) {
			self.xStat[id].polled = 0;
			self.xStat[id].valid = false;
		}
	}

	var id;

	for (id in self.xStat) {
		if (!self.xStat[id].valid) {
			stillNeed = true;
			if (self.xStat[id].polled < timeOut) {
				self.sendOSC(id);
				// self.debug("sending " + id);
				self.xStat[id].polled = timeNow;
				counter++;
				if (counter > self.PollCount) {
					break;
				}
			}
		}
	}

	if (self.analyzing) {
		if (varCounter < 200) {
			self.varCounter = varCounter;
		} else {
			stillNeed = false;
		}
	}

	if (!stillNeed) {
		if (self.analyzing) {
			//pause counting while resetting data
			self.needStats = false;
			var d = (timeNow - self.timeStart) / 1000;
			self.log('info', 'Pass complete (' + varCounter + '@' + (varCounter / d).toFixed(1) + ')');
			if (self.passTimeout < self.detVars.endTimeout) {
				self.passTimeout += 200;
				self.PollTimeout = self.passTimeout;
				self.varCounter = 0;
				self.timeStart = Date.now();
				stillNeed = true;
			} else if (self.passCount < self.detVars.endCount) {
				self.passTimeout = self.detVars.startTimeout;
				self.PollTimeout = self.passTimeout;
				self.passCount += 1;
				self.varCounter = 0;
				self.PollCount = self.passCount;
				self.timeStart = Date.now();
				stillNeed = true;
			} else {
				self.analyzing = false;
			}
			if (self.analyzing) {
				ClearVars();
				self.log('info', `Sync Started (${self.PollCount}/${self.PollTimeout})`);
			}
		} else {
			self.status(self.STATUS_OK,"Mixer Status loaded");
			var c = Object.keys(self.xStat).length;
			var d = (timeNow - self.timeStart) / 1000;
			self.log('info', 'Sync complete (' + c + '@' + (c / d).toFixed(1) + ')');
		}
	}
	self.needStats = stillNeed;
};

instance.prototype.firstPoll = function () {
	var self = this;
	var id;

	self.timeStart = Date.now();
	self.sendOSC('/?',[]);
	self.pollStats();
	self.pulse();
};

instance.prototype.stepsToFader = function (i, steps) {
	var res = i / ( steps - 1 );

	return Math.floor(res * 10000) / 10000;
}

instance.prototype.faderToDB = function ( f, asString ) {
// “f” represents OSC float data. f: [0.0, 1.0]
// “d” represents the dB float data. d:[-oo, +10]

	// float Lin2db(float lin) {
	// 	if (lin <= 0.0) return -144.0;
	// 	if (lin < 0.062561095) return (lin - 0.1875) * 30. / 0.0625;
	// 	if (lin < 0.250244379) return (lin - 0.4375) / 0.00625;
	// 	if (lin < 0.500488759) return (lin - 0.6250) / 0.0125;
	// 	if (lin < 1.0) return (lin - 0.750) / 0.025;
	// 	return 10.;

	var self = this;
	var d = 0;
	var steps = self.FADER_STEPS;

	if (f <= 0.0) {
		d = -144;
	} else if (f < 0.062561095) {
		d = (f - 0.1875) * 30.0 / 0.0625;
	} else if (f < 0.250244379) {
		d = (f - 0.4375) / 0.00625;
	} else if (f < 0.500488759) {
		d = (f - 0.6250) / 0.0125;
	} else if (f < 1.0) {
		d = (f - 0.750) / 0.025;
	} else {
		d = 10.0;
	}

	d = (Math.round(d * (steps - 0.5)) / steps)

	if (asString) {
		return (f==0 ? "-oo" : (d>=0 ? '+':'') + d.toFixed(1));
	} else {
		return d;
	}
};

instance.prototype.dbToFloat = function ( d ) {
	// “d” represents the dB float data. d:[-144, +10]
	// “f” represents OSC float data. f: [0.0, 1.0]
	var f = 0;

	if (d <= -90) {
		f = 0;
	} else if (d < -60.) {
		f = (d + 90.) / 480.;
	} else if (d < -30.) {
		f = (d + 70.) / 160.;
	} else if (d < -10.) {
		f = (d + 50.) / 80.;
	} else if (d <= 10.) {
		f = (d + 30.) / 40.;
	}

	return f;

};

instance.prototype.init_osc = function() {
	var self = this;
	var host = self.config.host;

	if (self.oscPort) {
		self.oscPort.close();
	}
	if (self.config.host === undefined) {
		self.status(self.STATUS_ERROR,'No host IP');
		self.log('error','No host IP');
	} else {
		self.oscPort = new OSC.UDPPort ({
			localAddress: "0.0.0.0",
			localPort: 2223 + self.port_offset,
			remoteAddress: self.config.host,
			remotePort: 2223,
			metadata: true
		});

		// listen for incoming messages
		self.oscPort.on('message', function(message, timeTag, info) {
			var args = message.args;
			var node = message.address;
			var leaf = node.split('/').pop();
			var v = 0;

			if (!self.needStats) {
				debug("received ", message, "from", info);
			}
			if (self.xStat[node] !== undefined) {
				if (args.length>1) {
					v = args[1].value;
				} else {
					v = args[0].value;
				}
				switch (leaf) {
				case 'on':
					self.xStat[node].isOn = (v == 1);
					self.checkFeedbacks(self.xStat[node].fbID);
					break;
				case 'mute':
				case 'led':
				case '$solo':
					self.xStat[node].isOn = (v == 1);
					if ('led' == leaf) {
						self.checkFeedbacks('col');
					}
					if ('$solo' == leaf) {
						var gs = true;
						if (v == 1){
							self.soloList.add(node);
						} else {
							self.soloList.delete(node);
							gs = (self.soloList.size > 0);
						}
						self.xStat['/$stat/solo'].isOn = gs;
					}
					self.checkFeedbacks(self.xStat[node].fbID);
					break;
				case 'fdr':
				case 'lvl':
					v = Math.floor(v * 10000) / 10000;
					self.xStat[node][leaf] = v;
					self.setVariable(self.xStat[node].dvID + '_p',Math.round(v * 100));
					self.setVariable(self.xStat[node].dvID + '_d',self.faderToDB(v,true));
					self.xStat[node].idx = self.fLevels[self.FADER_STEPS].findIndex((i) => i >= v);
					break;
				case 'name':
					// no name, use behringer default
					if (v=='') {
						v = self.xStat[node].defaultName;
					}
					if (node.match(/\/main/)) {
						v = v;
					}
					self.xStat[node].name = v;
					self.setVariable(self.xStat[node].dvID, v);
					break;
				case 'col':
					self.xStat[node].color = parseInt(args[0].value)
					self.checkFeedbacks(self.xStat[node].fbID);
					self.checkFeedbacks('led');
					break;
				case '$mono':
				case '$dim':
					self.xStat[node].isOn = (v == 1);
					self.checkFeedbacks(self.xStat[node].fbID);
					break;
				default:
					if ( node.match(/\$solo/)
					|| node.match(/^\/cfg\/talk\//)
					|| node.match(/^\/\$stat\/solo/) ) {
						self.xStat[node].isOn = (v == 1);
						self.checkFeedbacks(self.xStat[node].fbID);
					}
				}
				self.xStat[node].valid = true;
				self.varCounter += 1;
				if (self.needStats) {
					self.pollStats();
				} else {
					// debug(message);
				}
			} else if (leaf == '*') {
				// /?~~,s~~WING,192.168.1.71,PGM,ngc‐full,NO_SERIAL,1.07.2‐40‐g1b1b292b:develop~~~~
				var mixer_info = args[0].value.split(',');
				self.myMixer.ip = mixer_info[1]
				self.myMixer.name = mixer_info[2];
				self.myMixer.model = mixer_info[3];
				self.myMixer.serial = mixer_info[4];
				self.myMixer.fw = mixer_info[5];
				if ('WING_EMU' == mixer_info[4]) {
					self.PollTimeout = 3200;
					self.PollCount = 7;
				}
				self.setVariable('m_ip',	self.myMixer.ip);
				self.setVariable('m_name',	self.myMixer.name);
				self.setVariable('m_model', self.myMixer.model);
				self.setVariable('m_serial', self.myMixer.serial);
				self.setVariable('m_fw', self.myMixer.fw);
			}
			// else {
			// 	debug(message.address, args);
			// }
		});

		self.oscPort.on('ready', function() {
			self.status(self.STATUS_WARNING,"Loading status");
			self.log('info', `Sync Started (${self.PollCount}/${self.PollTimeout})`);
			self.firstPoll();
			self.heartbeat = setInterval( function () { self.pulse(); }, 9000);
			self.blinker = setInterval( function() { self.blink(); }, 1000);
			self.fader = setInterval( function() { self.doFades(); }, 1000 / self.fadeResolution);
		});

		self.oscPort.on('close', function() {
			if (self.heartbeat) {
				clearInterval(self.heartbeat);
				delete self.heartbeat;
			}
			if (self.blinker) {
				clearInterval(self.blinker);
				delete self.blinker;
			}
			if (self.fader) {
				clearInterval(self.fader);
				delete self.fader;
			}
		});

		self.oscPort.on('error', function(err) {
			self.log('error', "Error: " + err.message);
			self.status(self.STATUS_ERROR, err.message);
			if (self.heartbeat) {
				clearInterval(self.heartbeat);
				delete self.heartbeat;
			}
			if (self.blinker) {
				clearInterval(self.blinker);
				delete self.blinker;
			}
			if (self.fader) {
				clearInterval(self.fader);
				delete self.fader;
			}
		});

		self.oscPort.open();
	}
};

// define instance variables
instance.prototype.init_variables = function() {
	var self = this;

	var variables = [
		{
			label: 'WING IP Address',
			name:  'm_ip',
		},
		{
			label: 'WING Name',
			name:  'm_name'
		},
		{
			label: 'WING Model',
			name:  'm_model'
		},
		{
			label: 'WING Serial Number',
			name:  'm_serial'
		},
		{
			label: 'WING Firmware',
			name:  'm_fw'
		// },
		// {
		// 	label: 'Current Snapshot Name',
		// 	name:  's_name'
		// },
		// {
		// 	label: 'Current Snapshot Index',
		// 	name:  's_index'
		}
	];
	variables.push.apply(variables, self.variableDefs);

	for (var i in variables) {
		self.setVariable(variables[i].name);
	}
	self.setVariableDefinitions(variables);
};

// define instance feedbacks
instance.prototype.init_feedbacks = function() {
	var self = this;

	var feedbacks = {
		// snap_color: {
		// 	label: 'Color on Current Snapshot',
		// 	description: 'Set Button colors when this Snapshot is loaded',
		// 	options: [
		// 		{
		// 			type: 'colorpicker',
		// 			label: 'Foreground color',
		// 			id: 'fg',
		// 			default: '16777215'
		// 		},
		// 		{
		// 			type: 'colorpicker',
		// 			label: 'Background color',
		// 			id: 'bg',
		// 			default: self.rgb(0, 128, 0)
		// 		},
		// 		{
		// 			type: 'number',
		// 			label: 'Snapshot to match',
		// 			id: 'theSnap',
		// 			default: 1,
		// 			min: 1,
		// 			max: 64,
		// 			range: false,
		// 			required: true
		// 		}
		// 	],
		// 	callback: function(feedback, bank) {
		// 		if (feedback.options.theSnap == self.currentSnapshot.index) {
		// 			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		// 		}
		// 	}
		// }
	};
	Object.assign(feedbacks,this.toggleFeedbacks);
	Object.assign(feedbacks,this.colorFeedbacks);
	this.setFeedbackDefinitions(feedbacks);
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			tooltip: 'The IP of the WING console',
			width: 6,
			regex: this.REGEX_IP
		}
		// ,
		// {
		// 	type: 	'checkbox',
		// 	label: 	'Analyze',
		// 	id:		'analyze',
		// 	tooltip: 'Cycle through console sync timing variables\nThis will temporarily disable the module',
		// 	default: 0
		// }
	];
};

// When module gets deleted
instance.prototype.destroy = function() {
	if (this.heartbeat) {
		clearInterval(this.heartbeat);
		delete this.heartbeat;
	}
	if (this.blinker) {
		clearInterval(this.blinker);
		delete this.blinker;
	}
	if (this.fader) {
		clearInterval(this.fader);
		delete this.fader;
	}
	if (this.oscPort) {
		this.oscPort.close();
	}
	debug("destroy", this.id);
};

instance.prototype.sendOSC = function (node, arg) {
	var self = this;

	if (self.oscPort) {
		self.oscPort.send({
			address: node,
			args: arg
		});
		// self.debug('sending ',node, (arg? arg:''));
	}
};

instance.prototype.sendUDP = function (data) {
	var self = this;
	var bytes = Buffer.from(data, 'hex');

	if (self.udpPort) {
		self.udpPort.send(data);
	}
};

instance.prototype.build_choices = function() {
	var self = this;
	var strips;
	var buses;
	var bMax;

	// discreet float values for faders (1540)
	for (var i = 0; i < self.FADER_STEPS; i++) {
		self.fLevels[self.FADER_STEPS][i] = self.stepsToFader(i,self.FADER_STEPS);
	}

	self.STORE_LOCATION = [];

	for (var i = 1; i <=10; i++) {
		var i2 = ('0' + i.toString()).slice(-2);

		self.STORE_LOCATION.push( {
			label: `Global ${i}`,
			id: `gs_${i2}`
		})
	}

	self.CHOICES_ON_OFF = [
		{id: '1', label: 'On'},
		{id: '0', label: 'Off'},
		{id: '2', label: 'Toggle'}
	]

	strips = {
		type:     'dropdown',
		label:    'Strip',
		id:       'strip',
		choices:  [	],
		default:  ''
	};

	self.CHOICES_STRIP = {};

	for (var d in stripDef) {
		var s = stripDef[d];
		self.CHOICES_STRIP[d] = [];
		for (var i = s.min; i <= s.max; i++) {
			self.CHOICES_STRIP[d].push( {
				id: '/' + s.id + '/' + i,
				label: s.label + ' ' + i
			});
		}
	}

	for (var d in stripDef) {
		var s = stripDef[d];
		for (var i=s.min; i <= s.max; i++) {
			if (s.act == 'baseActions') {
				strips.choices.push( {
					id: '/' + s.id + '/' + i,
					label: s.label + ' ' + i
				});
			}
		}
	}

	strips.default = strips.choices[0].id;

	self.OPTIONS_STRIP_BASE = { ...strips };

	strips.choices = [];
	for (var d in stripDef) {
		var s = stripDef[d];
		for (var i=s.min; i <= s.max; i++) {
			strips.choices.push( {
				id: '/' + s.id + '/' + i,
				label: s.label + ' ' + i
			});
		}
	}

	self.OPTIONS_STRIP_ALL = { ...strips };

	self.CHOICES_BUS = {};

	for (var b in busDef) {
		var bus = busDef[b];
		self.CHOICES_BUS[b] = [];
		for (var d in bus) {
			var s = stripDef[d];
			for (var i=1; i<=bus[d]; i++) {
				self.CHOICES_BUS[b].push( {
					id: '/' + s.sendID +  i,
					label: s.label + ' ' + i
				});
			}
		}
	}

	self.FADER_VALUES = [
		{ label: '- ∞',        id: '0.0' },
		{ label: '-50 dB: ',   id: '0.1251' },
		{ label: '-30 dB',     id: '0.251' },
		{ label: '-20 dB',     id: '0.375' },
		{ label: '-18 dB',     id: '0.4' },
		{ label: '-15 dB',     id: '0.437' },
		{ label: '-12 dB',     id: '0.475' },
		{ label: '-9 dB',      id: '0.525' },
		{ label: '-6 dB',      id: '0.6' },
		{ label: '-3 dB',      id: '0.675' },
		{ label: '-2 dB',      id: '0.7' },
		{ label: '-1 dB',      id: '0.725' },
		{ label: '0 dB',       id: '0.75' },
		{ label: '+1 dB',      id: '0.775' },
		{ label: '+2 dB',      id: '0.8' },
		{ label: '+3 dB',      id: '0.825' },
		{ label: '+4 dB',      id: '0.85' },
		{ label: '+5 dB',      id: '0.875' },
		{ label: '+6 dB',      id: '0.9' },
		{ label: '+9 dB',      id: '0.975' },
		{ label: '+10 dB',     id: '1.0' }
	];

	self.COLOR_VALUES = [
		{ label: 'Gray blue',	id: '1',	fg: self.rgb(162, 224, 235) },
		{ label: 'Medium blue',	id: '2',	fg: self.rgb( 64, 242, 252) },
		{ label: 'Dark blue',	id: '3',	fg: self.rgb( 64, 181, 235) },
		{ label: 'Turquoise',	id: '4',	fg: self.rgb( 36, 252, 237) },
		{ label: 'Green',		id: '5',	fg: self.rgb(  1, 242,  49) },
		{ label: 'Olive green',	id: '6',	fg: self.rgb(197, 223,  61) },
		{ label: 'Yellow',		id: '7',	fg: self.rgb(254, 242,   0) },
		{ label: 'Orange',		id: '8',	fg: self.rgb(252, 141,  51) },
		{ label: 'Red',			id: '9',	fg: self.rgb(252,  50,  50) },
		{ label: 'Coral',		id: '10',	fg: self.rgb(254, 145, 104) },
		{ label: 'Pink',		id: '11',	fg: self.rgb(251, 161, 249) },
		{ label: 'Mauve',		id: '12',	fg: self.rgb(161, 141, 254) }
	];

	self.TAPE_FUNCITONS = [
		{ label: 'STOP',                id: '0' },
		{ label: 'PLAY PAUSE',          id: '1' },
		{ label: 'PLAY',                id: '2' },
		{ label: 'RECORD PAUSE',        id: '3' },
		{ label: 'RECORD',              id: '4' },
		{ label: 'FAST FORWARD',        id: '5' },
		{ label: 'REWIND',              id: '6' }
	];
}

instance.prototype.init_actions = function(system) {
	var self = this;
	var newActions = {};

	Object.assign(newActions, self.actionDefs);

	self.system.emit('instance_actions', self.id, newActions);
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var subAct = action.action.slice(-2);
	var opt = action.options;
	var fVal;
	var needEcho = true;
	var arg = [];

	// calculate new fader/level float
	// returns a 'new' float value
	// or undefined for store or crossfade
	function fadeTo(cmd, opt) {
		var stat = self.xStat[cmd]
		var node = cmd.split('/').pop();
		var opTicks = parseInt(opt.ticks);
		var steps = self.FADER_STEPS;
		var span = parseFloat(opt.duration);
		var oldVal = stat[node];
		var oldIdx = stat.idx;
		var byVal = opTicks * steps / 100;
		var newIdx = Math.min(steps-1,Math.max(0, oldIdx + Math.round(byVal)));
		var slot = opt.store == 'me' ? cmd : opt.store;
		var r, byVal, newIdx;

		switch (subAct) {
			case '_a':			// adjust +/- (pseudo %)
				byVal = opTicks * steps / 100;
				newIdx = Math.min(steps-1,Math.max(0, oldIdx + Math.round(byVal)));
				r = self.fLevels[steps][newIdx];
			break;
			case '_r':			// restore
				r = slot && self.tempStore[slot] !== undefined ? self.tempStore[slot] : -1;
			break;
			case '_s':			// store
				if (slot) {		// sanity check
					self.tempStore[slot] = stat[node];
				}
				r = undefined;
				// the 'store' actions are internal to this module only
				// r is left undefined since there is nothing to send
			break;
			default:			// set new value
				r = self.dbToFloat(opt.fad);
		}
		// set up cross fade?
		if (span>0 && r >= 0) {
			var xSteps = span / (1000 / self.fadeResolution);
			var xDelta = Math.floor((r - oldVal) / xSteps * 10000) / 10000;
			if (xDelta == 0) { // already there
				r = undefined;
			} else {
				self.crossFades[cmd] = {
					steps: xSteps,
					delta: xDelta,
					startVal: oldVal,
					finalVal: r,
					atStep: 1
				}
				// start the xfade
				r = oldVal + xDelta;
				needEcho = false;
			}
		}
		self.debug(`---------- ${oldIdx}:${oldVal} by ${byVal}(${opTicks}) fadeTo ${newIdx}:${r} ----------`);
		if (r !== undefined) {
			r = self.faderToDB(r)
		}
		return r;
	}

	// internal function for action (not anonymous)
	// self is properly scoped to next outer closure
	function setToggle(cmd, opt) {
		return 2 == parseInt(opt) ? (1-(self.xStat[cmd].isOn ? 1 : 0)) : parseInt(opt);
	}

	switch (action.action){

		case 'mute':
			cmd = opt.strip + '/mute';
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			};
		break;

		case 'fdr':
		case 'fdr_a':
		case 'fdr_s':
		case 'fdr_r':
			cmd = opt.strip + '/fdr';
			if ((fVal = fadeTo(cmd, opt)) === undefined) {
				cmd = undefined;
			} else {
				arg = {
					type: 'f',
					value: fVal
				};
			}
		break;

		case 'send_bm_on':
		case 'send_bmm_on':
		case 'send_m_on':
			cmd = opt.source + opt.bus + '/on';
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			};
		break;

		case 'send_bm_lvl':
		case 'send_bmm_lvl':
		case 'send_m_lvl':
		case 'send_bm_lvl_a':
		case 'send_bmm_lvl_a':
		case 'send_m_lvl_a':
		case 'send_bm_lvl_s':
		case 'send_bmm_lvl_s':
		case 'send_m_lvl_s':
		case 'send_bm_lvl_r':
		case 'send_bmm_lvl_r':
		case 'send_m_lvl_r':
			cmd = opt.source + opt.bus + '/lvl';
			if ((fVal = fadeTo(cmd, opt)) === undefined) {
				cmd = undefined;
			} else {
				arg = {
					type: 'f',
					value: fVal
				};
			}
		break;

		/* don't have details for this, yet
		 * It's probably in mon/1..2/level
		 */
		// case 'solo_level':
		// case 'solo_level_a':
		// 	cmd = '/config/solo/level';
		// 	if ((fVal = fadeTo(cmd, opt)) < 0) {
		// 		cmd = undefined;
		// 	} else {
		// 		arg = {
		// 			type: 'f',
		// 			value: fVal
		// 		};
		// 	}
		// break;

		case '$solo':
			cmd = opt.strip + '/$solo';
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			};

		break;

		case 'led':
			cmd = opt.strip + '/led';
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			};
		break;

		case 'name':
			arg = {
				type: "s",
				value: "" + opt.name
			};
			cmd = opt.strip + '/name';
		break;

		case 'col':
			arg = {
				type: 'i',
				value: parseInt(opt.col)
			};
			cmd = opt.strip + '/col';
		break;

		case 'icon':
			arg = {
				type: 'i',
				value: parseInt(opt.icon)
			};
			cmd = opt.strip + '/icon';
		break;

		case 'solo_mute':
		case 'solo_$dim':
		case 'solo_$mono':
			var cfg = action.action.split('_')[1]
			cmd = '/cfg/solo/' + cfg;
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.set)
			};
		break;

		case 'talk':
			cmd = '/cfg/talk/' + opt.bus + '/$on'
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			}
		break;

		case 'talk_d':
			cmd = '/cfg/talk/' + opt.bus + '/' + opt.dest;
			arg = {
				type: 'i',
				value: setToggle(cmd, opt.on)
			}
		break;

		case 'clearsolo':
			// WING does not have this as a command
			// so we keep track of 'solos' to reset each one
			for (var s of self.soloList) {
				self.sendOSC(s, {type: 'i', value: 0 });
				self.sendOSC(s,[]);
			}

		break;

		// case 'load_snap':
		// 	arg = {
		// 		type: 'i',
		// 		value: parseInt(opt.snap)
		// 	};
		// 	cmd = '/-snap/load';
		// break;

		// case 'tape':
		// 	arg = {
		// 		type: 'i',
		// 		value: parseInt(opt.tFunc)
		// 	};
		// 	cmd = '/-stat/tape/state';
		// break;
	}

	if (cmd !== undefined) {
		self.sendOSC(cmd,arg);
		self.debug(cmd, arg);
		// force a reply
		if (needEcho) {
			self.sendOSC(cmd,[]);
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
