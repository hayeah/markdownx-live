import "./client.css";

import * as React from "react";

const ReactDOM = require("react-dom");

let SockJS = require("sockjs-client");

function connect() {
  let sockjs = new SockJS('/live');

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
      console.log("reconnecting sockjs.");
      connect();
    }, 2000);
  };
}

import * as ast from "markdownx-ast/ast";

import App from "./view/App";
import markdownx from "markdownx";

interface CustomComponentProps {
  content: {
    sections: ast.Section[],
    renderMarkdown: Function,
  };
}

function Bar(props: CustomComponentProps) {
  const {sections, renderMarkdown} = props.content;

  const content = renderMarkdown(sections[0].children);

  return (
    <div>
      <h3>the bar component</h3>
      {content}
    </div>
  );
}

const mdx = markdownx({
  Bar,
});

function loadMarkdown(src: string) {
  const doc = mdx.renderReact(mdx.parse(src));

  const top = (
    <div className="container">
      {doc}
    </div>
  );
  ReactDOM.render(top, document.querySelector("#react-root"));
}

function main() {
  connect();
}

window.addEventListener("load", main);
