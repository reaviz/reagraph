import React from "react";
import { GraphCanvas } from "../../src";
import { simpleEdges, simpleNodes } from "../assets/demo";

export default {
    title: 'Demos/Hotkeys',
    component: GraphCanvas
  };

  export const HotkeyA = () => (
    <GraphCanvas onHotkeyA={() => {alert('hotkeyA')}} nodes={simpleNodes} edges={simpleEdges} />
  );