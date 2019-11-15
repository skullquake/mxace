require(
	{
		packages:[
			{
				name:'_ace',
				location:'/widgets/AceEditor/lib/ace-1.4.1/',
				main:'ace'
			}
		]
	},
	[
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"mxui/dom",
		"dojo/dom",
		"dojo/dom-prop",
		"dojo/dom-geometry",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/text",
		"dojo/html",
		"dojo/_base/event",
		"_ace"
	],
	function (
		declare,
		_WidgetBase,
		dom,
		dojoDom,
		dojoProp,
		dojoGeometry,
		dojoClass,
		dojoStyle,
		dojoConstruct,
		dojoArray,
		lang,
		dojoText,
		dojoHtml,
		dojoEvent,
		_ace
	){
		"use strict";
		return declare(
			"AceEditor.widget.AceEditor",
			[
				_WidgetBase
			],
			{
				// Internal variables.
				attr_val:null,
				enum_lang:null,
				enum_theme:null,
				bool_editable:null,
				bool_vikeys:null,
				bool_minlines:null,
				bool_maxlines:null,
				col_cmd:null,
				editor:null,
				div_editor:null,
				bool_fullscreen:false,
				obj_container_style_original:null,
				subscription:null,
				idx_theme:0,
				arr_theme:[
					"ambiance",
					"chaos",
					"chrome",
					"clouds",
					"clouds_midnight",
					"cobalt",
					"crimson_editor",
					"dawn",
					"dracula",
					"dreamweaver",
					"eclipse",
					"github",
					"gob",
					"gruvbox",
					"idle_fingers",
					"iplastic",
					"katzenmilch",
					"kr_theme",
					"kuroir",
					"merbivore",
					"merbivore_soft",
					"mono_industrial",
					"monokai",
					"pastel_on_dark",
					"solarized_dark",
					"solarized_light",
					"sqlserver",
					"terminal",
					"textmate",
					"tomorrow",
					"tomorrow_night",
					"tomorrow_night_blue",
					"tomorrow_night_bright",
					"tomorrow_night_eighties",
					"twilight",
					"vibrant_ink",
					"xcode",
				],
				idx_lang:0,
				arr_lang:[
					"ABAP",
					"ABC",
					"ActionScript",
					"ADA",
					"Apache_Conf",
					"AsciiDoc",
					"Assembly_x86",
					"AutoHotKey",
					"BatchFile",
					"C9Search",
					"C_Cpp",
					"Cirru",
					"Clojure",
					"Cobol",
					"coffee",
					"ColdFusion",
					"CSharp",
					"CSS",
					"Curly",
					"D",
					"Dart",
					"Diff",
					"Dockerfile",
					"Dot",
					"Dummy",
					"DummySyntax",
					"Eiffel",
					"EJS",
					"Elixir",
					"Elm",
					"Erlang",
					"Forth",
					"FTL",
					"Gcode",
					"Gherkin",
					"Gitignore",
					"Glsl",
					"golang",
					"Groovy",
					"HAML",
					"Handlebars",
					"Haskell",
					"haXe",
					"HTML",
					"HTML_Ruby",
					"INI",
					"Io",
					"Jack",
					"Jade",
					"Java",
					"JavaScript",
					"JSON",
					"JSONiq",
					"JSP",
					"JSX",
					"Julia",
					"LaTeX",
					"LESS",
					"Liquid",
					"Lisp",
					"LiveScript",
					"LogiQL",
					"LSL",
					"Lua",
					"LuaPage",
					"Lucene",
					"Makefile",
					"Markdown",
					"Mask",
					"MATLAB",
					"MEL",
					"MUSHCode",
					"MySQL",
					"Nix",
					"ObjectiveC",
					"OCaml",
					"Pascal",
					"Perl",
					"pgSQL",
					"PHP",
					"Powershell",
					"Praat",
					"Prolog",
					"Properties",
					"Protobuf",
					"Python",
					"R",
					"RDoc",
					"RHTML",
					"Ruby",
					"Rust",
					"SASS",
					"SCAD",
					"Scala",
					"Scheme",
					"SCSS",
					"SH",
					"SJS",
					"Smarty",
					"snippets",
					"Soy_Template",
					"Space",
					"SQL",
					"Stylus",
					"SVG",
					"Tcl",
					"Tex",
					"Text",
					"Textile",
					"Toml",
					"Twig",
					"Typescript",
					"Vala",
					"VBScript",
					"Velocity",
					"Verilog",
					"VHDL",
					"XML",
					"XQuery",
					"YAML"
				],
				_handles:null,
				_contextObj:null,
				constructor: function () {
					this._handles = [];
				},
				postCreate: function () {
					//logger.debug(this.id + ".postCreate");
					//--------------------------------------------------------------------------------
					//load toast css
					//--------------------------------------------------------------------------------
					this.div_editor=dojo.create(
						"div",
						{
							id:this.id+'editor',
							style:'height:8px;width:auto;',
							innerHTML:'#include<stdio.h>\int main(){}'
						},
						this.domNode
					);
					this.editor=ace.edit(this.id+'editor');//this.div_editor);
					this.editor.setOptions(
						{
							maxLines: this.int_minlines,
							minLines: this.int_maxlines
						}
					);
					this.editor.setTheme("ace/theme/"+this.enum_theme);
					this.editor.getSession().setMode("ace/mode/"+this.enum_lang.toLowerCase());
					this.editor.focus();
					//--------------------------------------------------------------------------------
					//configure vi options
					//--------------------------------------------------------------------------------
						//needs to be set before setting up config
					this.editor.setKeyboardHandler("ace/keyboard/vim");
					ace.config.loadModule(
						'ace/keyboard/vim',
						lang.hitch(this,function(module){
							var VimApi = module.CodeMirror.Vim;
							this.col_cmd.forEach(
								lang.hitch(this,function(a,b){
									VimApi.defineEx(
										a.str_cmd,
										a.str_cmd,
										lang.hitch(this,function(cm,input){
											if(this._contextObj!=null){
												//proc arg string for > [do this better later]
												//	remove last > if exists
												var argString='';
												if(
													input.args!=null&&
													input.args[input.args.length-1]=='>'
												){
													argString=input.args.splice(0,input.args.length-1).join(' ')
												}else{
													argString=input.argString;
												}
												this._contextObj.set('cm',argString);

												this._execMf(
													a.mf_cmd,
													this._contextObj.getGuid(),
													lang.hitch(
														this,
														function(str){
															if(
																input.args!=null&&
																input.args[input.args.length-1]=='>'
															){
																	this.editor.insert(str);
															}else{
																cm.openNotification(
																	'<span style="color: red">'+
																	str+
																	'</span>',
																	{bottom: true, duration: 5000}
																);
															}
														}
													)
												);
											}else{
											}
										})
									);
								})
							)
						})
					);
					if(this.bool_vikeys){
						this.editor.setKeyboardHandler("ace/keyboard/vim");
					}else{
						this.editor.setKeyboardHandler();
					}
					//--------------------------------------------------------------------------------
					//FullScreen
					//--------------------------------------------------------------------------------
					this.editor.commands.addCommand(
						{
							name:'Fullscreen',
							bindKey: {
								win:'Ctrl-Alt-F',mac:'Command-Alt-F',
								sender:'editor|cli'
							},
							exec:dojo.hitch(
								this,
								function(env,args,request){
										//store
									if(this.obj_container_style_original==null){
										this.obj_container_style_original={};
										this.obj_container_style_original.width=dojo.getStyle(
											//this.editor.container,
											this.domNode,
											'width'
										);
										this.obj_container_style_original.height=dojo.getStyle(
											//this.editor.container,
											this.domNode,
											'height'
										);
										this.obj_container_style_original.zindex=dojo.getStyle(
											//this.editor.container,
											this.domNode,
											'z-index'
										);
									}
									if(this.bool_fullscreen){
										var n=this.domNode;
										dojo.style(n,"position","unset");
										dojo.style(n,"top","unset");
										dojo.style(n,"left","unset");
										dojo.style(n,"width",this.obj_container_style_original.width+"px");
										dojo.style(n,"height",this.obj_container_style_original.height+"px");
										dojo.style(n,"z-index",this.obj_container_style_original.zindex);
										this.editor.setOptions(
											{
												maxLines:this.int_maxlines
											}
										);
										this.bool_fullscreen=false;
									}else{
										var n=this.domNode;
										dojo.style(n,"position","fixed");
										dojo.style(n,"top","0px");
										dojo.style(n,"left","0px");
										dojo.style(n,"width","100%");
										dojo.style(n,"height","100%");
										dojo.style(n,"z-index","999");
										this.editor.setOptions(
											{
												maxLines:
													Math.floor(
														dojo.getStyle(
															this.domNode,"height"
														)
													)/
													this.editor.renderer.lineHeight
													-1	//statusbar
											}
										);
										this.bool_fullscreen=true;
									}
								}
							)
						}
					);
					//--------------------------------------------------------------------------------
					//Theme - Next
					//--------------------------------------------------------------------------------
					this.editor.commands.addCommand(
						{
							name:'Theme Next',
							bindKey: {
								win:'Alt-N',mac:'Command-N',
								sender:'editor|cli'
							},
							exec:dojo.hitch(
								this,
								function(env,args,request){
									console.log(this.idx_theme);
									this.idx_theme++;
									this.idx_theme%=this.arr_theme.length;
									this.editor.setTheme("ace/theme/"+this.arr_theme[this.idx_theme]);
								}
							)
						}
					);
					//--------------------------------------------------------------------------------
					//Theme - Previous
					//--------------------------------------------------------------------------------
					this.editor.commands.addCommand(
						{
							name:'Theme Previous',
							bindKey: {
								win:'Alt-P',mac:'Command-P',
								sender:'editor|cli'
							},
							exec:dojo.hitch(
								this,
								function(env,args,request){
									console.log(this.idx_theme);
									if(this.idx_theme==0){
										this.idx_theme=this.arr_theme.length-1;
									}else{
										this.idx_theme--;
									}
									this.idx_theme%=this.arr_theme.length;
									this.editor.setTheme("ace/theme/"+this.arr_theme[this.idx_theme]);
								}
							)
						}
					);
					//--------------------------------------------------------------------------------
					//toggle vi
					//--------------------------------------------------------------------------------
					this.editor.commands.addCommand(
						{
							name: 'toggleVi',
							bindKey: {
								win: 'Alt-J', mac: 'Command-J',
								sender: 'editor|cli'
							},
							exec:lang.hitch(this,function (env, args, request) {
								if(this.bool_vikeys){
									this.editor.setKeyboardHandler("ace/keyboard/vim");
									this.bool_vikeys=!this.bool_vikeys;

								}else{
									this.editor.setKeyboardHandler();
									this.bool_vikeys=!this.bool_vikeys;
								}
							})
						}
					);
					//--------------------------------------------------------------------------------
					//save
					//--------------------------------------------------------------------------------
					this.editor.commands.addCommand(
						{
							name: 'save',
							bindKey: {
								win: 'Alt-W', mac: 'Command-W',
								sender: 'editor|cli'
							},
							exec:lang.hitch(
								this,
								function(env,args,request) {
									if(this._contextObj!=null){
										this._contextObj.set(
											this.attr_val,
											this.editor.getValue()
										);
										mx.data.update(
											{
												guid:this._contextObj.getGuid(),
												//attr:this.attr_val
											}
										);
										//console.log('saving');
									}
								}
							)
						}
					);
					//--------------------------------------------------------------------------------
					//set vi keys
					//--------------------------------------------------------------------------------
					if(this.bool_vikeys){
						this.editor.setKeyboardHandler("ace/keyboard/vim");
						//--------------------------------------------------------------------------------
						//customise vi actions
						//--------------------------------------------------------------------------------
						//todo
					}else{
						//set to non vi
					}
					//--------------------------------------------------------------------------------
					//readonly
					//--------------------------------------------------------------------------------
					if(!this.bool_editable){
						this.editor.setOptions(
							{
								readOnly: true,
								highlightActiveLine: false,
								highlightGutterLine: false
							}
						);
						this.editor.renderer.$cursorLayer.element.style.opacity=0;
					}
					this.editor.getSession().on(
						'change',
						lang.hitch(
							this,
							function(){
								//--------------------------------------------------------------------------------
								//set context object value
								//--------------------------------------------------------------------------------
								if(this._contextObj!=null){
									//this.unsubscribe();
									//console.log('saving');
									this._contextObj.set(
										this.attr_val,
										this.editor.getValue()
									);
								}
							}
						)
					);
				},
				update: function (obj, callback) {
					//logger.debug(this.id + ".update");
					this._contextObj = obj;
					this._updateRendering(callback);
					if(this._contextObj!=null){
						// Subscribe to all changes in an MxObject
						//this.subscribe();
						if(this.attr_val!=null){
							this.editor.setValue(this._contextObj.get(this.attr_val), -1);
						}
					}else{
						//this.unsubscribe();
					}
				},
				resize: function (box) {
				},
				uninitialize: function () {
				},
				_updateRendering: function (callback) {
					this._executeCallback(callback, "_updateRendering");
				},
				// Shorthand for running a microflow
				_execMf: function (mf, guid, cb) {
					//logger.debug(this.id + "._execMf");
					if (mf && guid) {
						mx.ui.action(mf, {
							params: {
								applyto: "selection",
								guids: [guid]
							},
							origin: this.mxform,
							callback: lang.hitch(this, function (objs) {
								if (cb && typeof cb === "function") {
									cb(objs);
								}
							}),
							error: function (error) {
								console.debug(error.description);
							}
						}, this);
					}
				},

				// Shorthand for executing a callback, adds logging to your inspector
				_executeCallback: function (cb, from) {
					//logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
					if (cb && typeof cb === "function") {
						cb();
					}
				},
				subscribe:function(){
					//logger.debug(this.id + ".subscribe")
					this.subscription = mx.data.subscribe(
						{
							guid: this._contextObj.getGuid(),
							attr: this.attr_val,
							callback: lang.hitch(
									this,
									function(guid,attr,value){
										this
										.editor
										.setValue(
											this
											._contextObj
											.get(
												this
												.attr_val
											),
											-1
										);
									}
								)
						}
					);

				},
				unsubscribe:function(){
					//logger.debug(this.id + ".unsubscribe")
					mx.data.unsubscribe(this.subscription);
				},
			}
		);
	}
);
//require(["AceEditor/widget/AceEditor"]);


/*

mx.data.create({
    entity: "Widget.Editor",
    callback: dojo.hitch(this,function(Editor) {
        console.log(Editor);
   

mx.data.create({
    entity: "Widget.Arg",
    callback: dojo.hitch(this,function(Arg) {
        console.log(Arg);
        Arg.addReference('Widget.Args_Editor',Editor.getGuid());

mx.data.commit({
    mxobj: Arg,
    callback: dojo.hitch(this,function() {
        console.log("Object committed");
mx.data.action({
    params: {
        actionname: "Widget.ivk_Editor_CMD_n",
        applyto: "selection",
        guids: [Editor.getGuid()]
    },
    callback: function(obj) {
        // expect single MxObject
    },
    error: function(error) {
        alert(error.message);
    }
});

    }),
    error: function(e) {
        console.error("Could not commit object:", e);
    }
});

    }),
    error: function(e) {
        console.error("Could not commit object:", e);
    }
});



 }),
    error: function(e) {
        console.error("Could not commit object:", e);
    }
});

*/
