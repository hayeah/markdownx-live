import * as React from "react";

const ReactDOM = require("react-dom");

let SockJS = require("sockjs-client");

function connect() {
  let sockjs = new SockJS('http://localhost:9876/live');

  sockjs.onopen = () => {
    console.log('[*] open', sockjs.protocol);
  };

  sockjs.onmessage = (e) => {
    let src: string = e.data;
    loadMarkdown(src);
  };

  sockjs.onclose = function() {
    console.log('[*] close');
    setTimeout(() => {
      console.log("reconnecting sockjs..");
      connect();
    }, 2000);
  };
}

import App from "./view/App";
import markdownx from "markdownx";

const {parse, render: renderMarkdownX} = markdownx({});

function loadMarkdown(src: string) {
  let doc = renderMarkdownX(parse(src));
  ReactDOM.render(doc, document.querySelector("#react-root"));
}

function main() {
  console.log("hello");

  connect();

  // loadMarkdown();
}

window.addEventListener("load", main);
