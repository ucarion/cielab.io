import React from "react";
import { render } from "react-dom";
import App from "./App";

const container = document.createElement("div");
render(<App />, container);

document.body.appendChild(container);
