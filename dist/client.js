(()=>{var e={360:(e,o,t)=>{var r=t(69)("http://127.0.0.1/lte",{autoConnect:!0,withCredentials:!0,reconnection:!0});r.on("res",(function(){var e;(e=console).log.apply(e,arguments)})),r.on("connect",(function(){r.emit("helloevent",{data:{name:"sx"}})})),r.on("error",(function(e){console.log("error",e)})),setTimeout((function(){r.emit("hello","hello")}),1e3)},294:e=>{"use strict";e.exports=require("babel-polyfill")},69:e=>{"use strict";e.exports=require("socket.io-client")}},o={};function t(r){var n=o[r];if(void 0!==n)return n.exports;var i=o[r]={exports:{}};return e[r](i,i.exports,t),i.exports}t(294),t(360)})();